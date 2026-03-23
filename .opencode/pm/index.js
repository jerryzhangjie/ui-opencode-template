/**
 * Project Manager - 统一入口
 * 
 * 功能：整合决策、调度、状态管理的统一 API
 * 
 * 用法:
 *   const pm = require('./pm');
 *   
 *   // 决策
 *   const decision = pm.decide('添加登录功能');
 *   
 *   // 调度
 *   const result = await pm.dispatch({ receiver: 'frontend-developer', task: {...} });
 *   
 *   // 状态
 *   pm.setState('developing', '开始开发');
 */

const decide = require('./core/decide');
const dispatch = require('./core/dispatch');
const state = require('./core/state');
const prompt = require('./core/prompt');
const session = require('./lib/session');
const cache = require('./lib/cache');

module.exports = {
  // 决策
  decide: decide.decide,
  formatDecision: decide.formatDecision,

  // 调度
  dispatch: dispatch.dispatch,
  dispatchWithRetry: dispatch.dispatchWithRetry,
  parallelDispatch: dispatch.parallelDispatch,
  respond: dispatch.respond,
  updateProgress: dispatch.updateProgress,
  setCurrentAgent: dispatch.setCurrentAgent,

  // 状态
  getState: state.getState,
  setState: state.setState,
  addMilestone: state.addMilestone,
  updateMilestoneProgress: state.updateMilestoneProgress,
  getProgress: state.getProgress,
  createParallelTask: state.createParallelTask,
  updateParallelTask: state.updateParallelTask,

  // 会话
  createSession: session.createSession,
  getSession: session.getSession,
  getContextChain: session.getContextChain,
  getLastContext: session.getLastContext,

  // 缓存
  getCacheStats: cache.getStats,
  clearCache: cache.clear,
  cleanupCache: cache.cleanup,

  // 工具
  buildPrompt: prompt.buildPrompt,
  sleep: dispatch.sleep,

  // CLI
  runCLI: () => {
    const args = process.argv.slice(2);
    
    if (args[0] === '--input' || args[0] === '-i') {
      const input = args.slice(1).join(' ');
      const decision = decide.decide(input);
      console.log('\n输入:', input, '\n');
      console.log(decide.formatDecision(decision));
    } else if (args[0] === '--status' || args[0] === '-s') {
      const s = state.getState();
      console.log(`\n当前状态: ${s.currentState}\n最后更新: ${s.lastUpdate || '无'}\n`);
    } else if (args[0] === '--progress' || args[0] === '-p') {
      const p = state.getProgress();
      console.log(`\n整体进度: ${p.overallProgress}%\n当前状态: ${p.currentState}\n里程碑: ${p.milestones.length}\n`);
    } else if (args[0] === '--clean') {
      const result = state.cleanOldData();
      console.log(`清理完成: ${result.transactions} 事务, ${result.parallelTasks} 并行任务`);
    } else {
      console.log(`
Project Manager CLI

Usage:
  node index.js --input <text>   决策
  node index.js --status         状态
  node index.js --progress      进度
  node index.js --clean         清理
`);
    }
  }
};

if (require.main === module) {
  module.exports.runCLI();
}
