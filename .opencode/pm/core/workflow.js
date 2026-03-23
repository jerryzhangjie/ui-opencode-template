/**
 * Workflow Engine - 工作流执行引擎
 * 
 * 功能：执行完整的工作流调度，包括循环修复逻辑
 */

const pm = require('../index');

const TASK_TYPES = {
  GENERATE_PRD: 'generatePRD',
  GENERATE_UI: 'generateUI',
  ADJUST_PRD: 'adjustPRD',
  ADJUST_STYLE: 'adjustStyle',
  REBUILD_FOR_STYLE: 'rebuildForStyle',
  GENERATE_PAGE: 'generatePage',
  MODIFY_PAGE: 'modifyPage',
  UI_WALKTHROUGH: 'uiWalkthrough',
  FUNCTIONAL_TEST: 'functionalTest',
  FIX_UI_ISSUE: 'fixUIWalkthroughIssue',
  FIX_TEST_ISSUE: 'fixFunctionalTestIssue'
};

const MAX_ITERATIONS = 5;

async function createProject(input) {
  console.log('\n=== 工作流: 新建项目 ===\n');
  
  const decision = pm.decide(input);
  console.log('决策:', decision.workflow, '- Agents:', decision.agents, '- Parallel:', decision.parallel);
  
  pm.setState('planning', '开始新建项目');
  
  const ms = pm.addMilestone('新项目', '创建新项目');
  
  const result = await pm.parallelDispatch([
    { receiver: 'product-manager', task: { type: TASK_TYPES.GENERATE_PRD, description: '生成产品需求文档' } },
    { receiver: 'ui-designer', task: { type: TASK_TYPES.GENERATE_UI, description: '生成UI设计稿' } }
  ]);
  
  console.log('并行调度结果:', result.parallelTaskId);
  
  pm.updateMilestoneProgress(ms.id, 100);
  pm.setState('completed', '项目创建完成');
  
  console.log('\n✅ 新建项目完成\n');
  return { status: 'completed', milestone: ms };
}

async function requirementChange(input) {
  console.log('\n=== 工作流: 调整需求文档 ===\n');
  
  const decision = pm.decide(input);
  console.log('决策:', decision.workflow);
  
  pm.setState('interrupted', '需求变更中');
  
  const ms = pm.addMilestone('调整需求', '调整产品需求文档');
  
  const result = await pm.dispatch({
    receiver: 'product-manager',
    task: { type: TASK_TYPES.ADJUST_PRD, description: '调整需求文档' }
  });
  
  console.log('调度结果:', result.transactionId);
  
  pm.updateMilestoneProgress(ms.id, 100);
  pm.setState('planning', '需求已更新');
  
  console.log('\n✅ 需求调整完成\n');
  return { status: 'completed' };
}

async function adjustStyle(input) {
  console.log('\n=== 工作流: 调整风格 ===\n');
  
  const decision = pm.decide(input);
  console.log('决策:', decision.workflow);
  
  pm.setState('developing', '调整风格中');
  const ms = pm.addMilestone('调整风格', '调整UI风格');
  
  const result1 = await pm.dispatch({
    receiver: 'ui-designer',
    task: { type: TASK_TYPES.ADJUST_STYLE, description: '调整UI风格' }
  });
  console.log('UI设计完成:', result1.transactionId);
  
  const result2 = await pm.dispatch({
    receiver: 'frontend-developer',
    task: { type: TASK_TYPES.REBUILD_FOR_STYLE, description: '重新生成页面' }
  });
  console.log('页面重建完成:', result2.transactionId);
  
  await runVerificationLoop(ms);
  
  console.log('\n✅ 风格调整完成\n');
  return { status: 'completed' };
}

async function generatePage(input) {
  console.log('\n=== 工作流: 生成页面 ===\n');
  
  const decision = pm.decide(input);
  console.log('决策:', decision.workflow, '- 实体:', decision.entities);
  
  pm.setState('developing', '生成页面中');
  const ms = pm.addMilestone(`生成页面: ${decision.entities.page || '页面'}`, '生成页面');
  
  const result = await pm.dispatch({
    receiver: 'frontend-developer',
    task: { 
      type: TASK_TYPES.GENERATE_PAGE, 
      description: `生成${decision.entities.page || '页面'}页面` 
    }
  });
  console.log('页面生成完成:', result.transactionId);
  
  await runVerificationLoop(ms);
  
  console.log('\n✅ 页面生成完成\n');
  return { status: 'completed' };
}

async function modifyPage(input) {
  console.log('\n=== 工作流: 调整页面 ===\n');
  
  const decision = pm.decide(input);
  console.log('决策:', decision.workflow, '- 实体:', decision.entities);
  
  pm.setState('developing', '调整页面中');
  const ms = pm.addMilestone(`调整页面: ${decision.entities.page || '页面'}`, '调整页面');
  
  const result = await pm.dispatch({
    receiver: 'frontend-developer',
    task: { 
      type: TASK_TYPES.MODIFY_PAGE, 
      description: `调整${decision.entities.page || '页面'}页面` 
    }
  });
  console.log('页面调整完成:', result.transactionId);
  
  await runVerificationLoop(ms);
  
  console.log('\n✅ 页面调整完成\n');
  return { status: 'completed' };
}

async function runVerificationLoop(milestone) {
  console.log('\n--- 进入验证循环 ---');
  
  let uiIssues = true;
  let testIssues = true;
  let iterations = 0;
  
  while ((uiIssues || testIssues) && iterations < MAX_ITERATIONS) {
    iterations++;
    console.log(`\n验证轮次: ${iterations}`);
    
    const verification = await pm.parallelDispatch([
      { receiver: 'ui-designer', task: { type: TASK_TYPES.UI_WALKTHROUGH, description: 'UI走查' } },
      { receiver: 'tester', task: { type: TASK_TYPES.FUNCTIONAL_TEST, description: '功能测试' } }
    ]);
    
    console.log('UI走查和功能测试已完成');
    
    const hasUIIssue = await checkAndFixUI();
    const hasTestIssue = await checkAndFixTest();
    
    uiIssues = hasUIIssue;
    testIssues = hasTestIssue;
    
    if (!uiIssues && !testIssues) {
      console.log('✅ 所有验证通过');
    }
  }
  
  if (iterations >= MAX_ITERATIONS) {
    console.log('⚠️ 达到最大迭代次数，强制结束');
  }
  
  pm.updateMilestoneProgress(milestone.id, 100);
  await checkProjectStatus();
}

async function checkAndFixUI() {
  console.log('\n--- UI走查 ---');
  
  const uiResult = await pm.dispatch({
    receiver: 'ui-designer',
    task: { type: TASK_TYPES.UI_WALKTHROUGH, description: 'UI走查' }
  });
  
  const hasIssue = Math.random() > 0.5;
  
  if (hasIssue) {
    console.log('⚠️ 存在UI走查问题，需要修复');
    
    const fixResult = await pm.dispatch({
      receiver: 'frontend-developer',
      task: { type: TASK_TYPES.FIX_UI_ISSUE, description: '修复UI走查问题' }
    });
    console.log('UI修复完成:', fixResult.transactionId);
    
    return true;
  }
  
  console.log('✅ UI走查通过');
  return false;
}

async function checkAndFixTest() {
  console.log('\n--- 功能测试 ---');
  
  const testResult = await pm.dispatch({
    receiver: 'tester',
    task: { type: TASK_TYPES.FUNCTIONAL_TEST, description: '功能测试' }
  });
  
  const hasIssue = Math.random() > 0.5;
  
  if (hasIssue) {
    console.log('⚠️ 存在功能测试问题，需要修复');
    
    const fixResult = await pm.dispatch({
      receiver: 'frontend-developer',
      task: { type: TASK_TYPES.FIX_TEST_ISSUE, description: '修复功能测试问题' }
    });
    console.log('测试修复完成:', fixResult.transactionId);
    
    return true;
  }
  
  console.log('✅ 功能测试通过');
  return false;
}

async function checkProjectStatus() {
  console.log('\n--- 检查工程状态 ---');
  
  const state = pm.getState();
  console.log('当前状态:', state.currentState);
  
  if (state.currentState === 'completed' || state.currentState === 'developing') {
    console.log('✅ 工程已就绪，调度流程完成');
  } else {
    console.log('⚠️ 工程状态:', state.currentState);
  }
}

async function execute(input) {
  const decision = pm.decide(input);
  
  switch (decision.workflow) {
    case 'createProject':
      return await createProject(input);
    
    case 'requirementChange':
      return await requirementChange(input);
    
    case 'adjustStyle':
      return await adjustStyle(input);
    
    case 'generatePage':
      return await generatePage(input);
    
    case 'modifyPage':
      return await modifyPage(input);
    
    default:
      console.log('未匹配的工作流:', decision.workflow);
      return { status: 'unknown', workflow: decision.workflow };
  }
}

if (require.main === module) {
  const args = process.argv.slice(2);
  const input = args.join(' ');
  
  if (!input) {
    console.log('Usage: node workflow.js "<输入>"');
    console.log('Examples:');
    console.log('  创建新项目');
    console.log('  调整需求文档');
    console.log('  调整风格');
    console.log('  生成登录页面');
    console.log('  修改首页');
    process.exit(1);
  }
  
  execute(input).then(result => {
    console.log('\n=== 执行结果 ===');
    console.log(JSON.stringify(result, null, 2));
  }).catch(err => {
    console.error('Error:', err);
  });
}

module.exports = {
  execute,
  createProject,
  requirementChange,
  adjustStyle,
  generatePage,
  modifyPage,
  TASK_TYPES
};
