/**
 * Decision Engine - 决策引擎
 * 
 * 功能：意图分类、工作流匹配、实体提取
 * 依赖：config/workflows.json, config/intents.json
 */

const fs = require('fs');
const path = require('path');

const CONFIG_DIR = path.join(__dirname, '..', 'config');
const WORKFLOWS = loadConfig('workflows.json');
const INTENTS = loadConfig('intents.json');

function loadConfig(name) {
  const file = path.join(CONFIG_DIR, name);
  return JSON.parse(fs.readFileSync(file, 'utf-8'));
}

const SYNONYMS = {
  '新': ['做', '建', '创建'],
  '一个': ['款', '个'],
  '系统': ['项目', '应用', '平台']
};

function tokenize(text) {
  const tokens = new Set();
  text = text.toLowerCase();
  
  const chinese = text.match(/[\u4e00-\u9fa5]+/g) || [];
  const english = text.match(/[a-z0-9]+/g) || [];

  chinese.forEach(word => {
    tokens.add(word);
    for (let i = 2; i <= Math.min(4, word.length); i++) {
      tokens.add(word.substring(0, i));
    }
  });

  english.forEach(word => {
    tokens.add(word);
    tokens.add(word.substring(0, Math.min(4, word.length)));
  });

  return tokens;
}

function calculateSimilarity(text1, text2) {
  const t1 = text1.toLowerCase();
  const t2 = text2.toLowerCase();

  if (t1 === t2) return 1.0;
  if (t1.includes(t2)) return Math.min(0.95, 0.5 + (t2.length / t1.length) * 0.45);
  if (t2.includes(t1)) return 0.9;

  const expandTokens = (text) => {
    const baseTokens = tokenize(text);
    const expanded = new Set(baseTokens);
    for (const word of baseTokens) {
      if (SYNONYMS[word]) {
        SYNONYMS[word].forEach(syn => expanded.add(syn));
      }
    }
    return expanded;
  };

  const words1 = expandTokens(t1);
  const words2 = expandTokens(t2);

  const intersection = [...words1].filter(w => words2.has(w));
  const union = new Set([...words1, ...words2]);

  if (union.size === 0) return 0;
  const jaccard = intersection.length / union.size;
  const lenBonus = Math.min(t2.length, 4) / 4 * 0.2;
  return Math.min(jaccard + lenBonus, 0.9);
}

function classifyIntent(input) {
  const lower = input.toLowerCase();
  for (const [intent, pattern] of Object.entries(INTENTS.patterns)) {
    const regex = new RegExp(pattern.slice(1, -1));
    if (regex.test(lower)) {
      return intent;
    }
  }
  return 'Action';
}

function matchWorkflow(input, workflows) {
  const results = [];

  for (const [name, config] of Object.entries(workflows)) {
    let score = 0;
    const matchedKeywords = [];

    for (const kw of config.keywords) {
      const similarity = calculateSimilarity(input, kw.text);
      const weightedScore = similarity * kw.weight;

      if (similarity > 0.2) {
        score += weightedScore;
        matchedKeywords.push({
          keyword: kw.text,
          similarity,
          weight: kw.weight,
          contribution: weightedScore
        });
      }
    }

    if (score > 0) {
      results.push({ name, score, matchedKeywords, config });
    }
  }

  results.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return (b.config.priority || 5) - (a.config.priority || 5);
  });

  return results;
}

function extractEntities(input) {
  const patterns = {
    page: /((?:登录|注册|首页|主页|列表|详情|设置|用户|订单|仪表盘|后台)页?)/,
    action: /((?:添加|修改|删除|查看|编辑|新建|导出|导入)[\w]+)/,
    severity: /(P0|P1|P2|P3|阻断|严重|一般|建议|低)/,
    tech: /(vue|react|typescript|python|node|java)/i
  };

  const entities = {};
  const severityMap = {
    'P0': 'P0', '阻断': 'P0',
    'P1': 'P1', '严重': 'P1',
    'P2': 'P2', '一般': 'P2',
    'P3': 'P3', '建议': 'P3', '低': 'P3'
  };

  for (const [key, pattern] of Object.entries(patterns)) {
    const match = pattern.exec(input);
    if (match) {
      entities[key] = key === 'severity' 
        ? (severityMap[match[1]] || match[1])
        : match[1];
    }
  }

  return entities;
}

function decide(userInput, context = {}) {
  const primaryIntent = classifyIntent(userInput);
  const workflowMatches = matchWorkflow(userInput, WORKFLOWS);

  const primary = workflowMatches[0] || { name: 'unknown', score: 0, config: {} };
  const entities = extractEntities(userInput);
  const confidence = Math.min(primary.score / 3, 1);

  return {
    intent: primaryIntent,
    workflow: primary.name,
    workflowScore: primary.score,
    confidence,
    confidenceLevel: confidence >= 0.6 ? 'high' : confidence >= 0.3 ? 'medium' : 'low',
    agents: primary.config.agents || ['general'],
    parallel: primary.config.parallel || false,
    phase: primary.config.phase || 'any',
    entities,
    requiresWalkthrough: primary.config.requiresWalkthrough || false,
    requiresTest: primary.config.requiresTest || false,
    requiresDocUpdate: primary.config.requiresDocUpdate || false,
    isQuery: primary.config.isQuery || false,
    needsClarification: confidence < 0.1,
    suggestions: workflowMatches.slice(0, 3).map(w => ({
      workflow: w.name,
      score: w.score,
      reason: w.matchedKeywords.slice(0, 2).map(m => m.keyword).join(', ')
    }))
  };
}

function formatDecision(d) {
  const lines = [
    `**意图**: ${d.intent}`,
    `**工作流**: ${d.workflow}`,
    `**置信度**: ${d.confidenceLevel} (${Math.round(d.confidence * 100)}%)`,
    `**Agent**: ${d.agents.join(' → ')}`
  ];

  if (d.parallel) lines.push(`**调度**: 并行`);
  if (d.requiresWalkthrough) lines.push(`**后续**: UI走查`);
  if (d.requiresTest) lines.push(`**后续**: 功能测试`);

  if (d.entities.page || d.entities.action) {
    lines.push('');
    lines.push('**实体**:');
    if (d.entities.page) lines.push(`- 页面: ${d.entities.page}`);
    if (d.entities.action) lines.push(`- 动作: ${d.entities.action}`);
  }

  if (d.needsClarification && d.suggestions?.length > 0) {
    lines.push('', '⚠️ **需要澄清**');
    d.suggestions.forEach(s => {
      lines.push(`  - ${s.workflow} (${Math.round(s.score * 100)}%): ${s.reason}`);
    });
  }

  return lines.join('\n');
}

module.exports = {
  decide,
  formatDecision,
  calculateSimilarity,
  WORKFLOWS,
  INTENTS
};
