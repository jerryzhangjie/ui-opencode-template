/**
 * Session Manager - 会话管理
 * 
 * 功能：会话创建/切换、上下文链管理
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DATA_DIR = path.join(__dirname, '..', 'data');
const SESSION_FILE = path.join(DATA_DIR, 'sessions.json');
const CONTEXT_FILE = path.join(DATA_DIR, 'context_chain.json');

const MAX_CHAIN_LENGTH = 50;
const SESSION_TTL = 7 * 24 * 60 * 60 * 1000;

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

function generateId(prefix = 'ctx') {
  return `${prefix}_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
}

function loadSessions() {
  return loadJSON(SESSION_FILE, { sessions: [], activeSession: null });
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
    stats: { totalTasks: 0, completedTasks: 0, failedTasks: 0 }
  };

  sessions.sessions.push(session);
  sessions.activeSession = session.id;
  saveJSON(SESSION_FILE, sessions);

  return session;
}

function getSession(sessionId = null) {
  const sessions = loadSessions();
  if (sessionId) {
    return sessions.sessions.find(s => s.id === sessionId);
  }
  return sessions.sessions.find(s => s.id === sessions.activeSession);
}

function getContextChain(sessionId = null, limit = 50) {
  const data = loadJSON(CONTEXT_FILE, { chain: [] });
  const session = getSession(sessionId);
  
  if (!session) return [];
  
  return data.chain
    .filter(c => c.sessionId === (sessionId || session.id))
    .slice(-limit);
}

function getLastContext(sessionId = null, agentType = null) {
  const chain = getContextChain(sessionId);
  if (!chain.length) return null;
  
  let filtered = chain;
  if (agentType) {
    filtered = chain.filter(c => c.agent === agentType);
  }
  
  return filtered[filtered.length - 1];
}

function appendContext(sessionId, context) {
  const data = loadJSON(CONTEXT_FILE, { chain: [] });
  const session = getSession(sessionId);
  
  if (!session) return null;
  
  const ctx = {
    id: generateId('ctx'),
    sessionId: sessionId || session.id,
    ...context,
    status: 'pending',
    createdAt: new Date().toISOString()
  };

  data.chain.push(ctx);
  
  if (data.chain.length > MAX_CHAIN_LENGTH) {
    data.chain = data.chain.slice(-MAX_CHAIN_LENGTH);
  }
  
  saveJSON(CONTEXT_FILE, data);
  
  if (session) {
    session.currentContextId = ctx.id;
    const sessions = loadSessions();
    const idx = sessions.sessions.findIndex(s => s.id === session.id);
    if (idx >= 0) {
      sessions.sessions[idx] = session;
      saveJSON(SESSION_FILE, sessions);
    }
  }

  return ctx;
}

function completeContext(contextId, result) {
  const data = loadJSON(CONTEXT_FILE, { chain: [] });
  const ctx = data.chain.find(c => c.id === contextId);
  
  if (ctx) {
    ctx.status = result.success ? 'completed' : 'failed';
    ctx.output = result.output;
    ctx.summary = result.summary;
    ctx.completedAt = new Date().toISOString();
    saveJSON(CONTEXT_FILE, data);
  }
  
  return ctx;
}

function injectContext(sessionId, agentType, task) {
  const lastContext = getLastContext(sessionId, agentType);
  
  return {
    previousOutput: lastContext?.output || null,
    previousArtifacts: lastContext?.artifacts || [],
    previousSummary: lastContext?.summary || null,
    relevantHistory: getContextChain(sessionId, 5).filter(c => c.agent !== agentType)
  };
}

if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args[0] === '--new') {
    const s = createSession({ source: 'cli' });
    console.log(`Created session: ${s.id}`);
  } else if (args[0] === '--status') {
    const s = getSession();
    console.log(s ? `Active: ${s.id}` : 'No active session');
  } else if (args[0] === '--history') {
    const chain = getContextChain();
    console.log(`Chain length: ${chain.length}`);
    chain.slice(-5).forEach(c => {
      console.log(`- [${c.agent}] ${c.taskType}: ${c.summary || 'pending'}`);
    });
  } else {
    console.log('Usage: node session.js --new|--status|--history');
  }
}

module.exports = {
  createSession,
  getSession,
  getContextChain,
  getLastContext,
  appendContext,
  completeContext,
  injectContext
};
