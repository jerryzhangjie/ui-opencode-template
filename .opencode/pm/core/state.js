/**
 * State Manager - 状态管理
 * 
 * 功能：状态管理、里程碑管理、事务记录
 * 特性：原子性写入、异常状态支持
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const STATE_FILE = path.join(DATA_DIR, 'state.json');
const MILESTONE_FILE = path.join(DATA_DIR, 'milestones.json');
const TRANSACTION_FILE = path.join(DATA_DIR, 'transactions.json');

const MAX_HISTORY = 20;
const MAX_TRANSACTIONS = 20;
const PARALLEL_TASK_CLEAN_AGE = 60 * 60 * 1000;

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function loadJSON(filePath, defaultValue) {
  try {
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    }
  } catch (e) {
    console.error(`Error loading ${filePath}:`, e.message);
  }
  return defaultValue;
}

function saveJSON(filePath, data) {
  ensureDir();
  const tempFile = filePath + '.tmp';
  fs.writeFileSync(tempFile, JSON.stringify(data, null, 2));
  fs.renameSync(tempFile, filePath);
  return data;
}

function loadState() {
  return loadJSON(STATE_FILE, {
    currentState: 'init',
    history: [],
    parallelTasks: [],
    lastUpdate: null
  });
}

function saveState(state) {
  return saveJSON(STATE_FILE, state);
}

function loadMilestones() {
  return loadJSON(MILESTONE_FILE, { milestones: [], progress: 0 });
}

function saveMilestones(data) {
  return saveJSON(MILESTONE_FILE, data);
}

function loadTransactions() {
  return loadJSON(TRANSACTION_FILE, []);
}

function saveTransaction(tx) {
  const txs = loadTransactions();
  txs.push({ ...tx, loggedAt: new Date().toISOString() });
  if (txs.length > MAX_TRANSACTIONS) {
    txs.splice(0, txs.length - MAX_TRANSACTIONS);
  }
  return saveJSON(TRANSACTION_FILE, txs);
}

function getState() {
  return loadState();
}

function setState(newState, note = '', branch = null) {
  const state = loadState();
  const timestamp = new Date().toISOString();

  const entry = {
    from: state.currentState,
    to: newState,
    time: timestamp,
    note,
    branch: branch || 'main'
  };

  if (branch) {
    if (!state.branches) state.branches = {};
    if (!state.branches[branch]) state.branches[branch] = [];
    state.branches[branch].push(entry);
  } else {
    state.history = [...(state.history || []), entry].slice(-MAX_HISTORY);
  }

  state.currentState = newState;
  state.lastUpdate = timestamp;
  saveState(state);

  return {
    changed: state.history.length > 0,
    state,
    transition: { from: entry.from, to: newState }
  };
}

function createParallelTask(taskId, description, agents) {
  const state = loadState();
  if (!state.parallelTasks) state.parallelTasks = [];

  const task = {
    id: taskId,
    description,
    agents,
    status: 'pending',
    createdAt: new Date().toISOString(),
    completed: [],
    failed: []
  };

  state.parallelTasks.push(task);
  saveState(state);
  return task;
}

function updateParallelTask(taskId, agentId, status, result = null) {
  const state = loadState();
  const task = state.parallelTasks.find(t => t.id === taskId);

  if (task) {
    if (status === 'completed') {
      task.completed.push({ agent: agentId, result, time: new Date().toISOString() });
    } else if (status === 'failed') {
      task.failed.push({ agent: agentId, result, time: new Date().toISOString() });
    }

    if (task.completed.length === task.agents.length) {
      task.status = 'completed';
    } else if (task.failed.length > 0) {
      task.status = 'partial';
    } else {
      task.status = 'in_progress';
    }
    saveState(state);
  }

  return task;
}

function addMilestone(name, description = '', deadline = null) {
  const data = loadMilestones();
  const milestone = {
    id: `ms_${Date.now()}`,
    name,
    description,
    deadline,
    status: 'pending',
    progress: 0,
    tasks: [],
    createdAt: new Date().toISOString()
  };

  data.milestones.push(milestone);
  data.progress = calculateOverallProgress(data.milestones);
  saveMilestones(data);

  return milestone;
}

function updateMilestoneProgress(milestoneId, progress, taskCompleted = null) {
  const data = loadMilestones();
  const milestone = data.milestones.find(m => m.id === milestoneId);

  if (milestone) {
    milestone.progress = Math.min(Math.max(progress, 0), 100);
    milestone.status = progress >= 100 ? 'completed' : progress > 0 ? 'in_progress' : 'pending';

    if (taskCompleted) {
      milestone.tasks.push({
        ...taskCompleted,
        completedAt: new Date().toISOString()
      });
    }

    data.progress = calculateOverallProgress(data.milestones);
    saveMilestones(data);
  }

  return milestone;
}

function calculateOverallProgress(milestones) {
  if (milestones.length === 0) return 0;
  const total = milestones.reduce((sum, m) => sum + m.progress, 0);
  return Math.round(total / milestones.length);
}

function getProgress() {
  const state = loadState();
  const milestones = loadMilestones();

  return {
    currentState: state.currentState,
    overallProgress: milestones.progress,
    milestones: milestones.milestones.map(m => ({
      id: m.id,
      name: m.name,
      status: m.status,
      progress: m.progress,
      deadline: m.deadline
    })),
    parallelTasks: state.parallelTasks || [],
    lastUpdate: state.lastUpdate
  };
}

function generateTxnId() {
  return `txn_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
}

function cleanOldData() {
  const txs = loadTransactions();
  const cleaned = txs.slice(-MAX_TRANSACTIONS);
  if (cleaned.length < txs.length) {
    saveJSON(TRANSACTION_FILE, cleaned);
  }

  const state = loadState();
  const now = Date.now();
  state.parallelTasks = state.parallelTasks.filter(t => {
    if (t.status === 'completed' || t.status === 'partial') {
      const created = new Date(t.createdAt).getTime();
      return (now - created) < PARALLEL_TASK_CLEAN_AGE;
    }
    return true;
  });

  if (state.parallelTasks) saveState(state);

  return { transactions: cleaned.length, parallelTasks: state.parallelTasks?.length || 0 };
}

if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args[0] === '--status') {
    const state = getState();
    console.log(`\n# 项目状态\n\n当前状态: ${state.currentState}\n最后更新: ${state.lastUpdate || '无'}\n`);
  } else if (args[0] === '--progress') {
    const prog = getProgress();
    console.log(`\n# 项目进度\n\n整体进度: ${prog.overallProgress}%\n当前状态: ${prog.currentState}\n里程碑: ${prog.milestones.length}\n`);
  } else if (args[0] === '--clean') {
    const result = cleanOldData();
    console.log(`清理完成: ${result.transactions} 事务, ${result.parallelTasks} 并行任务`);
  } else {
    console.log('Usage: node state.js --status|--progress|--clean');
  }
}

module.exports = {
  loadState, saveState,
  loadMilestones, saveMilestones,
  loadTransactions, saveTransaction,
  getState, setState,
  createParallelTask, updateParallelTask,
  addMilestone, updateMilestoneProgress, getProgress,
  cleanOldData, generateTxnId,
  MAX_TRANSACTIONS, MAX_HISTORY
};
