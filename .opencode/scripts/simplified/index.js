/**
 * Simplified Decision Engine
 * 
 * 使用方式：
 *   node index.js --input "用户输入"
 *   const { decide } = require('./index');
 */

const fs = require('fs');
const path = require('path');

const WORKFLOWS = {
  Query: {
    projectStatus: { keywords: ['状态', '进展', '完成情况', '怎么样了'], agent: 'general' },
    projectProgress: { keywords: ['进度', '完成度', '还要多久', '还有多少'], agent: 'general' },
    issueList: { keywords: ['问题', 'bug', '错误', '缺陷'], agent: 'tester' },
    codeQuery: { keywords: ['代码', '实现', '在哪里', '怎么写', '哪个文件'], agent: 'frontend-developer' }
  },
  Action: {
    createProject: { keywords: ['新项目', '从零', '无现有代码', '新做一个系统', '新做'], agent: ['product-manager', 'ui-designer'], parallel: true },
    addFeature: { keywords: ['添加', '新增', '加个', '加一个'], agent: 'frontend-developer' },
    modifyPage: { keywords: ['修改', '改一下', '调整', '改动页面'], agent: 'frontend-developer' },
    adjustStyle: { keywords: ['风格', '主题', '配色', '样式', '外观', '深色', '浅色'], agent: 'ui-designer', requiresFrontend: true },
    fixIssue: { keywords: ['修复', '解决', '修一下', '修bug'], agent: 'frontend-developer' },
    generatePage: { keywords: ['页面', '做个页面', '写个页面', '生成页面'], agent: 'frontend-developer' },
    optimize: { keywords: ['优化', '改进', '完善', '提升', '调整一下'], agent: 'frontend-developer' }
  },
  Consult: {
    techSelection: { keywords: ['用什么', '技术栈', '框架', '选哪个', '哪个好'], agent: 'product-manager', skill: 'product-manager-skill' },
    solutionAdvice: { keywords: ['建议', '推荐', '方案', '怎么做', '怎么办'], agent: 'product-manager' },
    bestPractice: { keywords: ['最佳实践', '规范', '标准'], agent: 'ui-designer', skill: 'ui-ux-pro-max' }
  },
  Problem: {
    performanceIssue: { keywords: ['慢', '卡', '加载慢', '响应慢', '性能', '延迟'], agent: 'frontend-developer' },
    functionalBug: { keywords: ['不工作', '不能用', '失效', '功能坏'], agent: 'frontend-developer' },
    uiIssue: { keywords: ['样式', '布局', '错位', '不显示', '丑'], agent: 'ui-designer' },
    buildError: { keywords: ['报错', '构建', '编译', 'error', 'failed'], agent: 'frontend-developer' }
  },
  Change: {
    requirementChange: { keywords: ['需求变更', '需求调整', '改需求'], agent: 'product-manager' },
    scopeChange: { keywords: ['范围', '加需求', '减需求', 'scope'], agent: 'product-manager' },
    techChange: { keywords: ['换框架', '换方案', '重构'], agent: 'product-manager' }
  }
};

const STATE_FILE = '.opencode/context/state.json';

function getState() {
  try {
    if (fs.existsSync(STATE_FILE)) {
      return JSON.parse(fs.readFileSync(STATE_FILE, 'utf-8'));
    }
  } catch (e) {}
  return { currentState: 'init', history: [] };
}

function setState(newState, note = '') {
  const state = getState();
  if (state.currentState === newState) return { changed: false, state };
  
  state.history = [...(state.history || []), {
    from: state.currentState,
    to: newState,
    time: new Date().toISOString(),
    note
  }].slice(-10);
  state.currentState = newState;
  state.lastUpdate = new Date().toISOString();
  
  const dir = path.dirname(STATE_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
  
  return { changed: true, state };
}

function classifyIntent(input) {
  const lower = input.toLowerCase();
  // 优化、性能等应该优先被识别
  if (/慢|卡|性能|优化|提升/.test(lower)) return 'Problem';
  if (/添加|新增|修改|调整|生成|做/.test(lower)) return 'Action';
  if (/不|没|错|报|坏|失败|有问题/.test(lower)) return 'Problem';
  if (/变更|改需求|需求变了/.test(lower)) return 'Change';
  if (/状态|进度|情况|怎么样/.test(lower)) return 'Query';
  if (/怎么|如何|为什么|能不能|建议|推荐|用.*好|选.*好/.test(lower)) return 'Consult';
  if (/新项目|从零|新建|创建|修复|解决|修/.test(lower)) return 'Action';
  return 'Query';
}

function matchWorkflow(input, workflows) {
  const lower = input.toLowerCase();
  
  // 优先级关键词 - 更具体的匹配优先（顺序很重要！）
  const priority = [
    // 最高优先：新建页面
    { name: 'generatePage', keywords: ['新建页面', '做个页面', '写个页面', '生成页面', '做一个页面'] },
    // 项目级新建
    { name: 'createProject', keywords: ['新项目', '从零', '无现有代码', '新做一个系统'] },
    // 问题修复 - 修复关键词优先
    { name: 'fixIssue', keywords: ['修复', '解决', '修一下', '修bug', '修复一下'] },
    // UI问题 - 仅在没有修复关键词时
    { name: 'uiIssue', keywords: ['样式', '布局', '错位', '不显示'] },
    // 功能问题
    { name: 'functionalBug', keywords: ['不工作', '不能用', '失效'] }
  ];
  
  for (const item of priority) {
    if (workflows[item.name] && item.keywords.some(k => lower.includes(k))) {
      return { name: item.name, ...workflows[item.name] };
    }
  }
  
  let best = null, bestScore = 0;
  for (const [name, config] of Object.entries(workflows)) {
    const score = config.keywords.filter(k => lower.includes(k.toLowerCase())).length;
    if (score > bestScore) { bestScore = score; best = { name, ...config }; }
  }
  
  return best || { name: 'unknown', agent: 'general', needsClarification: true };
}

function extractEntities(input) {
  return {
    page: /^(?:修复|修改|调整)?(登录|注册|首页|主页)/.exec(input)?.[1] || 
          /(登录|注册|首页|主页)(?:页面|页)?/.exec(input)?.[1] || null,
    feature: /(?:添加|新增)?(登录|注册|搜索|导出|删除)/.exec(input)?.[1] || null,
    severity: /P0|阻断/.test(input) ? 'P0' : /P1|重要/.test(input) ? 'P1' : /P2|一般/.test(input) ? 'P2' : /P3|建议/.test(input) ? 'P3' : null
  };
}

function decide(userInput, context = {}) {
  const intent = classifyIntent(userInput);
  const workflows = WORKFLOWS[intent] || {};
  const matched = matchWorkflow(userInput, workflows);
  const entities = extractEntities(userInput);
  
  return {
    intent,
    workflow: matched.name || 'unknown',
    agent: matched.agent || 'general',
    agents: Array.isArray(matched.agent) ? matched.agent : [matched.agent],
    parallel: matched.parallel || false,
    skill: matched.skill || null,
    requiresFrontend: matched.requiresFrontend || false,
    entities,
    needsClarification: matched.needsClarification || false
  };
}

function formatDecision(d) {
  const lines = [`## 决策结果`, `**意图**: ${d.intent}`, `**工作流**: ${d.workflow}`, `**Agent**: ${d.agents.join(' → ')}`];
  if (d.parallel) lines.push(`**调度**: 并行`);
  if (d.skill) lines.push(`**Skill**: ${d.skill}`);
  if (d.entities.page || d.entities.feature) {
    lines.push('');
    lines.push('**实体**:');
    if (d.entities.page) lines.push(`- 页面: ${d.entities.page}`);
    if (d.entities.feature) lines.push(`- 功能: ${d.entities.feature}`);
    if (d.entities.severity) lines.push(`- 严重程度: ${d.entities.severity}`);
  }
  if (d.needsClarification) lines.push('', '⚠️ **需要澄清**');
  return lines.join('\n');
}

function parseArgs() {
  const args = process.argv.slice(2);
  let input = null, status = false, help = false;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--input' || args[i] === '-i') input = args[++i];
    else if (args[i] === '--status' || args[i] === '-s') status = true;
    else if (args[i] === '--help' || args[i] === '-h') help = true;
  }
  return { input, status, help };
}

function main() {
  const opts = parseArgs();
  
  if (opts.help) {
    console.log(`\nSimplified Decision Engine\n\n用法:\n  node index.js --input <文本>  执行决策\n  node index.js --status         查看状态\n  node index.js --help          显示帮助\n\n示例:\n  node index.js --input "添加登录功能"\n  node index.js --input "修复样式问题"\n`);
    return;
  }
  
  if (opts.status) {
    const state = getState();
    console.log(`\n# 项目状态\n\n当前状态: ${state.currentState}\n最后更新: ${state.lastUpdate || '无'}\n历史记录: ${state.history?.length || 0} 条\n`);
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

module.exports = { decide, formatDecision, getState, setState };
