/**
 * Dispatch - 任务调度
 * 
 * 功能：标准调度、并行调度、响应处理
 * 特性：超时控制、重试机制、上下文注入
 */

const state = require('./state');
const prompt = require('./prompt');
const session = require('../lib/session');
const cache = require('../lib/cache');

const DEFAULT_OPTIONS = {
  timeout: 300000,
  retry: 0,
  retryDelay: 1000,
  retryBackoff: 'exponential',
  autoInjectContext: true,
  useCache: true
};

let _currentAgent = 'project-manager';

function setCurrentAgent(agent) {
  _currentAgent = agent;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function executeWithTimeout(promise, timeout) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`TIMEOUT: Operation exceeded ${timeout}ms`));
    }, timeout);
    
    promise.then(
      result => {
        clearTimeout(timer);
        resolve(result);
      },
      error => {
        clearTimeout(timer);
        reject(error);
      }
    );
  });
}

async function dispatch({ 
  receiver, 
  task, 
  context = {}, 
  artifacts = {}, 
  requirements = {},
  options = {}
}) {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const txnId = state.generateTxnId();
  
  const currentSession = session.getSession() || session.getSession();
  const activeSessionId = currentSession?.id;
  
  const enrichedContext = {
    projectState: state.getState().currentState,
    ...context
  };
  
  if (opts.autoInjectContext && activeSessionId) {
    const contextInjection = session.injectContext(activeSessionId, receiver, {
      type: task.type,
      description: task.description,
      artifacts: Object.values(artifacts || {})
    });
    
    Object.assign(enrichedContext, {
      previousOutput: contextInjection.previousOutput,
      previousArtifacts: contextInjection.previousArtifacts,
      previousSummary: contextInjection.previousSummary,
      relevantHistory: contextInjection.relevantHistory
    });
  }
  
  let cachedResult = null;
  if (opts.useCache) {
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
      artifacts: artifacts || {},
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

  state.saveTransaction(command);
  
  if (activeSessionId) {
    const ctx = session.appendContext(activeSessionId, {
      agent: receiver,
      taskId: task.id || txnId,
      taskType: task.type,
      input: { task, artifacts, context: enrichedContext },
      artifacts: Object.values(artifacts || {})
    });
    
    command._meta.contextId = ctx.id;
  }

  return {
    transactionId: txnId,
    contextId: command._meta.contextId,
    command,
    prompt: prompt.buildPrompt(command),
    cachedResult
  };
}

async function dispatchWithRetry(params, retryOptions = {}) {
  const opts = { ...DEFAULT_OPTIONS, ...retryOptions };
  
  for (let attempt = 0; attempt <= opts.retry; attempt++) {
    try {
      return await dispatch(params);
    } catch (err) {
      if (attempt === opts.retry) {
        throw err;
      }
      
      const delay = opts.retryBackoff === 'exponential'
        ? opts.retryDelay * Math.pow(2, attempt)
        : opts.retryDelay;
      
      console.warn(`[dispatch] Attempt ${attempt + 1} failed: ${err.message}. Retrying in ${delay}ms...`);
      await sleep(delay);
    }
  }
}

async function parallelDispatch(tasks, options = {}) {
  const { autoInjectContext = true, useCache = true } = options;
  
  const parallelTaskId = `parallel_${Date.now()}`;
  const txnId = state.generateTxnId();
  
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

  state.saveTransaction(command);
  
  if (activeSessionId) {
    session.createParallelTask
      ? session.createParallelTask(parallelTaskId, `并行: ${tasks.map(t => t.receiver).join(', ')}`, tasks.map(t => t.receiver))
      : null;
  }

  const prompts = processedTasks.map(t => ({
    receiver: t.receiver,
    prompt: prompt.buildPrompt({
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
    command.payload = { taskId, error };
    
    if (contextId && sessionId) {
      session.completeContext(contextId, { output: error, success: false });
    }
    
  } else if (status === 'clarification-required') {
    command.payload = { taskId, questions };
  }

  state.saveTransaction(command);
  
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
  const milestone = state.updateMilestoneProgress(milestoneId, progress, taskCompleted);

  const txn = {
    command: 'state-update',
    timestamp: new Date().toISOString(),
    payload: { milestoneId, progress: milestone?.progress, taskCompleted }
  };
  state.saveTransaction(txn);

  const data = state.loadMilestones();
  return { milestone, overallProgress: data.progress };
}

module.exports = {
  setCurrentAgent,
  dispatch,
  dispatchWithRetry,
  parallelDispatch,
  respond,
  updateProgress,
  sleep,
  DEFAULT_OPTIONS
};
