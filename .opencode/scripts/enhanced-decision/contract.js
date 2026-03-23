/**
 * Agent Contract Protocol v2
 * 
 * 标准化 PM 与 SubAgent 之间的通信协议
 * 
 * Features:
 * - 上下文链追踪
 * - 结果缓存
 * - 智能上下文注入
 * 
 * 依赖: context/manager.js, context/session.js, context/cache.js
 */

const manager = require('../../context/manager');
const session = require('../../context/session');
const cache = require('../../context/cache');

let _currentAgent = 'project-manager';

function setCurrentAgent(agent) {
  _currentAgent = agent;
}

async function dispatch({ 
  receiver, 
  task, 
  context = {}, 
  artifacts = {}, 
  requirements = {},
  autoInjectContext = true,
  includeArtifacts = true,
  contextId = null,
  useCache = true,
  sessionId = null
}) {
  const txnId = manager.generateTxnId();
  
  const currentSession = session.getSession(sessionId) || session.getSession();
  const activeSessionId = currentSession?.id;
  
  const enrichedContext = {
    projectState: manager.getState().currentState,
    ...context
  };
  
  if (autoInjectContext && activeSessionId) {
    const contextInjection = session.injectContext(activeSessionId, receiver, {
      type: task.type,
      description: task.description,
      artifacts: Object.values(artifacts || {})
    });
    
    enrichedContext.previousOutput = contextInjection.previousOutput;
    enrichedContext.previousArtifacts = contextInjection.previousArtifacts;
    enrichedContext.previousSummary = contextInjection.previousSummary;
    enrichedContext.relevantHistory = contextInjection.relevantHistory;
  }
  
  let cachedResult = null;
  if (useCache) {
    const cacheCheck = cache.get({
      type: task.type,
      description: task.description,
      artifacts: Object.values(artifacts || {})
    });
    
    if (cacheCheck) {
      cachedResult = cacheCheck.entry.result;
      enrichedContext.cacheHit = {
        type: cacheCheck.type,
        fingerprint: cacheCheck.entry.fingerprint,
        similarity: cacheCheck.similarity
      };
    }
  }

  const command = {
    command: 'dispatch',
    transactionId: txnId,
    timestamp: new Date().toISOString(),
    sender: _currentAgent,
    receiver,
    payload: {
      task,
      context: enrichedContext,
      artifacts: includeArtifacts ? artifacts : {},
      requirements: {
        outputFormat: 'json',
        validationRequired: true,
        selfTestRequired: true,
        ...requirements
      }
    },
    _meta: {
      sessionId: activeSessionId,
      useCache: !!cachedResult
    }
  };

  manager.saveTransaction(command);
  
  if (activeSessionId) {
    const ctx = session.appendContext(activeSessionId, {
      agent: receiver,
      taskId: task.id || txnId,
      taskType: task.type,
      input: { task, artifacts, context: enrichedContext },
      dependencies: contextId ? [contextId] : [],
      artifacts: Object.values(artifacts || {})
    });
    
    command._meta.contextId = ctx.id;
  }

  return {
    transactionId: txnId,
    contextId: command._meta.contextId,
    command,
    prompt: buildPrompt(command),
    cachedResult
  };
}

async function parallelDispatch(tasks, options = {}) {
  const { autoInjectContext = true, useCache = true } = options;
  
  const parallelTaskId = `parallel_${Date.now()}`;
  const txnId = manager.generateTxnId();
  
  const currentSession = session.getSession() || session.getSession();
  const activeSessionId = currentSession?.id;

  const processedTasks = tasks.map((t, idx) => {
    const enrichedContext = { ...(t.context || {}) };
    
    if (autoInjectContext && activeSessionId) {
      const contextInjection = session.injectContext(activeSessionId, t.receiver, {
        type: t.task?.type,
        description: t.task?.description,
        artifacts: Object.values(t.artifacts || {})
      });
      
      Object.assign(enrichedContext, {
        previousOutput: contextInjection.previousOutput,
        previousArtifacts: contextInjection.previousArtifacts,
        previousSummary: contextInjection.previousSummary,
        relevantHistory: contextInjection.relevantHistory
      });
    }
    
    return {
      receiver: t.receiver,
      payload: {
        task: t.task,
        context: enrichedContext,
        artifacts: t.artifacts || {},
        requirements: {
          outputFormat: 'json',
          validationRequired: true,
          selfTestRequired: true,
          ...t.requirements
        }
      },
      index: idx
    };
  });

  const command = {
    command: 'parallel-dispatch',
    transactionId: txnId,
    timestamp: new Date().toISOString(),
    sender: _currentAgent,
    parallelTaskId,
    tasks: processedTasks,
    syncRequired: true,
    timeout: tasks[0]?.timeout || 300,
    _meta: { sessionId: activeSessionId }
  };

  manager.saveTransaction(command);
  
  if (activeSessionId) {
    session.createParallelTask
      ? session.createParallelTask(parallelTaskId, `并行: ${tasks.map(t => t.receiver).join(', ')}`, tasks.map(t => t.receiver))
      : null;
  }

  const prompts = processedTasks.map(t => ({
    receiver: t.receiver,
    prompt: buildPrompt({
      ...command,
      receiver: t.receiver,
      payload: t.payload
    })
  }));

  return {
    transactionId: txnId,
    parallelTaskId,
    command,
    prompts,
    sessionId: activeSessionId
  };
}

async function respond({ status, transactionId, taskId, result = null, error = null, questions = null, contextId = null, sessionId = null, useCache = true }) {
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
    
    if (useCache && result && sessionId) {
      cache.set(
        { type: result.taskType, description: result.taskDescription, artifacts: result.artifacts },
        result
      );
    }
    
    if (contextId && sessionId) {
      session.completeContext(contextId, {
        output: result,
        artifacts: result?.artifacts || [],
        summary: result?.summary || result?.message,
        success: true
      });
    }
    
  } else if (status === 'failed') {
    command.payload = {
      taskId,
      error
    };
    
    if (contextId && sessionId) {
      session.completeContext(contextId, {
        output: error,
        success: false
      });
    }
    
  } else if (status === 'clarification-required') {
    command.payload = {
      taskId,
      questions
    };
  }

  manager.saveTransaction(command);
  
  if (contextId && sessionId && status === 'clarification-required') {
    const chain = session.getContextChain(sessionId);
    const ctx = chain.find(c => c.id === contextId);
    if (ctx) {
      ctx.status = 'clarification-required';
      ctx.pendingQuestions = questions;
    }
  }

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
  prompt += `- 任务ID: ${task.id || 'N/A'}\n`;
  prompt += `- 任务类型: ${task.type || 'unknown'}\n`;
  prompt += `- 任务描述: ${task.description || 'N/A'}\n`;
  if (task.priority) prompt += `- 优先级: ${task.priority}\n`;

  prompt += `\n## 上下文\n`;
  prompt += `- 项目状态: ${context.projectState || 'unknown'}\n`;
  prompt += `- 当前阶段: ${context.currentPhase || 'unknown'}\n`;
  if (context.intent) prompt += `- 意图: ${context.intent}\n`;
  if (context.workflow) prompt += `- 工作流: ${context.workflow}\n`;
  
  if (context.cacheHit) {
    prompt += `- ⚠️ 缓存命中: ${context.cacheHit.type} (相似度 ${(context.cacheHit.similarity || 1) * 100}%)\n`;
  }
  
  if (context.previousSummary) {
    prompt += `\n## 前置执行摘要\n`;
    prompt += `${context.previousSummary}\n`;
  }
  
  if (context.relevantHistory && context.relevantHistory.length > 0) {
    prompt += `\n## 相关历史\n`;
    context.relevantHistory.forEach((h, i) => {
      prompt += `${i + 1}. [${h.agent}] ${h.summary}\n`;
      if (h.artifacts?.length) prompt += `   产出: ${h.artifacts.join(', ')}\n`;
    });
  }

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

function getContextChain(sessionId = null, limit = 50) {
  return session.getContextChain(sessionId, limit);
}

function getLastContext(sessionId = null, agentType = null) {
  return session.getLastContext(sessionId || session.getSession()?.id, agentType);
}

function injectContext(sessionId, agentType, task) {
  const sid = sessionId || session.getSession()?.id;
  return session.injectContext(sid, agentType, task);
}

function createSession(metadata) {
  return session.createSession(metadata);
}

function endSession(sessionId) {
  return session.endSession(sessionId);
}

function getCacheStats() {
  return cache.getStats();
}

function clearCache() {
  return cache.clear();
}

function cleanupCache() {
  return cache.cleanup();
}

module.exports = {
  setCurrentAgent,
  dispatch,
  parallelDispatch,
  respond,
  updateProgress,
  queryProgress,
  addMilestone,
  buildPrompt,
  getTransaction,
  getRecentTransactions,
  getContextChain,
  getLastContext,
  injectContext,
  createSession,
  endSession,
  getCacheStats,
  clearCache,
  cleanupCache
};
