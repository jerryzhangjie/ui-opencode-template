/**
 * Session Context Manager
 * 
 * 统一管理 Agent 执行上下文链、任务依赖、结果缓存
 * 
 * Features:
 * - 上下文链追踪 (Context Chain)
 * - 任务依赖解析 (Dependency Resolution)
 * - 结果自动注入 (Auto-inject)
 * - 上下文压缩 (Compression)
 * 
 * 用法:
 *   const session = require('./session');
 *   node session.js --status    查看状态
 *   node session.js --history   查看历史
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const CONTEXT_DIR = '.opencode/context';
const SESSION_FILE = `${CONTEXT_DIR}/sessions.json`;
const CONTEXT_FILE = `${CONTEXT_DIR}/context_chain.json`;

const MAX_CHAIN_LENGTH = 50;
const MAX_CACHE_SIZE = 100;
const SESSION_TTL = 7 * 24 * 60 * 60 * 1000; // 7天

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

function generateId(prefix = 'ctx') {
  return `${prefix}_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
}

function loadSessions() {
  return loadJSON(SESSION_FILE, { sessions: [], activeSession: null });
}

function saveSessions(data) {
  return saveJSON(SESSION_FILE, data);
}

function loadContextChain() {
  return loadJSON(CONTEXT_FILE, { chain: [], lastId: null });
}

function saveContextChain(data) {
  return saveJSON(CONTEXT_FILE, data);
}

function createSession(metadata = {}) {
  const sessions = loadSessions();
  
  const session = {
    id: generateId('sess'),
    metadata: {
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...metadata
    },
    state: 'init',
    rootContextId: null,
    currentContextId: null,
    stats: {
      totalTasks: 0,
      completedTasks: 0,
      failedTasks: 0
    }
  };

  sessions.sessions.push(session);
  sessions.activeSession = session.id;
  saveSessions(sessions);

  return session;
}

function getSession(sessionId = null) {
  const sessions = loadSessions();
  const targetId = sessionId || sessions.activeSession;
  
  if (!targetId) return null;
  
  return sessions.sessions.find(s => s.id === targetId) || null;
}

function updateSession(sessionId, updates) {
  const sessions = loadSessions();
  const idx = sessions.sessions.findIndex(s => s.id === sessionId);
  
  if (idx !== -1) {
    sessions.sessions[idx] = {
      ...sessions.sessions[idx],
      ...updates,
      metadata: {
        ...sessions.sessions[idx].metadata,
        updatedAt: new Date().toISOString()
      }
    };
    saveSessions(sessions);
    return sessions.sessions[idx];
  }
  
  return null;
}

function appendContext(sessionId, ctx) {
  const chain = loadContextChain();
  
  const contextEntry = {
    id: ctx.id || generateId('ctx'),
    sessionId,
    agent: ctx.agent,
    taskId: ctx.taskId,
    taskType: ctx.taskType,
    input: ctx.input || {},
    output: ctx.output || null,
    artifacts: ctx.artifacts || [],
    dependencies: ctx.dependencies || [],
    summary: ctx.summary || '',
    status: ctx.status || 'pending',
    createdAt: new Date().toISOString(),
    completedAt: null,
    duration: null,
    isMilestone: ctx.isMilestone || false,
    isKeyDecision: ctx.isKeyDecision || false
  };

  chain.chain.push(contextEntry);
  chain.lastId = contextEntry.id;
  
  if (chain.chain.length > MAX_CHAIN_LENGTH) {
    compressChain(chain);
  }
  
  saveContextChain(chain);
  
  const session = getSession(sessionId);
  if (session) {
    updateSession(sessionId, {
      currentContextId: contextEntry.id,
      'stats.totalTasks': session.stats.totalTasks + 1
    });
  }

  return contextEntry;
}

function completeContext(contextId, result) {
  const chain = loadContextChain();
  const idx = chain.chain.findIndex(c => c.id === contextId);
  
  if (idx !== -1) {
    const ctx = chain.chain[idx];
    ctx.output = result.output || null;
    ctx.artifacts = result.artifacts || ctx.artifacts;
    ctx.summary = result.summary || summarize(result.output);
    ctx.status = result.success ? 'completed' : 'failed';
    ctx.completedAt = new Date().toISOString();
    ctx.duration = ctx.completedAt - new Date(ctx.createdAt).getTime();
    
    const session = getSession(ctx.sessionId);
    if (session) {
      updateSession(ctx.sessionId, {
        'stats.completedTasks': result.success ? session.stats.completedTasks + 1 : session.stats.completedTasks,
        'stats.failedTasks': result.success ? session.stats.failedTasks : session.stats.failedTasks + 1
      });
    }
    
    saveContextChain(chain);
    return ctx;
  }
  
  return null;
}

function getContextChain(sessionId, limit = null) {
  const chain = loadContextChain();
  let filtered = chain.chain.filter(c => !sessionId || c.sessionId === sessionId);
  
  if (limit) {
    filtered = filtered.slice(-limit);
  }
  
  return filtered;
}

function getLastContext(sessionId, agentType = null) {
  const chain = loadContextChain();
  const filtered = chain.chain.filter(c => c.sessionId === sessionId);
  
  if (agentType) {
    const idx = filtered.length - 1;
    for (let i = idx; i >= 0; i--) {
      if (filtered[i].agent === agentType && filtered[i].status === 'completed') {
        return filtered[i];
      }
    }
    return null;
  }
  
  return filtered.length > 0 ? filtered[filtered.length - 1] : null;
}

function getRelevantHistory(sessionId, task, limit = 5) {
  const chain = loadContextChain();
  const filtered = chain.chain.filter(c => c.sessionId === sessionId && c.status === 'completed');
  
  const relevant = filtered.filter(c => 
    c.taskType === task.type ||
    (c.artifacts && c.artifacts.some(a => task.artifacts?.includes(a))) ||
    task.keywords?.some(kw => c.summary?.includes(kw))
  );
  
  if (relevant.length > 0) {
    return relevant.slice(-limit).map(c => ({
      id: c.id,
      agent: c.agent,
      taskType: c.taskType,
      summary: c.summary,
      artifacts: c.artifacts,
      completedAt: c.completedAt
    }));
  }
  
  return filtered.slice(-limit).map(c => ({
    id: c.id,
    agent: c.agent,
    taskType: c.taskType,
    summary: c.summary,
    artifacts: c.artifacts,
    completedAt: c.completedAt
  }));
}

function resolveDependencies(taskId) {
  const chain = loadContextChain();
  const task = chain.chain.find(c => c.id === taskId);
  
  if (!task) return { task: null, dependencies: [], dependents: [] };
  
  const dependencies = task.dependencies.map(depId => 
    chain.chain.find(c => c.id === depId)
  ).filter(Boolean);
  
  const dependents = chain.chain.filter(c => 
    c.dependencies.includes(taskId)
  ).map(c => ({ id: c.id, agent: c.agent, taskType: c.taskType }));
  
  return { task, dependencies, dependents };
}

function buildContextTree(sessionId) {
  const chain = getContextChain(sessionId);
  const tree = [];
  const nodeMap = new Map();
  
  for (const ctx of chain) {
    const node = {
      id: ctx.id,
      agent: ctx.agent,
      taskType: ctx.taskType,
      summary: ctx.summary,
      status: ctx.status,
      children: [],
      depth: 0
    };
    
    nodeMap.set(ctx.id, node);
  }
  
  for (const ctx of chain) {
    const node = nodeMap.get(ctx.id);
    
    for (const depId of ctx.dependencies) {
      const parent = nodeMap.get(depId);
      if (parent) {
        node.depth = parent.depth + 1;
        parent.children.push(node);
      }
    }
    
    if (ctx.dependencies.length === 0) {
      tree.push(node);
    }
  }
  
  return { nodes: chain.length, tree };
}

function compressChain(chain) {
  const keep = Math.floor(MAX_CHAIN_LENGTH * 0.3);
  
  const recent = chain.chain.slice(-keep);
  const toCompress = chain.chain.slice(0, chain.chain.length - keep);
  
  if (toCompress.length > 0) {
    const compressed = {
      id: generateId('compressed'),
      type: 'compressed',
      summary: summarizeChain(toCompress),
      count: toCompress.length,
      firstId: toCompress[0].id,
      lastId: toCompress[toCompress.length - 1].id,
      createdAt: toCompress[0].createdAt,
      compressedAt: new Date().toISOString()
    };
    
    chain.chain = [compressed, ...recent];
  } else {
    chain.chain = recent;
  }
  
  return chain;
}

function summarize(data) {
  if (!data) return '';
  if (typeof data === 'string') {
    return data.substring(0, 200) + (data.length > 200 ? '...' : '');
  }
  if (data.summary) return data.summary;
  if (data.message) return data.message.substring(0, 200);
  if (Array.isArray(data)) {
    return `${data.length} items, ${summarize(data[0])}`;
  }
  return Object.keys(data).slice(0, 5).join(', ');
}

function summarizeChain(chain) {
  const agents = [...new Set(chain.map(c => c.agent))];
  const tasks = chain.length;
  const completed = chain.filter(c => c.status === 'completed').length;
  
  return `历史执行 ${tasks} 个任务 (${completed} 成功), 涉及 ${agents.join(', ')}`;
}

function injectContext(sessionId, agentType, currentTask) {
  const lastContext = getLastContext(sessionId, agentType);
  const relevantHistory = getRelevantHistory(sessionId, currentTask, 3);
  
  const injection = {
    previousOutput: lastContext?.output || null,
    previousArtifacts: lastContext?.artifacts || [],
    previousSummary: lastContext?.summary || '',
    relevantHistory
  };
  
  return injection;
}

function endSession(sessionId) {
  const sessions = loadSessions();
  const idx = sessions.sessions.findIndex(s => s.id === sessionId);
  
  if (idx !== -1) {
    sessions.sessions[idx].state = 'ended';
    sessions.sessions[idx].metadata.endedAt = new Date().toISOString();
    
    if (sessions.activeSession === sessionId) {
      sessions.activeSession = sessions.sessions
        .filter(s => s.state !== 'ended')
        .pop()?.id || null;
    }
    
    saveSessions(sessions);
    return sessions.sessions[idx];
  }
  
  return null;
}

function cleanupExpiredSessions() {
  const sessions = loadSessions();
  const now = Date.now();
  
  const before = sessions.sessions.length;
  
  sessions.sessions = sessions.sessions.filter(s => {
    if (s.state === 'ended') {
      const updated = new Date(s.metadata.updatedAt).getTime();
      return (now - updated) < SESSION_TTL;
    }
    return true;
  });
  
  saveSessions(sessions);
  return { removed: before - sessions.sessions.length, remaining: sessions.sessions.length };
}

function parseArgs() {
  const args = process.argv.slice(2);
  let status = false, history = false, clean = false, newSess = false, tree = false, help = false;
  let sessionId = null;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--status' || args[i] === '-s') status = true;
    else if (args[i] === '--history' || args[i] === '-h') history = true;
    else if (args[i] === '--clean') clean = true;
    else if (args[i] === '--new' || args[i] === '-n') newSess = true;
    else if (args[i] === '--tree') tree = true;
    else if (args[i] === '--session' || args[i] === '-i') sessionId = args[++i];
    else if (args[i] === '--help') help = true;
  }

  return { status, history, clean, new: newSess, tree, sessionId, help };
}

function main() {
  const opts = parseArgs();

  if (opts.help) {
    console.log(`
Session Context Manager

用法:
  node session.js --status         查看当前会话状态
  node session.js --history       查看上下文链历史
  node session.js --new           创建新会话
  node session.js --tree           查看上下文树
  node session.js --session <id>  指定会话ID
  node session.js --clean         清理过期会话
  node session.js --help          显示帮助

API:
  const session = require('./session');
  session.createSession({ ... })
  session.appendContext(sessId, { ... })
  session.injectContext(sessId, agentType, task)
`);
    return;
  }

  if (opts.new) {
    const sess = createSession({ source: 'cli' });
    console.log(`\n✓ 新会话已创建: ${sess.id}\n`);
    return;
  }

  if (opts.clean) {
    const result = cleanupExpiredSessions();
    console.log(`\n✓ 清理完成: 移除 ${result.removed} 个过期会话，剩余 ${result.remaining} 个\n`);
    return;
  }

  const sessions = loadSessions();
  const activeSession = getSession(opts.sessionId);

  if (opts.status) {
    console.log(`\n# 会话状态

当前会话: ${activeSession?.id || '无'}
状态: ${activeSession?.state || 'N/A'}
创建时间: ${activeSession?.metadata?.createdAt || 'N/A'}
最后更新: ${activeSession?.metadata?.updatedAt || 'N/A'}

统计:
  总任务数: ${activeSession?.stats?.totalTasks || 0}
  已完成: ${activeSession?.stats?.completedTasks || 0}
  失败: ${activeSession?.stats?.failedTasks || 0}

所有会话 (${sessions.sessions.length}):
`);
    sessions.sessions.forEach(s => {
      const mark = s.id === sessions.activeSession ? '●' : '○';
      console.log(`  ${mark} ${s.id} [${s.state}] - ${s.metadata?.updatedAt || 'N/A'}`);
    });
    console.log('');
    return;
  }

  if (opts.history || opts.tree) {
    const chain = getContextChain(opts.sessionId || sessions.activeSession?.id);
    
    if (opts.tree) {
      const result = buildContextTree(opts.sessionId || sessions.activeSession?.id);
      console.log(`\n# 上下文树 (${result.nodes} 节点)\n`);
      console.log(JSON.stringify(result.tree, null, 2));
    } else {
      console.log(`\n# 上下文链 (${chain.length} 条)\n`);
      chain.forEach((ctx, i) => {
        const statusIcon = ctx.status === 'completed' ? '✓' : ctx.status === 'failed' ? '✗' : '○';
        console.log(`${i + 1}. ${statusIcon} [${ctx.agent}] ${ctx.taskType || 'N/A'} - ${ctx.summary || '(进行中)'}`);
        if (ctx.artifacts?.length) {
          console.log(`   产出: ${ctx.artifacts.join(', ')}`);
        }
        if (ctx.dependencies?.length) {
          console.log(`   依赖: ${ctx.dependencies.join(', ')}`);
        }
      });
    }
    console.log('');
    return;
  }

  console.log('使用 --help 查看可用命令');
}

if (require.main === module) main();

module.exports = {
  createSession,
  getSession,
  updateSession,
  appendContext,
  completeContext,
  getContextChain,
  getLastContext,
  getRelevantHistory,
  resolveDependencies,
  buildContextTree,
  injectContext,
  endSession,
  cleanupExpiredSessions,
  summarize,
  generateId
};
