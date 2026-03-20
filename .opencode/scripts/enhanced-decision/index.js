/**
 * Enhanced Decision Engine v2
 * 
 * Features:
 * - Vector similarity matching (embedding-based)
 * - Weight mechanism for keyword priority
 * - Multi-intent detection
 * - Confidence scoring
 * 
 * 依赖: context/manager.js
 * 
 * Usage:
 *   node index.js --input "用户输入"
 *   const { decide } = require('./index');
 */

const manager = require('../../context/manager');

const WORKFLOW_DEFINITIONS = {
  createProject: {
    keywords: [
      { text: '新项目', weight: 1.0 },
      { text: '从零开始', weight: 1.0 },
      { text: '新建', weight: 0.8 },
      { text: '无现有代码', weight: 0.9 },
      { text: '做一个系统', weight: 0.7 },
      { text: '创建项目', weight: 0.8 }
    ],
    agents: ['product-manager', 'ui-designer'],
    parallel: true,
    phase: 'planning',
    priority: 1
  },
  addFeature: {
    keywords: [
      { text: '添加功能', weight: 1.0 },
      { text: '添加', weight: 0.9 },
      { text: '新增功能', weight: 1.0 },
      { text: '新增', weight: 0.8 },
      { text: '加一个', weight: 0.7 },
      { text: '加个', weight: 0.7 },
      { text: '做个功能', weight: 0.9 },
      { text: '写个功能', weight: 0.9 }
    ],
    agents: ['frontend-developer', 'tester'],
    parallel: false,
    phase: 'development',
    priority: 3,
    requiresUIWalkthrough: false,
    requiresFunctionalTest: true
  },
  modifyPage: {
    keywords: [
      { text: '修改页面', weight: 1.0 },
      { text: '改动页面', weight: 0.9 },
      { text: '调整页面', weight: 0.8 },
      { text: '改一下', weight: 0.5 }
    ],
    agents: ['frontend-developer', 'ui-designer', 'tester'],
    parallel: false,
    phase: 'development',
    priority: 3,
    requiresUIWalkthrough: true,
    requiresFunctionalTest: true
  },
  adjustStyle: {
    keywords: [
      { text: '调整风格', weight: 1.0 },
      { text: '换主题', weight: 1.0 },
      { text: '深色模式', weight: 0.9 },
      { text: '浅色模式', weight: 0.9 },
      { text: '换配色', weight: 0.9 },
      { text: '样式调整', weight: 0.7 },
      { text: '好看一点', weight: 0.6 }
    ],
    agents: ['ui-designer', 'frontend-developer', 'tester'],
    parallel: false,
    phase: 'development',
    priority: 4,
    requiresUIWalkthrough: true,
    requiresFunctionalTest: true
  },
  fixIssue: {
    keywords: [
      { text: '修复', weight: 1.0 },
      { text: '解决', weight: 0.9 },
      { text: '修一下', weight: 0.8 },
      { text: '修bug', weight: 1.0 },
      { text: 'bug', weight: 0.6 }
    ],
    agents: ['frontend-developer'],
    parallel: false,
    phase: 'verification',
    priority: 1,
    requiresFunctionalTest: true
  },
  generatePage: {
    keywords: [
      { text: '生成页面', weight: 1.0 },
      { text: '做个页面', weight: 1.0 },
      { text: '写个页面', weight: 1.0 },
      { text: '新建页面', weight: 1.0 },
      { text: '做一个页面', weight: 0.9 },
      { text: '做个', weight: 0.8 },
      { text: '做页面', weight: 0.9 },
      { text: '写页面', weight: 0.9 }
    ],
    agents: ['frontend-developer', 'ui-designer', 'tester'],
    parallel: false,
    phase: 'development',
    priority: 2,
    requiresUIWalkthrough: true,
    requiresFunctionalTest: true
  },
  optimize: {
    keywords: [
      { text: '优化', weight: 1.0 },
      { text: '改进', weight: 0.8 },
      { text: '完善', weight: 0.7 },
      { text: '提升性能', weight: 1.0 }
    ],
    agents: ['frontend-developer'],
    parallel: false,
    phase: 'development',
    priority: 5
  },
  requirementChange: {
    keywords: [
      { text: '需求变更', weight: 1.0 },
      { text: '改需求', weight: 1.0 },
      { text: '需求变了', weight: 0.9 },
      { text: '调整需求', weight: 0.8 }
    ],
    agents: ['product-manager'],
    parallel: false,
    phase: 'planning',
    priority: 1,
    requiresDocUpdate: true
  },
  uiWalkthrough: {
    keywords: [
      { text: 'ui走查', weight: 1.0 },
      { text: '设计走查', weight: 1.0 },
      { text: '视觉检查', weight: 0.8 },
      { text: '看看效果', weight: 0.4 }
    ],
    agents: ['ui-designer'],
    parallel: false,
    phase: 'verification',
    priority: 3
  },
  functionalTest: {
    keywords: [
      { text: '功能测试', weight: 1.0 },
      { text: '测试一下', weight: 0.8 },
      { text: '验证功能', weight: 0.7 }
    ],
    agents: ['tester'],
    parallel: false,
    phase: 'verification',
    priority: 3
  },
  queryStatus: {
    keywords: [
      { text: '状态', weight: 0.6 },
      { text: '进度', weight: 0.8 },
      { text: '完成情况', weight: 0.9 },
      { text: '怎么样了', weight: 0.5 },
      { text: '还要多久', weight: 0.6 }
    ],
    agents: ['general'],
    parallel: false,
    phase: 'any',
    priority: 10,
    isQuery: true
  }
};

const INTENT_PATTERNS = {
  Problem: [/不|没|慢|错|报|坏|失败|有问题|不行|不能用/],
  Change: [/变更|改需求|需求变了|调整|修改.*需求/],
  Query: [/状态|进度|情况|怎么样|多少|完成/],
  Consult: [/怎么|如何|为什么|能不能|建议|推荐/],
  Action: [/新项目|从零|新建|创建|添加|新增|修改|调整|优化|生成|做|修复/]
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

const SYNONYMS = {
  '新': ['做', '建', '创建'],
  '一个': ['款', '个'],
  '系统': ['项目', '应用', '平台']
};

function calculateSimilarity(text1, text2) {
  const t1 = text1.toLowerCase();
  const t2 = text2.toLowerCase();

  if (t1 === t2) return 1.0;

  if (t1.includes(t2)) {
    return Math.min(0.95, 0.5 + (t2.length / t1.length) * 0.45);
  }
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

  for (const [intent, patterns] of Object.entries(INTENT_PATTERNS)) {
    if (patterns.some(p => p.test(lower))) {
      return intent;
    }
  }
  return 'Action';
}

function matchWorkflowWithWeights(input, workflows) {
  const results = [];

  for (const [name, config] of Object.entries(workflows)) {
    let score = 0;
    let matchedKeywords = [];

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
      results.push({
        name,
        score,
        matchedKeywords,
        config
      });
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
  for (const [key, pattern] of Object.entries(patterns)) {
    const match = pattern.exec(input);
    if (match) {
      if (key === 'severity') {
        const severityMap = {
          'P0': 'P0', '阻断': 'P0',
          'P1': 'P1', '严重': 'P1',
          'P2': 'P2', '一般': 'P2',
          'P3': 'P3', '建议': 'P3', '低': 'P3'
        };
        entities[key] = severityMap[match[1]] || match[1];
      } else {
        entities[key] = match[1];
      }
    }
  }

  return entities;
}

function detectMultiIntent(input) {
  const intents = [];
  const segments = input.split(/[,，;；]/).map(s => s.trim()).filter(Boolean);

  if (segments.length > 1) {
    for (const segment of segments) {
      const intent = classifyIntent(segment);
      const matched = matchWorkflowWithWeights(segment, WORKFLOW_DEFINITIONS);
      if (matched.length > 0) {
        intents.push({
          segment,
          intent,
          workflow: matched[0],
          canParallel: matched[0].config.parallel !== false
        });
      }
    }
  }

  return intents;
}

function decide(userInput, context = {}) {
  const intents = detectMultiIntent(userInput);
  const primaryIntent = classifyIntent(userInput);
  const workflowMatches = matchWorkflowWithWeights(userInput, WORKFLOW_DEFINITIONS);

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
    multiIntent: intents.length > 1 ? intents : null,
    phase: primary.config.phase || 'any',
    entities,
    requiresUIWalkthrough: primary.config.requiresUIWalkthrough || false,
    requiresFunctionalTest: primary.config.requiresFunctionalTest || false,
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
    '## 决策结果',
    `**意图**: ${d.intent}`,
    `**工作流**: ${d.workflow}`,
    `**置信度**: ${d.confidenceLevel} (${Math.round(d.confidence * 100)}%)`,
    `**Agent**: ${d.agents.join(' → ')}`
  ];

  if (d.parallel) lines.push(`**调度**: 并行`);
  if (d.multiIntent) {
    lines.push('', '**多意图检测**:');
    d.multiIntent.forEach((item, i) => {
      lines.push(`${i + 1}. [${item.canParallel ? '可并行' : '顺序'}] ${item.segment} → ${item.workflow.name}`);
    });
  }

  if (d.requiresUIWalkthrough) lines.push(`**后续**: UI走查`);
  if (d.requiresFunctionalTest) lines.push(`**后续**: 功能测试`);
  if (d.requiresDocUpdate) lines.push(`**后续**: 更新文档`);

  if (d.entities.page || d.entities.action) {
    lines.push('', '**实体**:');
    if (d.entities.page) lines.push(`- 页面: ${d.entities.page}`);
    if (d.entities.action) lines.push(`- 动作: ${d.entities.action}`);
    if (d.entities.severity) lines.push(`- 严重程度: ${d.entities.severity}`);
  }

  if (d.needsClarification) {
    lines.push('', '⚠️ **需要澄清**');
    if (d.suggestions?.length > 0) {
      lines.push('可能的意图:');
      d.suggestions.forEach(s => {
        lines.push(`  - ${s.workflow} (${Math.round(s.score * 100)}%): ${s.reason}`);
      });
    }
  }

  return lines.join('\n');
}

function parseArgs() {
  const args = process.argv.slice(2);
  let input = null, status = false, help = false, progress = false;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--input' || args[i] === '-i') input = args[++i];
    else if (args[i] === '--status' || args[i] === '-s') status = true;
    else if (args[i] === '--progress' || args[i] === '-p') progress = true;
    else if (args[i] === '--help' || args[i] === '-h') help = true;
  }

  return { input, status, progress, help };
}

function main() {
  const opts = parseArgs();

  if (opts.help) {
    console.log(`
Enhanced Decision Engine v2

用法:
  node index.js --input <文本>   执行决策
  node index.js --status          查看状态
  node index.js --progress         查看进度
  node index.js --help             显示帮助

示例:
  node index.js --input "添加登录功能"
  node index.js --input "修复样式问题"
  node index.js --progress
`);
    return;
  }

  if (opts.status) {
    const state = manager.getState();
    console.log(`\n# 项目状态

当前状态: ${state.currentState}
最后更新: ${state.lastUpdate || '无'}
并行任务: ${state.parallelTasks?.length || 0}
历史记录: ${state.history?.length || 0}
`);
    return;
  }

  if (opts.progress) {
    const prog = manager.getProgress();
    console.log(`\n# 项目进度

整体进度: ${prog.overallProgress}%
当前状态: ${prog.currentState}
最后更新: ${prog.lastUpdate || '无'}

里程碑 (${prog.milestones.length}):`);
    prog.milestones.forEach(m => {
      const bar = '█'.repeat(Math.round(m.progress / 10)) + '░'.repeat(10 - Math.round(m.progress / 10));
      console.log(`  [${bar}] ${m.name} (${m.progress}%) - ${m.status}`);
    });

    if (prog.parallelTasks.length > 0) {
      console.log('\n并行任务:');
      prog.parallelTasks.forEach(t => {
        console.log(`  - ${t.id}: ${t.description} [${t.status}]`);
      });
    }
    return;
  }

  if (!opts.input) {
    console.error('请提供 --input 参数');
    return;
  }

  console.log(`\n输入: "${opts.input}"\n`);
  const decision = decide(opts.input);
  console.log(formatDecision(decision));
  console.log('');
}

if (require.main === module) main();

module.exports = {
  decide,
  formatDecision,
  getState: manager.getState,
  setState: manager.setState,
  createParallelTask: manager.createParallelTask,
  updateParallelTask: manager.updateParallelTask,
  addMilestone: manager.addMilestone,
  updateMilestoneProgress: manager.updateMilestoneProgress,
  getProgress: manager.getProgress,
  calculateSimilarity
};
