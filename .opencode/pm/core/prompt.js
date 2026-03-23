/**
 * Prompt Builder - 模板构建器
 * 
 * 功能：结构化生成任务提示词
 */

function buildPrompt(command) {
  const { payload } = command;
  const { task, context, artifacts, requirements } = payload;

  const sections = [];

  sections.push(`# 任务调度\n`);
  sections.push(`## 任务信息`);
  sections.push(`- 任务ID: ${task.id || 'N/A'}`);
  sections.push(`- 任务类型: ${task.type || 'unknown'}`);
  sections.push(`- 任务描述: ${task.description || 'N/A'}`);
  if (task.priority) sections.push(`- 优先级: ${task.priority}`);

  sections.push(`\n## 上下文`);
  sections.push(`- 项目状态: ${context.projectState || 'unknown'}`);
  sections.push(`- 当前阶段: ${context.currentPhase || 'unknown'}`);
  if (context.intent) sections.push(`- 意图: ${context.intent}`);
  if (context.workflow) sections.push(`- 工作流: ${context.workflow}`);

  if (context.cacheHit) {
    sections.push(`- ⚠️ 缓存命中: ${context.cacheHit.type} (相似度 ${Math.round((context.cacheHit.similarity || 1) * 100)}%)`);
  }

  if (context.previousSummary) {
    sections.push(`\n## 前置执行摘要`);
    sections.push(context.previousSummary);
  }

  if (context.relevantHistory?.length > 0) {
    sections.push(`\n## 相关历史`);
    context.relevantHistory.forEach((h, i) => {
      sections.push(`${i + 1}. [${h.agent}] ${h.summary}`);
      if (h.artifacts?.length) sections.push(`   产出: ${h.artifacts.join(', ')}`);
    });
  }

  if (Object.keys(artifacts || {}).length > 0) {
    sections.push(`\n## 参考文档`);
    for (const [key, value] of Object.entries(artifacts)) {
      sections.push(`- ${key}: ${value}`);
    }
  }

  sections.push(`\n## 要求`);
  sections.push(`- 输出格式: ${requirements.outputFormat || 'json'}`);
  if (requirements.validationRequired) sections.push(`- 需要自测验证`);
  if (requirements.selfTestRequired) sections.push(`- 需要自测通过`);

  sections.push(`\n---\n\n请执行任务并返回结果。`);

  return sections.join('\n');
}

function buildMultiPrompt(commands) {
  return commands.map((cmd, idx) => {
    const taskInfo = `[${idx + 1}] ${cmd.receiver}: ${cmd.payload.task.description}`;
    return taskInfo;
  }).join('\n');
}

module.exports = {
  buildPrompt,
  buildMultiPrompt
};
