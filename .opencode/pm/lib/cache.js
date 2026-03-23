/**
 * Cache Manager - 缓存管理
 * 
 * 功能：结果缓存、相似度匹配、TTL/LRU
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DATA_DIR = path.join(__dirname, '..', 'data');
const CACHE_FILE = path.join(DATA_DIR, 'cache.json');

const DEFAULT_TTL = 30 * 60 * 1000;  // 30分钟
const MAX_CACHE_SIZE = 100;
const SIMILARITY_THRESHOLD = 0.85;

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

function generateFingerprint(task) {
  const str = JSON.stringify({
    type: task.type,
    description: task.description,
    artifacts: task.artifacts
  });
  return crypto.createHash('md5').update(str).digest('hex');
}

function loadCache() {
  return loadJSON(CACHE_FILE, { entries: [], stats: { hits: 0, misses: 0 } });
}

function saveCache(data) {
  return saveJSON(CACHE_FILE, data);
}

function cleanup() {
  const data = loadCache();
  const now = Date.now();
  
  const before = data.entries.length;
  data.entries = data.entries.filter(e => {
    const age = now - new Date(e.cachedAt).getTime();
    return age < (e.ttl || DEFAULT_TTL);
  });
  
  if (data.entries.length < before) {
    saveCache(data);
  }
  
  return { removed: before - data.entries.length, remaining: data.entries.length };
}

function get(task) {
  const data = loadCache();
  const fingerprint = generateFingerprint(task);
  
  const exact = data.entries.find(e => e.fingerprint === fingerprint);
  if (exact) {
    data.stats.hits++;
    saveCache(data);
    return { type: 'exact', entry: exact, similarity: 1 };
  }
  
  for (const entry of data.entries) {
    const similarity = calculateSimilarity(task.description, entry.taskDescription);
    if (similarity >= SIMILARITY_THRESHOLD) {
      data.stats.hits++;
      saveCache(data);
      return { type: 'similar', entry, similarity };
    }
  }
  
  data.stats.misses++;
  saveCache(data);
  return null;
}

function set(task, result) {
  const data = loadCache();
  
  const entry = {
    id: `cache_${Date.now()}`,
    taskType: task.type,
    taskDescription: task.description,
    taskArtifacts: task.artifacts,
    fingerprint: generateFingerprint(task),
    result,
    cachedAt: new Date().toISOString(),
    ttl: DEFAULT_TTL
  };
  
  data.entries.push(entry);
  
  if (data.entries.length > MAX_CACHE_SIZE) {
    data.entries = data.entries.slice(-MAX_CACHE_SIZE);
  }
  
  saveCache(data);
  return entry;
}

function clear() {
  saveCache({ entries: [], stats: { hits: 0, misses: 0 } });
  return { cleared: true };
}

function getStats() {
  const data = loadCache();
  const total = data.stats.hits + data.stats.misses;
  return {
    entries: data.entries.length,
    hits: data.stats.hits,
    misses: data.stats.misses,
    hitRate: total > 0 ? (data.stats.hits / total * 100).toFixed(1) + '%' : '0%'
  };
}

function calculateSimilarity(text1, text2) {
  if (!text1 || !text2) return 0;
  if (text1 === text2) return 1;
  
  const set1 = new Set(text1.toLowerCase().split(''));
  const set2 = new Set(text2.toLowerCase().split(''));
  
  const intersection = [...set1].filter(c => set2.has(c));
  const union = new Set([...set1, ...set2]);
  
  return intersection.length / union.size;
}

if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args[0] === '--stats') {
    const stats = getStats();
    console.log(`Entries: ${stats.entries}, Hits: ${stats.hits}, Misses: ${stats.misses}, Hit Rate: ${stats.hitRate}`);
  } else if (args[0] === '--clear') {
    clear();
    console.log('Cache cleared');
  } else if (args[0] === '--clean') {
    const result = cleanup();
    console.log(`Cleaned: ${result.removed} removed, ${result.remaining} remaining`);
  } else {
    console.log('Usage: node cache.js --stats|--clear|--clean');
  }
}

module.exports = {
  get,
  set,
  clear,
  cleanup,
  getStats,
  calculateSimilarity,
  DEFAULT_TTL,
  MAX_CACHE_SIZE,
  SIMILARITY_THRESHOLD
};
