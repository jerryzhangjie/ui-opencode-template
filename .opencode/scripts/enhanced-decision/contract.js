/**
 * Agent Contract Protocol
 * 
 * 标准化 PM 与 SubAgent 之间的通信协议
 * 
 * 依赖: context/manager.js
 */

const manager = require('../../context/manager');

async function dispatch({ receiver, task, context = {}, artifacts = {}, requirements = {} }) {
  const txnId = manager.generateTxnId();

  const command = {
    command: 'dispatch',
    transactionId: txnId,
    timestamp: new Date().toISOString(),
    sender: 'project-manager',
    receiver,
    payload: {
      task,
      context: {
        projectState: manager.getState().currentState,
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

  manager.saveTransaction(command);

  return {
    transactionId: txnId,
    command,
    prompt: buildPrompt(command)
  };
}

async function parallelDispatch(tasks) {
  const parallelTaskId = `parallel_${Date.now()}`;
  const txnId = manager.generateTxnId();

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

  manager.saveTransaction(command);
  manager.createParallelTask(parallelTaskId, `并行任务: ${tasks.map(t => t.receiver).join(', ')}`, tasks.map(t => t.receiver));

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

  manager.saveTransaction(command);
  return command;
}

async function updateProgress({ milestoneId, progress, taskCompleted = null }) {
  const milestone = manager.updateMilestoneProgress(milestoneId, progress, taskCompleted);

  const txn = {
    command: 'state-update',
    timestamp: new Date().toISOString(),
    payload: { milestoneId, progress: milestone?.progress, taskCompleted }
  };
  manager.saveTransaction(txn);

  const data = manager.loadMilestones();
  return { milestone, overallProgress: data.progress };
}

async function queryProgress({ milestoneId = null, includeSubtasks = false } = {}) {
  const data = manager.loadMilestones();
  const state = manager.getState();

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
  return manager.addMilestone(name, description, deadline);
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
  const txs = manager.loadTransactions();
  return txs.find(t => t.transactionId === txnId);
}

function getRecentTransactions(limit = 10) {
  const txs = manager.loadTransactions();
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
  getRecentTransactions
};
