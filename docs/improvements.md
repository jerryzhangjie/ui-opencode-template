# 架构改进建议

## 一、架构清晰度问题

### 问题 1.1: 层次边界模糊

**现状**: PM 被画在 Harness 之外，但实际 PM 就是 Harness 的一部分

**问题**: 
```
┌─────────────────────────────────────┐
│  PROJECT MANAGER (在 Harness 外?)   │
├─────────────────────────────────────┤
│  HARNESS LAYER                      │
│  (上下文 + 约束 + 熵管理)             │
├─────────────────────────────────────┤
│  AGENT POOL                         │
└─────────────────────────────────────┘
```

**建议**: 按 OpenAI 的三层模型重新划分

```
┌─────────────────────────────────────────────────────────┐
│                    SCAFFOLDING                          │
│  (预执行阶段)                                            │
│  - 系统 prompt 编译                                       │
│  - 工具 schema 构建                                      │
│  - Agent 注册表填充                                      │
├─────────────────────────────────────────────────────────┤
│                    HARNESS                              │
│  (运行时编排)                                            │
│  - 决策引擎 (decide.js)                                  │
│  - 调度器 (dispatch.js)                                 │
│  - 状态管理 (state.js)                                   │
│  - 验证循环 (workflow.js)                               │
├─────────────────────────────────────────────────────────┤
│                    AGENTS                               │
│  - Project Manager (primary)                           │
│  - Product Manager (subagent)                           │
│  - UI Designer (subagent)                              │
│  - Frontend Developer (subagent)                       │
│  - Tester (subagent)                                   │
└─────────────────────────────────────────────────────────┘
```

### 问题 1.2: 决策 vs 执行 职责混淆

**现状**: `decide.js` 和 `workflow.js` 都包含部分工作流逻辑

**建议**: 明确分离
- **decide.js**: 意图识别 → 工作流匹配 → 输出决策
- **workflow.js**: 工作流执行 → 步骤编排 → 状态流转
- **dispatch.js**: 任务调度 → Agent 执行 → 结果回收

### 问题 1.3: OpenCode 与 PM 的角色重叠

**现状**: 
- PM Workflow Engine 做了决策和调度
- OpenCode Runtime 也做上下文管理和工具执行
- 边界不清晰

**建议**: 
```
┌────────────────────────────────────────┐
│  PM Workflow Engine (Node.js)          │
│  "我应该调度哪个 Agent，做什么任务"       │
├────────────────────────────────────────┤
│  OpenCode Runtime                      │
│  "这个 Agent 收到任务后，具体怎么执行"    │
└────────────────────────────────────────┘
```

PM 负责 **" WHAT "**，OpenCode 负责 **" HOW "**

---

## 二、Harness 匹配度问题

### 问题 2.1: 缺少硬约束实现

**现状**: 文档写了"硬约束优先"，但代码里没有实现

**建议**: 添加实际约束工具

```javascript
// .opencode/pm/lib/constraints.js
module.exports = {
  // 1. 目录结构约束
  validateDirectory: (files) => {
    const required = ['src/views', 'src/components', 'src/router'];
    const missing = required.filter(d => !files.includes(d));
    if (missing.length) throw new Error(`缺少目录: ${missing.join(', ')}`);
  },
  
  // 2. 组件结构约束
  validateComponent: (content) => {
    const required = ['name:', 'template', 'script'];
    const missing = required.filter(f => !content.includes(f));
    if (missing.length) throw new Error(`组件缺少: ${missing.join(', ')}`);
  },
  
  // 3. 命名规范约束
  validateNaming: (files) => {
    const violations = files
      .filter(f => !/^[A-Z][a-zA-Z]*\.vue$/.test(basename(f)))
      .map(f => `文件 ${f} 命名不符合 PascalCase`);
    if (violations.length) throw new Error(violations.join('\n'));
  }
};
```

**在 CI 中集成**:
```javascript
// dispatch.js 中，Agent 执行完成后
const violations = constraints.validateDirectory(createdFiles);
if (violations) {
  return { status: 'failed', reason: violations };
}
```

### 问题 2.2: 上下文工程不完整

**现状**: 
- 只有静态的 `AGENTS/{role}.md`
- 没有任务级别的上下文注入

**建议**: 实现"context injection"

```javascript
// dispatch.js
async function dispatch({ receiver, task, artifacts }) {
  // 1. 加载 Agent 基础上下文
  const baseContext = await loadAgentContext(receiver);
  
  // 2. 构建任务相关上下文
  const taskContext = {
    taskType: task.type,
    taskDescription: task.description,
    artifacts: artifacts ? {
      prd: artifacts.prd ? readFile(artifacts.prd) : null,
      ui: artifacts.ui ? readFile(artifacts.ui) : null
    } : {},
    projectState: state.getState(),
    historyTasks: getRecentTasks(receiver)
  };
  
  // 3. 合并并发送给 OpenCode
  return opencode.execute(mergeContext(baseContext, taskContext));
}
```

### 问题 2.3: 工具没有精简

**现状**: 所有 Agent 获得相同的工具集

**建议**: 按 Agent 类型配置工具

```javascript
// .opencode/agents/config.json
{
  "product-manager": {
    "tools": ["read", "glob", "write", "question"],
    "maxSteps": 20
  },
  "frontend-developer": {
    "tools": ["read", "glob", "write", "edit", "bash", "glob"],
    "maxSteps": 50
  },
  "tester": {
    "tools": ["read", "glob", "bash"],
    "maxSteps": 30
  }
}
```

### 问题 2.4: 熵管理未实现

**现状**: 文档写了"定时扫描"，但代码里没有

**建议**: 添加 entropy.js 并集成到 workflow

```javascript
// .opencode/pm/lib/entropy.js
module.exports = {
  // 文档一致性检查
  checkDocConsistency: async () => {
    const prds = glob('docs/PRD*.md');
    const uis = glob('docs/UI*.md');
    // 检查 UI 文档引用的页面是否都实现了
  },
  
  // 死代码扫描
  findDeadCode: async () => {
    // 扫描未被引用的组件、未使用的路由
  },
  
  // 架构漂移检测
  checkArchitectureDrift: async () => {
    // 检查是否越过了分层边界
  }
};
```

---

## 三、易于维护问题

### 问题 3.1: Workflow 逻辑硬编码

**现状**: `workflow.js` 中每个工作流是独立的 async 函数，逻辑固化

```javascript
// 难以维护的写法
async function generatePage(input) {
  const decision = pm.decide(input);
  pm.setState('developing', '生成页面中');
  const ms = pm.addMilestone(...);
  const result = await pm.dispatch(...);
  await runVerificationLoop(ms);
  // ... 30+ 行
}
```

**建议**: 改为声明式配置 + 执行器

```json
// workflows.json (重构)
{
  "generatePage": {
    "steps": [
      { "op": "decide", "output": "decision" },
      { "op": "setState", "state": "developing" },
      { "op": "milestone", "action": "create" },
      { "op": "dispatch", "agent": "frontend-developer", "task": "{{decision.task}}" },
      { "op": "verify", "loop": true, "max": 5 }
    ]
  }
}
```

```javascript
// workflow-executor.js
async function executeWorkflow(config, input) {
  const context = { input, output: {} };
  for (const step of config.steps) {
    switch (step.op) {
      case 'decide':
        context.output.decision = pm.decide(context.input);
        break;
      case 'dispatch':
        context.output.result = await dispatch({
          agent: interpolate(step.agent, context.output),
          task: interpolate(step.task, context.output)
        });
        break;
      case 'verify':
        await runVerificationLoop(context, step);
        break;
    }
  }
}
```

### 问题 3.2: 缺少错误处理和恢复

**现状**: 任何一个 Agent 失败，整个流程就中断

**建议**: 添加错误恢复机制

```javascript
// dispatch.js
async function dispatchWithRetry({ receiver, task, options = {} }) {
  const { maxRetries = 3, retryDelay = 1000 } = options;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await executeAgent(receiver, task);
    } catch (error) {
      if (attempt === maxRetries) {
        // 记录失败，转交人类
        await escalateToHuman({ task, error });
        return { status: 'failed', error: error.message };
      }
      await sleep(retryDelay * attempt);
    }
  }
}
```

### 问题 3.3: 状态存储无版本管理

**现状**: 直接读写 JSON 文件，无迁移机制

**建议**: 添加版本控制

```javascript
// .opencode/pm/lib/state.js
const SCHEMA_VERSION = 2;

function loadState() {
  const state = readState();
  if (state.version !== SCHEMA_VERSION) {
    return migrateState(state, SCHEMA_VERSION);
  }
  return state;
}

function migrateState(state, targetVersion) {
  if (state.version === 1) {
    // v1 → v2: 添加 parallelTasks 字段
    state.parallelTasks = [];
    state.version = 2;
  }
  return state;
}
```

### 问题 3.4: 验证循环逻辑重复

**现状**: `runVerificationLoop` 在 `adjustStyle`, `generatePage`, `modifyPage` 中重复

**建议**: 提取为通用模块

```javascript
// .opencode/pm/lib/verification.js
async function runVerificationLoop(config) {
  const { maxIterations = 5, agents, fixActions } = config;
  
  for (let i = 0; i < maxIterations; i++) {
    const results = await parallelDispatch(
      agents.map(a => ({ receiver: a.role, task: a.task }))
    );
    
    const issues = detectIssues(results);
    if (!issues.length) return results;
    
    for (const issue of issues) {
      await dispatch({ 
        receiver: fixActions[issue.type], 
        task: { type: issue.fixTask, description: issue.description }
      });
    }
  }
  
  throw new Error('达到最大迭代次数');
}
```

---

## 四、改进优先级

| 优先级 | 改进项 | 影响 |
|--------|--------|------|
| **P0** | 声明式工作流 | 可维护性大幅提升 |
| **P0** | 硬约束实现 | Harness 真正落地 |
| **P1** | 任务级上下文注入 | 上下文工程完整 |
| **P1** | 错误恢复机制 | 生产可用性 |
| **P2** | 熵管理定时任务 | 长期可维护性 |
| **P2** | 工具精简配置 | 效率提升 |

---

## 五、改进后的文件结构

```
.opencode/
├── agents/                     # Agent 定义 (不动)
├── pm/
│   ├── index.js               # 入口 (精简)
│   ├── config/
│   │   ├── intents.json       # 意图配置
│   │   └── workflows.json     # 工作流配置 (声明式)
│   ├── core/
│   │   ├── decide.js          # 决策引擎 (不动)
│   │   ├── dispatch.js        # 调度器 (增强)
│   │   └── executor.js        # NEW: 工作流执行器
│   ├── lib/
│   │   ├── constraints.js     # NEW: 硬约束实现
│   │   ├── entropy.js         # NEW: 熵管理
│   │   ├── verification.js    # NEW: 验证循环
│   │   ├── state.js           # 状态 (增强)
│   │   └── cache.js
│   └── data/
├── skills/
└── config.json
```

---

## 六、总结

**架构清晰**: 
- 明确 Scaffold/Harness/Agents 三层
- 分离 WHAT(PM) 和 HOW(OpenCode)

**Harness 匹配**:
- 硬约束代码化 (constraints.js)
- 上下文注入机制
- 工具按角色精简
- 熵管理定时任务

**易于维护**:
- 声明式工作流配置
- 错误恢复机制
- 状态版本管理
- 验证循环抽象
