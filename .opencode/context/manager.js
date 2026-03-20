/**
 * Context Manager - 统一状态管理模块
 * 
 * 所有状态读写操作的唯一入口
 * 
 * 用法:
 *   const { getState, setState } = require('./manager');
 *   node manager.js --status   查看状态
 *   node manager.js --progress 查看进度
 *   node manager.js --clean    清理过期数据
 */

const fs = require('fs');
const path = require('path');

const CONTEXT_DIR = '.opencode/context';
const STATE_FILE = `${CONTEXT_DIR}/state.json`;
const MILESTONE_FILE = `${CONTEXT_DIR}/milestones.json`;
const TRANSACTION_FILE = `${CONTEXT_DIR}/transactions.json`;

const MAX_HISTORY = 20;
const MAX_TRANSACTIONS = 20;
const PARALLEL_TASK_CLEAN_AGE = 60 * 60 * 1000;

function ensureDir() {
  if (!fs.existsSync(CONTEXT_DIR)) {
    fs.mkdirSync(CONTEXT_DIR, { recursive: true });
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
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
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

function addMilestone(name, description, deadline = null) {
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

function cleanOldTransactions() {
  const txs = loadTransactions();
  const cleaned = txs.slice(-MAX_TRANSACTIONS);
  if (cleaned.length < txs.length) {
    saveJSON(TRANSACTION_FILE, cleaned);
    return { removed: txs.length - cleaned.length, remaining: cleaned.length };
  }
  return { removed: 0, remaining: cleaned.length };
}

function cleanOldParallelTasks() {
  const state = loadState();
  const now = Date.now();
  const before = state.parallelTasks.length;

  state.parallelTasks = state.parallelTasks.filter(t => {
    if (t.status === 'completed' || t.status === 'partial') {
      const created = new Date(t.createdAt).getTime();
      return (now - created) < PARALLEL_TASK_CLEAN_AGE;
    }
    return true;
  });

  if (state.parallelTasks.length < before) {
    saveState(state);
  }

  return { removed: before - state.parallelTasks.length, remaining: state.parallelTasks.length };
}

function cleanAll() {
  const txResult = cleanOldTransactions();
  const ptResult = cleanOldParallelTasks();

  return {
    transactions: txResult,
    parallelTasks: ptResult,
    cleanedAt: new Date().toISOString()
  };
}

function generateTxnId() {
  return `txn_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
}

function parseArgs() {
  const args = process.argv.slice(2);
  let status = false, progress = false, clean = false, help = false;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--status' || args[i] === '-s') status = true;
    else if (args[i] === '--progress' || args[i] === '-p') progress = true;
    else if (args[i] === '--clean' || args[i] === '-c') clean = true;
    else if (args[i] === '--help' || args[i] === '-h') help = true;
  }

  return { status, progress, clean, help };
}

function main() {
  const opts = parseArgs();

  if (opts.help) {
    console.log(`
Context Manager - 统一状态管理

用法:
  node context/manager.js --status    查看状态
  node context/manager.js --progress  查看进度
  node context/manager.js --clean     清理过期数据
  node context/manager.js --help      显示帮助

API:
  const { getState, setState, addMilestone, ... } = require('./manager');
`);
    return;
  }

  if (opts.status) {
    const state = getState();
    console.log(`\n# 项目状态

当前状态: ${state.currentState}
最后更新: ${state.lastUpdate || '无'}
并行任务: ${state.parallelTasks?.length || 0}
历史记录: ${state.history?.length || 0}
`);
    return;
  }

  if (opts.progress) {
    const prog = getProgress();
    console.log(`\n# 项目进度

整体进度: ${prog.overallProgress}%
当前状态: ${prog.currentState}
最后更新: ${prog.lastUpdate || '无'}

里程碑 (${prog.milestones.length}):`);
    if (prog.milestones.length === 0) {
      console.log('  (无里程碑)');
    } else {
      prog.milestones.forEach(m => {
        const bar = '█'.repeat(Math.round(m.progress / 10)) + '░'.repeat(10 - Math.round(m.progress / 10));
        console.log(`  [${bar}] ${m.name} (${m.progress}%) - ${m.status}`);
      });
    }

    if (prog.parallelTasks.length > 0) {
      console.log('\n并行任务:');
      prog.parallelTasks.forEach(t => {
        console.log(`  - ${t.id}: ${t.description} [${t.status}]`);
      });
    }
    console.log('');
    return;
  }

  if (opts.clean) {
    const result = cleanAll();
    console.log(`\n# 清理完成

事务日志: 清理 ${result.transactions.removed} 条，剩余 ${result.transactions.remaining} 条
并行任务: 清理 ${result.parallelTasks.removed} 个，剩余 ${result.parallelTasks.remaining} 个
清理时间: ${result.cleanedAt}
`);
    return;
  }

  console.log('使用 --help 查看可用命令');
}

if (require.main === module) main();

module.exports = {
  loadState, saveState,
  loadMilestones, saveMilestones,
  loadTransactions, saveTransaction,
  getState, setState,
  createParallelTask, updateParallelTask,
  addMilestone, updateMilestoneProgress, getProgress,
  cleanAll, cleanOldTransactions, cleanOldParallelTasks,
  generateTxnId,
  MAX_TRANSACTIONS, MAX_HISTORY
};
