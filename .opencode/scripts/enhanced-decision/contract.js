/**
 * Agent Contract Protocol
 * 
 * 标准化 PM 与 SubAgent 之间的通信协议
 */

const fs = require('fs');
const path = require('path');

const STATE_FILE = '.opencode/context/state.json';
const MILESTONE_FILE = '.opencode/context/milestones.json';
const TRANSACTION_LOG = '.opencode/context/transactions.json';

function loadState() {
  try {
    if (fs.existsSync(STATE_FILE)) {
      return JSON.parse(fs.readFileSync(STATE_FILE, 'utf-8'));
    }
  } catch (e) {}
  return { currentState: 'init', history: [], parallelTasks: [] };
}

function saveState(state) {
  const dir = path.dirname(STATE_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
  return state;
}

function loadMilestones() {
  try {
    if (fs.existsSync(MILESTONE_FILE)) {
      return JSON.parse(fs.readFileSync(MILESTONE_FILE, 'utf-8'));
    }
  } catch (e) {}
  return { milestones: [], progress: 0 };
}

function saveMilestones(data) {
  const dir = path.dirname(MILESTONE_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(MILESTONE_FILE, JSON.stringify(data, null, 2));
  return data;
}

function loadTransactions() {
  try {
    if (fs.existsSync(TRANSACTION_LOG)) {
      return JSON.parse(fs.readFileSync(TRANSACTION_LOG, 'utf-8'));
    }
  } catch (e) {}
  return [];
}

function saveTransaction(tx) {
  const txs = loadTransactions();
  txs.push({ ...tx, loggedAt: new Date().toISOString() });
  if (txs.length > 100) txs.splice(0, txs.length - 100);
  
  const dir = path.dirname(TRANSACTION_LOG);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(TRANSACTION_LOG, JSON.stringify(txs, null, 2));
  return tx;
}

function generateTxnId() {
  return `txn_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
}

async function dispatch({ receiver, task, context = {}, artifacts = {}, requirements = {} }) {
  const txnId = generateTxnId();
  
  const command = {
    command: 'dispatch',
    transactionId: txnId,
    timestamp: new Date().toISOString(),
    sender: 'project-manager',
    receiver,
    payload: {
      task,
      context: {
        projectState: loadState().currentState,
        ...context
      },
      artifacts,
      requirements: {
        outputFormat: 'json',
        validationRequired: true,
        selfTestRequired: true,
        ...requirements
      }
    }
  };
  
  saveTransaction(command);
  
  return {
    transactionId: txnId,
    command,
    prompt: buildPrompt(command)
  };
}

async function parallelDispatch(tasks) {
  const parallelTaskId = `parallel_${Date.now()}`;
  const txnId = generateTxnId();
  
  const command = {
    command: 'parallel-dispatch',
    transactionId: txnId,
    timestamp: new Date().toISOString(),
    sender: 'project-manager',
    parallelTaskId,
    tasks: tasks.map(t => ({
      receiver: t.receiver,
      payload: {
        task: t.task,
        context: t.context || {},
        artifacts: t.artifacts || {},
        requirements: {
          outputFormat: 'json',
          validationRequired: true,
          selfTestRequired: true,
          ...t.requirements
        }
      }
    })),
    syncRequired: true,
    timeout: tasks[0]?.timeout || 300
  };
  
  saveTransaction(command);
  
  const state = loadState();
  if (!state.parallelTasks) state.parallelTasks = [];
  state.parallelTasks.push({
    id: parallelTaskId,
    description: `并行任务: ${tasks.map(t => t.receiver).join(', ')}`,
    agents: tasks.map(t => t.receiver),
    status: 'pending',
    createdAt: new Date().toISOString()
  });
  saveState(state);
  
  return {
    transactionId: txnId,
    parallelTaskId,
    command,
    prompts: tasks.map(t => ({
      receiver: t.receiver,
      prompt: buildPrompt({
        ...command,
        receiver: t.receiver,
        payload: command.tasks.find(s => s.receiver === t.receiver).payload
      })
    }))
  };
}

async function respond({ status, transactionId, taskId, result = null, error = null, questions = null }) {
  const command = {
    command: status === 'clarification-required' ? 'clarification-required' : 'result',
    transactionId,
    timestamp: new Date().toISOString(),
    status,
    payload: {}
  };
  
  if (status === 'success') {
    command.payload = {
      taskId,
      result,
      selfTestPassed: result?.selfTestPassed ?? true
    };
  } else if (status === 'failed') {
    command.payload = {
      taskId,
      error
    };
  } else if (status === 'clarification-required') {
    command.payload = {
      taskId,
      questions
    };
  }
  
  saveTransaction(command);
  return command;
}

async function updateProgress({ milestoneId, progress, taskCompleted = null }) {
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
    
    data.progress = Math.round(data.milestones.reduce((sum, m) => sum + m.progress, 0) / data.milestones.length);
  }
  
  saveMilestones(data);
  
  const txn = {
    command: 'state-update',
    timestamp: new Date().toISOString(),
    payload: { milestoneId, progress: milestone?.progress, taskCompleted }
  };
  saveTransaction(txn);
  
  return { milestone, overallProgress: data.progress };
}

async function queryProgress({ milestoneId = null, includeSubtasks = false } = {}) {
  const data = loadMilestones();
  const state = loadState();
  
  if (milestoneId) {
    const milestone = data.milestones.find(m => m.id === milestoneId);
    return {
      milestone,
      overallProgress: data.progress,
      currentState: state.currentState
    };
  }
  
  return {
    milestones: data.milestones.map(m => ({
      id: m.id,
      name: m.name,
      status: m.status,
      progress: m.progress,
      deadline: m.deadline,
      tasks: includeSubtasks ? m.tasks : undefined
    })),
    overallProgress: data.progress,
    currentState: state.currentState,
    parallelTasks: state.parallelTasks || [],
    lastUpdate: state.lastUpdate
  };
}

async function addMilestone({ name, description, deadline, tasks = [] }) {
  const data = loadMilestones();
  
  const milestone = {
    id: `ms_${Date.now()}`,
    name,
    description,
    deadline,
    status: 'pending',
    progress: 0,
    tasks,
    createdAt: new Date().toISOString()
  };
  
  data.milestones.push(milestone);
  saveMilestones(data);
  
  return milestone;
}

function buildPrompt(command) {
  const { payload } = command;
  const { task, context, artifacts, requirements } = payload;
  
  let prompt = `# 任务调度\n\n`;
  prompt += `## 任务信息\n`;
  prompt += `- 任务ID: ${task.id}\n`;
  prompt += `- 任务类型: ${task.type}\n`;
  prompt += `- 任务描述: ${task.description}\n`;
  if (task.priority) prompt += `- 优先级: ${task.priority}\n`;
  
  prompt += `\n## 上下文\n`;
  prompt += `- 项目状态: ${context.projectState || 'unknown'}\n`;
  prompt += `- 当前阶段: ${context.currentPhase || 'unknown'}\n`;
  if (context.intent) prompt += `- 意图: ${context.intent}\n`;
  if (context.workflow) prompt += `- 工作流: ${context.workflow}\n`;
  
  if (Object.keys(artifacts).length > 0) {
    prompt += `\n## 参考文档\n`;
    for (const [key, value] of Object.entries(artifacts)) {
      prompt += `- ${key}: ${value}\n`;
    }
  }
  
  prompt += `\n## 要求\n`;
  prompt += `- 输出格式: ${requirements.outputFormat || 'json'}\n`;
  if (requirements.validationRequired) prompt += `- 需要自测验证\n`;
  if (requirements.selfTestRequired) prompt += `- 需要自测通过\n`;
  
  prompt += `\n---\n\n请执行任务并返回结果。\n`;
  
  return prompt;
}

function getTransaction(txnId) {
  const txs = loadTransactions();
  return txs.find(t => t.transactionId === txnId);
}

function getRecentTransactions(limit = 10) {
  const txs = loadTransactions();
  return txs.slice(-limit);
}

module.exports = {
  dispatch,
  parallelDispatch,
  respond,
  updateProgress,
  queryProgress,
  addMilestone,
  buildPrompt,
  getTransaction,
  getRecentTransactions,
  loadState,
  loadMilestones
};
