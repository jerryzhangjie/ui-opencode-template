/**
 * Result Cache Manager
 * 
 * 任务结果缓存，支持：
 * - 任务指纹匹配
 * - 相似任务缓存
 * - TTL 自动过期
 * - LRU 淘汰
 * 
 * 用法:
 *   const cache = require('./cache');
 *   node cache.js --stats     查看缓存统计
 *   node cache.js --clear     清空缓存
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const CACHE_FILE = '.opencode/context/cache.json';

const DEFAULT_TTL = 30 * 60 * 1000;
const MAX_CACHE_SIZE = 100;
const SIMILARITY_THRESHOLD = 0.85;

function ensureDir() {
  if (!fs.existsSync('.opencode/context')) {
    fs.mkdirSync('.opencode/context', { recursive: true });
  }
}

function loadCache() {
  try {
    if (fs.existsSync(CACHE_FILE)) {
      return JSON.parse(fs.readFileSync(CACHE_FILE, 'utf-8'));
    }
  } catch (e) {
    console.error('Error loading cache:', e.message);
  }
  return { entries: [], metadata: { created: new Date().toISOString(), hits: 0, misses: 0 } };
}

function saveCache(data) {
  ensureDir();
  fs.writeFileSync(CACHE_FILE, JSON.stringify(data, null, 2));
  return data;
}

function hash(str) {
  return crypto.createHash('sha256').update(str).digest('hex').substring(0, 16);
}

function generateFingerprint(task) {
  const normalized = {
    type: task.type || '',
    description: (task.description || '').toLowerCase().trim(),
    artifacts: [...(task.artifacts || [])].sort(),
    params: task.params || {}
  };
  
  return hash(JSON.stringify(normalized));
}

function extractKeyTerms(text) {
  const terms = new Set();
  
  const chinese = text.match(/[\u4e00-\u9fa5]{2,}/g) || [];
  const english = text.match(/[a-zA-Z]{3,}/g) || [];
  
  chinese.forEach(w => terms.add(w));
  english.forEach(w => terms.add(w.toLowerCase()));
  
  return terms;
}

function calculateSimilarity(task1, task2) {
  const terms1 = extractKeyTerms(task1.description || '');
  const terms2 = extractKeyTerms(task2.description || '');
  
  if (terms1.size === 0 || terms2.size === 0) return 0;
  
  const intersection = new Set([...terms1].filter(t => terms2.has(t)));
  const union = new Set([...terms1, ...terms2]);
  
  const jaccard = intersection.size / union.size;
  
  const typeMatch = task1.type === task2.type ? 0.3 : 0;
  
  const artifactOverlap = task1.artifacts && task2.artifacts
    ? [...task1.artifacts].filter(a => task2.artifacts.includes(a)).length / Math.max(task1.artifacts.length, 1)
    : 0;
  
  return Math.min(jaccard + typeMatch + artifactOverlap * 0.2, 1);
}

function get(task) {
  const cache = loadCache();
  const fp = generateFingerprint(task);
  
  const entry = cache.entries.find(e => e.fingerprint === fp);
  
  if (entry) {
    if (isExpired(entry)) {
      removeEntry(cache, entry.id);
      cache.metadata.misses++;
      saveCache(cache);
      return null;
    }
    
    entry.hits = (entry.hits || 0) + 1;
    entry.lastAccessed = new Date().toISOString();
    cache.metadata.hits++;
    saveCache(cache);
    
    return {
      hit: true,
      type: 'exact',
      entry
    };
  }
  
  const similar = findSimilar(cache, task);
  if (similar) {
    cache.metadata.hits++;
    saveCache(cache);
    return {
      hit: true,
      type: 'similar',
      similarity: similar.similarity,
      entry: similar.entry
    };
  }
  
  cache.metadata.misses++;
  saveCache(cache);
  return null;
}

function findSimilar(cache, task) {
  let best = null;
  
  for (const entry of cache.entries) {
    if (isExpired(entry)) continue;
    
    const similarity = calculateSimilarity(task, entry.task);
    
    if (similarity >= SIMILARITY_THRESHOLD && (!best || similarity > best.similarity)) {
      best = { entry, similarity };
    }
  }
  
  return best;
}

function set(task, result, ttl = DEFAULT_TTL) {
  const cache = loadCache();
  
  const fp = generateFingerprint(task);
  const existingIdx = cache.entries.findIndex(e => e.fingerprint === fp);
  
  const entry = {
    id: `cache_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
    fingerprint: fp,
    task: {
      type: task.type,
      description: task.description,
      artifacts: task.artifacts
    },
    result,
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + ttl).toISOString(),
    hits: 0,
    lastAccessed: new Date().toISOString(),
    ttl
  };
  
  if (existingIdx !== -1) {
    cache.entries[existingIdx] = entry;
  } else {
    cache.entries.push(entry);
    
    if (cache.entries.length > MAX_CACHE_SIZE) {
      evictLRU(cache);
    }
  }
  
  saveCache(cache);
  return entry;
}

function isExpired(entry) {
  if (!entry.expiresAt) return false;
  return new Date(entry.expiresAt).getTime() < Date.now();
}

function removeEntry(cache, entryId) {
  const idx = cache.entries.findIndex(e => e.id === entryId);
  if (idx !== -1) {
    cache.entries.splice(idx, 1);
  }
}

function evictLRU(cache) {
  if (cache.entries.length === 0) return;
  
  cache.entries.sort((a, b) => {
    const aTime = a.lastAccessed ? new Date(a.lastAccessed).getTime() : 0;
    const bTime = b.lastAccessed ? new Date(b.lastAccessed).getTime() : 0;
    return aTime - bTime;
  });
  
  const evicted = cache.entries.shift();
  return evicted;
}

function invalidate(pattern = null) {
  const cache = loadCache();
  let removed = 0;
  
  if (!pattern) {
    removed = cache.entries.length;
    cache.entries = [];
  } else {
    const before = cache.entries.length;
    cache.entries = cache.entries.filter(e => {
      if (pattern.type && e.task.type !== pattern.type) return true;
      if (pattern.keyword && !e.task.description?.includes(pattern.keyword)) return true;
      return false;
    });
    removed = before - cache.entries.length;
  }
  
  saveCache(cache);
  return { removed, remaining: cache.entries.length };
}

function clear() {
  const cache = loadCache();
  const count = cache.entries.length;
  
  cache.entries = [];
  cache.metadata = { created: new Date().toISOString(), hits: 0, misses: 0 };
  
  saveCache(cache);
  return { cleared: count };
}

function getStats() {
  const cache = loadCache();
  
  const validEntries = cache.entries.filter(e => !isExpired(e));
  const expiredEntries = cache.entries.filter(e => isExpired(e));
  
  const totalHits = cache.metadata.hits || 0;
  const totalMisses = cache.metadata.misses || 0;
  const hitRate = totalHits + totalMisses > 0 
    ? (totalHits / (totalHits + totalMisses) * 100).toFixed(1) + '%' 
    : 'N/A';
  
  return {
    total: cache.entries.length,
    valid: validEntries.length,
    expired: expiredEntries.length,
    maxSize: MAX_CACHE_SIZE,
    ttl: DEFAULT_TTL / 1000 / 60 + 'min',
    hitRate,
    totalHits,
    totalMisses,
    metadata: cache.metadata
  };
}

function cleanup() {
  const cache = loadCache();
  const before = cache.entries.length;
  
  cache.entries = cache.entries.filter(e => !isExpired(e));
  
  saveCache(cache);
  return { removed: before - cache.entries.length, remaining: cache.entries.length };
}

function parseArgs() {
  const args = process.argv.slice(2);
  let stats = false, clear = false, clean = false, get = false, help = false;
  let taskType = null;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--stats' || args[i] === '-s') stats = true;
    else if (args[i] === '--clear') clear = true;
    else if (args[i] === '--clean') clean = true;
    else if (args[i] === '--get') {
      get = true;
      taskType = args[++i];
    }
    else if (args[i] === '--help') help = true;
  }

  return { stats, clear, clean, get, taskType, help };
}

function main() {
  const opts = parseArgs();

  if (opts.help) {
    console.log(`
Result Cache Manager

用法:
  node cache.js --stats         查看缓存统计
  node cache.js --clear         清空所有缓存
  node cache.js --clean          清理过期条目
  node cache.js --get <type>     测试获取缓存
  node cache.js --help           显示帮助

API:
  const cache = require('./cache');
  cache.get(task)                获取缓存（精确或相似）
  cache.set(task, result)        设置缓存
  cache.invalidate({ type })     按条件失效
  cache.getStats()               获取统计信息
`);
    return;
  }

  if (opts.stats) {
    const stats = getStats();
    console.log(`\n# 缓存统计

缓存条目:
  总数: ${stats.total}
  有效: ${stats.valid}
  过期: ${stats.expired}
  上限: ${stats.maxSize}

性能:
  命中率: ${stats.hitRate}
  命中次数: ${stats.totalHits}
  未命中: ${stats.totalMisses}

配置:
  TTL: ${stats.ttl}
  相似度阈值: ${(SIMILARITY_THRESHOLD * 100)}%
`);
    return;
  }

  if (opts.clear) {
    const result = clear();
    console.log(`\n✓ 已清空缓存 (${result.cleared} 条)\n`);
    return;
  }

  if (opts.clean) {
    const result = cleanup();
    console.log(`\n✓ 清理完成: 移除 ${result.removed} 条过期缓存，剩余 ${result.remaining} 条\n`);
    return;
  }

  if (opts.get) {
    const result = get({ type: opts.taskType, description: 'test' });
    console.log(`\n查找 ${opts.taskType}: ${result ? `命中 (${result.type})` : '未命中'}\n`);
    return;
  }

  console.log('使用 --help 查看可用命令');
}

if (require.main === module) main();

module.exports = {
  generateFingerprint,
  calculateSimilarity,
  get,
  set,
  invalidate,
  clear,
  getStats,
  cleanup,
  SIMILARITY_THRESHOLD,
  MAX_CACHE_SIZE,
  DEFAULT_TTL
};
