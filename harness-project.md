# 基于 Harness 与 OpenCode 的项目经理 Agent 最终设计

## 一、理论基础

### Harness 的核心思想

```
最核心：约束 = 把老师傅的经验，变成 linter/结构测试/CI自动化

约束 > 上下文 > 反馈循环 > 熵管理
     ↓
约束表达：硬约束（linter/结构测试/CI） > 软约束（文档描述）
反馈闭环：失败→反思Harness问题→反哺仓库 > 失败→重试→转人工
熵管理：定期Agent扫描 > 定时cleanup函数
```

**核心洞察**：文档规则再多也只是"建议"，要把老师傅的经验变成linter/结构测试、CI自动化，才是真正的Harness工程化。

一句话总结
> 约束定边界 → 上下文喂信息 → 反馈循环验对错 → 熵管理保长效
四者缺一不可，共同构成Harness的"操作系统"。

### OpenCode 提供的基座

- **Agent 框架**：多 Agent 支持、任务调度
- **工具链**：read/write/edit/bash 等工具
- **上下文机制**：AGENTS.md 上下文注入
- **配置系统**：规则、工具、MCP 服务器

---

## 二、架构设计

### 整体架构（简洁3层）

```
┌─────────────────────────────────────────────────┐
│              意图理解层                          │
│  - 输入解析、意图分类、实体提取、工作流匹配      │
└────────────────────┬────────────────────────────┘
                     ▼
┌─────────────────────────────────────────────────┐
│               执行引擎层                         │
│  - 工作流引擎、任务调度、验证循环                │
└────────────────────┬────────────────────────────┘
                     ▼
┌─────────────────────────────────────────────────┐
│               交付层                            │
│  - 状态管理、里程碑追踪、熵管理                  │
└─────────────────────────────────────────────────┘
```

### 模块交互

```
PM Agent
│
├── 🧠 意图理解层 (IntentUnderstanding)
│   ├── 输入解析
│   ├── 意图分类
│   ├── 实体提取
│   └── 工作流匹配
│
├── ⚙️ 执行引擎层 (ExecutionEngine)
│   ├── 工作流引擎 (WorkflowEngine)     ← 核心：配置驱动
│   ├── 任务调度器 (TaskScheduler)      ← 核心：可插拔
│   ├── 验证器 (Verifier)               ← 核心：可配置
│   └── 上下文管理器 (ContextManager)
│
└── 📊 交付层 (DeliveryLayer)
    ├── 状态管理器 (StateManager)
    ├── 里程碑追踪器 (MilestoneTracker)
    └── 熵管理服务 (EntropyService)
```

---

## 三、核心设计原则

### 1. 配置驱动工作流 + 硬约束机制

所有工作流通过 JSON 配置定义，而非硬编码。关键改动：**需求澄清阶段 + PRD与UI并行**。

```javascript
// config/workflows.json

{
  "createProject": {
    "name": "新建项目",
    "tasks": [
      {
        "id": "clarify_requirements",
        "type": "CLARIFY_REQUIREMENTS",
        "agent": "project-manager",
        "description": "与用户多轮对话，明确{projectName}的真实需求",
        "dependsOn": [],
        "constraints": ["clarification_complete"],
        "output": "confirmed_requirements"  // 输出确认后的需求
      },
      {
        "id": "generate_prd",
        "type": "GENERATE_PRD",
        "agent": "product-manager",
        "description": "根据确认后的需求，生成{projectName}的产品需求文档",
        "dependsOn": ["clarify_requirements"],
        "constraints": ["prd_format_check"]
      },
      {
        "id": "generate_ui",
        "type": "GENERATE_UI",
        "agent": "ui-designer",
        "description": "根据确认后的需求，生成{projectName}的整体风格设计稿",
        "dependsOn": ["clarify_requirements"],  // 与PRD并行
        "constraints": ["ui_spec_validator"]
      },
      {
        "id": "consolidate_context",
        "type": "CONSOLIDATE_CONTEXT",
        "agent": "project-manager",
        "description": "合并PRD和UI设计稿，形成统一上下文",
        "dependsOn": ["generate_prd", "generate_ui"],
        "constraints": ["context_consistency"]
      },
      {
        "id": "implement_frontend",
        "type": "IMPLEMENT_FRONTEND",
        "agent": "frontend-developer",
        "description": "基于统一上下文，实现{projectName}前端代码",
        "dependsOn": ["consolidate_context"],
        "constraints": ["lint_check", "structure_test", "build_check"]
      },
      {
        "id": "run_tests",
        "type": "RUN_TESTS",
        "agent": "tester",
        "description": "执行测试验证",
        "dependsOn": ["implement_frontend"],
        "verify": true,
        "ci_rounds": 2
      }
    ],
    "onComplete": {
      "setState": "completed",
      "notify": ["user"],
      "harness_feedback": true
    }
  }
}
```

#### 工作流拓扑图（更新后）

```
                    ┌─────────────────────┐
                    │  clarify_requirements│ ← PM与用户多轮对话
                    │  (project-manager)   │
                    └──────────┬──────────┘
                               │
              ┌────────────────┼────────────────┐
              ▼                                    ▼
┌─────────────────────────┐        ┌─────────────────────────┐
│   generate_prd          │  并行  │   generate_ui           │
│   (product-manager)     │   ←→   │   (ui-designer)         │
│   根据确认的需求生成PRD  │        │   根据确认的需求生成UI  │
└────────────┬────────────┘        └────────────┬────────────┘
             │                                  │
             └──────────────┬───────────────────┘
                            ▼
              ┌─────────────────────────┐
              │  consolidate_context    │ ← PM合并PRD+UI
              │  (project-manager)       │
              └────────────┬────────────┘
                           │
                           ▼
              ┌─────────────────────────┐
              │  implement_frontend    │
              │  (frontend-developer)   │
              └────────────┬────────────┘
                           │
                           ▼
              ┌─────────────────────────┐
              │  run_tests (tester)    │
              └─────────────────────────┘
```

#### 硬约束实现：linter规则 + 结构测试 + 本地执行

```javascript
// config/constraints/linter-rules.json
{
  "pm_agent": {
    "rules": [
      "clarification_complete",       // 需求必须确认
      "prd_required_fields",           // PRD必须包含字段
      "workflow_no_circular_deps",     // 工作流禁止循环依赖
      "task_requires_verifier",        // 有verify:true的任务必须配置验证器
      "context_consistency"             // PRD和UI必须一致
    ]
  },
  "frontend_agent": {
    "rules": [
      "no_todo_unless_tracked",        // 禁止留TODO除非已入工单
      "no_console_in_prod",             // 禁止生产环境console
      "components_must_have_tests"     // 组件必须有测试
    ]
  }
}

// config/constraints/structure-tests.json
{
  "layering": {
    "order": ["types", "config", "repo", "service", "runtime", "ui"],
    "rule": "每层只能依赖左侧的层，违反则CI挂掉"
  },
  "no_circular_deps": "禁止模块间循环依赖",
  "no_cross_layer_import": "禁止跨层直接import"
}
```

#### 本地约束验证脚本

```javascript
// package.json 添加脚本
{
  "scripts": {
    "harness:lint": "node config/linter-rules/pm-agent.js && node config/linter-rules/frontend-agent.js",
    "harness:structure": "node config/structure-test.js",
    "harness:check": "npm run harness:lint && npm run harness:structure && npm run build"
  }
}

// config/linter-rules/pm-agent.js - PM Agent实际规则
module.exports = {
  rules: {
    'prd-required-fields': {
      check: (prd) => {
        const required = ['projectName', 'description', 'features', 'techStack', 'timeline'];
        const missing = required.filter(f => !prd[f]);
        return missing.length === 0 ? null : `缺少字段: ${missing.join(', ')}`;
      }
    },
    'workflow-no-circular-deps': {
      check: (workflows) => {
        const visited = new Set();
        const stack = [];
        
        function detectCycle(name, path) {
          if (path.includes(name)) return [`循环依赖: ${path.join(' -> ')} -> ${name}`];
          if (visited.has(name)) return null;
          
          visited.add(name);
          stack.push(name);
          
          const task = workflows[name];
          if (!task) return null;
          
          for (const dep of task.dependsOn || []) {
            const cycle = detectCycle(dep, [...stack]);
            if (cycle) return cycle;
          }
          
          stack.pop();
          return null;
        }
        
        for (const name of Object.keys(workflows)) {
          visited.clear();
          const cycle = detectCycle(name, []);
          if (cycle) return cycle[0];
        }
        return null;
      }
    }
  }
};

// 运行约束检查（在任务执行前调用）
const linter = require('./config/linter-rules/pm-agent.js');
const workflows = require('./config/workflows.json');

for (const [name, rule] of Object.entries(linter.rules)) {
  const error = rule.check(workflows);
  if (error) {
    console.error(`[Harness] 约束违规: ${name}`, error);
    process.exit(1);  // 违反则退出
  }
}

### 2. 可插拔 Agent 调度器

```javascript
// 执行引擎核心

class ExecutionEngine {
  constructor(config) {
    this.workflowEngine = new WorkflowEngine(config.workflows);
    this.scheduler = new TaskScheduler(config.scheduler);  // 可替换
    this.verifier = new Verifier(config.verifiers);         // 可配置
    this.contextManager = new ContextManager();
  }

  async execute(input, context = {}) {
    // 1. 意图理解
    const decision = await this.intentUnderstanding.understand(input, context);

    if (decision.needsClarification) {
      return { needsClarification: true, suggestions: decision.suggestions };
    }

    // 2. 获取工作流配置
    const workflow = this.workflowEngine.get(decision.workflow);

    // 3. 构建任务图（拓扑排序）
    const taskGraph = this.workflowEngine.buildTaskGraph(workflow, decision.entities);

    // 4. 执行任务
    const results = await this.scheduler.execute(taskGraph, {
      context: context,
      onTaskComplete: async (task, result) => {
        // 5. 验证（如需要）
        if (task.verify) {
          const verification = await this.verifier.verify(task, result);
          if (!verification.passed) {
            return { needsFix: true, issues: verification.issues };
          }
        }
      }
    });

    // 6. 更新交付层
    await this.delivery.complete(workflow, results);

    return { status: 'success', results };
  }
}
```

### 2. 可配置验证器 + 反馈闭环机制

```javascript
// config/verifiers.json

{
  "verifiers": {
    "ui": {
      "type": "ui-walkthrough",
      "agent": "ui-designer",
      "timeout": 300000,
      "ci_rounds": 2   // Stripe实践：CI最多两轮
    },
    "functional": {
      "type": "functional-test",
      "agent": "tester",
      "timeout": 600000,
      "ci_rounds": 2
    },
    "lint": {
      "type": "lint-check",
      "tool": "eslint",
      "failOnError": true,
      "ci_rounds": 2
    },
    "build": {
      "type": "build-check",
      "command": "npm run build",
      "failOnError": true,
      "ci_rounds": 2
    }
  },
  "harness_feedback": {
    "enabled": true,
    "on_failure": "reflect_harness_issue",  // 失败后反思Harness问题
    "rules": [
      "if_repeated_failure -> update_constraints",
      "if_doc_outdated -> trigger_entropy_agent",
      "if_architecture_drift -> trigger_architecture_fix"
    ]
  }
}
```

---

## 四、核心实现

### 1. 意图理解层 + 硬约束校验

```javascript
// IntentUnderstanding.js

const fs = require('fs');

class IntentUnderstanding {
  constructor(config) {
    this.intents = config.intents;
    this.entityPatterns = config.entityPatterns;
    this.workflows = config.workflows;
    this.confidenceThresholds = config.confidenceThresholds || {};
  }

  async understand(input, projectContext = {}) {
    // 1. 意图分类
    const intent = this.classifyIntent(input);

    // 2. 实体提取
    const entities = this.extractEntities(input);

    // 3. 工作流匹配
    const workflow = this.matchWorkflow(input, entities);

    // 4. 置信度计算（含上下文调整）
    const confidence = this.calculateConfidence(workflow, entities, projectContext);

    // 5. 阈值校验（硬约束：置信度<0.6必须请求澄清）
    const threshold = this.confidenceThresholds[workflow.name] || 0.6;
    const needsClarification = confidence < threshold;

    // 硬约束：意图分类错误会触发Harness反馈
    if (workflow.name === 'unknown') {
      await this.reportIntentClassificationFailure(input);
    }

    return {
      intent,
      workflow: workflow.name,
      entities,
      confidence,
      needsClarification,
      suggestions: needsClarification ? workflow.candidates : [],
      executionPlan: {
        requiresVerification: workflow.config.requiresVerification,
        parallelGroups: workflow.config.parallelGroups
      }
    };
  }

  async reportIntentClassificationFailure(input) {
    // 记录失败模式，供HarnessFeedbackService分析
    const failureLog = {
      input,
      timestamp: new Date().toISOString(),
      pattern: 'unknown_intent'
    };
    
    const logPath = './.opencode/logs/intent-failures.json';
    const existing = fs.existsSync(logPath) ? JSON.parse(fs.readFileSync(logPath)) : [];
    existing.push(failureLog);
    fs.writeFileSync(logPath, JSON.stringify(existing, null, 2));
  }

  calculateConfidence(workflow, entities, projectContext) {
    let confidence = workflow.score;

    // 上下文调整
    if (projectContext.currentState === 'planning' && workflow.name === 'createProject') {
      confidence *= 0.7;
    }

    return Math.min(confidence, 1);
  }
}
```

### 2. 工作流引擎

```javascript
// WorkflowEngine.js

class WorkflowEngine {
  constructor(workflows) {
    this.workflows = workflows;
  }

  get(workflowName) {
    return this.workflows[workflowName];
  }

  buildTaskGraph(workflow, entities) {
    const tasks = workflow.tasks.map((task, index) => ({
      ...task,
      index,
      description: this.interpolate(task.description, entities),
      actualDependsOn: task.dependsOn.map(depIndex => `task_${depIndex}`)
    }));

    // 拓扑排序
    return this.topologicalSort(tasks);
  }

  interpolate(template, entities) {
    return template.replace(/\{(\w+)\}/g, (match, key) => entities[key] || match);
  }

  topologicalSort(tasks) {
    const graph = new Map();
    const inDegree = new Map();
    const taskMap = new Map();

    // 初始化
    tasks.forEach(task => {
      taskMap.set(`task_${task.index}`, task);
      inDegree.set(`task_${task.index}`, task.actualDependsOn.length);
      graph.set(`task_${task.index}`, task.actualDependsOn);
    });

    // BFS
    const queue = [];
    const result = [];

    inDegree.forEach((degree, taskId) => {
      if (degree === 0) queue.push(taskId);
    });

    while (queue.length > 0) {
      const taskId = queue.shift();
      result.push(taskMap.get(taskId));

      graph.forEach((deps, id) => {
        if (deps.includes(taskId)) {
          inDegree.set(id, inDegree.get(id) - 1);
          if (inDegree.get(id) === 0) queue.push(id);
        }
      });
    }

    // 按批次分组（可并行的任务放一起）
    return this.groupByBatch(result, inDegree);
  }

  groupByBatch(sortedTasks, inDegree) {
    const batches = [];
    let currentBatch = [];
    const remaining = new Set(sortedTasks.map(t => `task_${t.index}`));

    while (remaining.size > 0) {
      currentBatch = sortedTasks.filter(t => {
        const taskId = `task_${t.index}`;
        return remaining.has(taskId) && 
               t.actualDependsOn.every(dep => !remaining.has(dep));
      });

      if (currentBatch.length === 0) break;

      batches.push({
        parallel: currentBatch.length > 1,
        tasks: currentBatch
      });

      currentBatch.forEach(t => remaining.delete(`task_${t.index}`));
    }

    return batches;
  }
}
```

### 3. 任务调度器（可插拔设计）

```javascript
// TaskScheduler.js

class TaskScheduler {
  constructor(config) {
    this.adapter = config.adapter;  // 可插拔：OpenCodeAdapter, MockAdapter, etc.
    this.maxRetries = config.maxRetries || 3;
    this.timeout = config.timeout || 300000;
  }

  async execute(taskGraph, options = {}) {
    const results = [];

    for (const batch of taskGraph) {
      if (batch.parallel && batch.tasks.length > 1) {
        // 并行执行
        const batchResults = await Promise.all(
          batch.tasks.map(task => this.executeTask(task, options))
        );
        results.push(...batchResults);
      } else {
        // 串行执行
        for (const task of batch.tasks) {
          const result = await this.executeTask(task, options);
          results.push(result);

          // 回调检查
          if (options.onTaskComplete) {
            const check = await options.onTaskComplete(task, result);
            if (check?.needsFix) {
              // 调度修复任务
              await this.scheduleFix(task, check.issues, options);
            }
          }
        }
      }
    }

    return results;
  }

  async executeTask(task, options) {
    // 构建上下文
    const context = this.buildContext(task, options.context);

    // 调用适配器执行
    const result = await this.adapter.execute({
      agent: task.agent,
      task: {
        id: `task_${task.index}`,
        type: task.type,
        description: task.description
      },
      context,
      timeout: this.timeout
    });

    return {
      taskId: task.index,
      type: task.type,
      status: result.status,
      artifacts: result.artifacts,
      output: result.output
    };
  }

  buildContext(task, globalContext) {
    return {
      ...globalContext,
      taskType: task.type,
      taskDescription: task.description
    };
  }

  async scheduleFix(originalTask, issues, options) {
    // 调度修复 Agent
    const fixTask = {
      ...originalTask,
      type: `FIX_${originalTask.type}`,
      description: `修复问题: ${issues.join(', ')}`
    };

    return await this.executeTask(fixTask, options);
  }
}
```

### 4. 验证器（可配置 + CI限速 + 反馈闭环）

```javascript
// Verifier.js

class Verifier {
  constructor(config) {
    this.verifiers = config;
    this.maxIterations = config.maxIterations || 3;
    this.maxCIRounds = config.maxCIRounds || 2;  // Stripe实践：CI最多两轮
  }

  async verify(task, result) {
    const verifierConfig = this.verifiers[task.type] || this.verifiers.default;

    if (!verifierConfig) {
      return { passed: true };
    }

    let ciRound = 0;
    let passed = false;
    let issues = [];

    while (ciRound < this.maxCIRounds && !passed) {
      ciRound++;
      const verifyResult = await this.executeVerification(verifierConfig, task, result);
      passed = verifyResult.passed;
      issues = verifyResult.issues;

      if (!passed && ciRound < this.maxCIRounds) {
        // 自动修复
        await this.autoFix(task, issues);
      }
    }

    if (!passed) {
      // CI限速：失败两次后转人工，不允许无限重试
      return { 
        passed: false, 
        issues, 
        ci_rounds: ciRound,
        escalate_to_human: true
      };
    }

    return { passed: true, issues: [], ci_rounds: ciRound };
  }

  async executeVerification(config, task, result) {
    switch (config.type) {
      case 'ui-walkthrough':
        return await this.verifyUI(config, result);
      case 'functional-test':
        return await this.verifyFunctional(config, result);
      case 'lint-check':
        return await this.verifyLint(config, result);
      case 'build-check':
        return await this.verifyBuild(config, result);
      default:
        return { passed: true, issues: [] };
    }
  }

  async autoFix(task, issues) {
    console.log(`[Verifier] 自动修复尝试: ${task.type}, issues: ${issues.join(', ')}`);
    // 根据问题类型调用相应Agent自动修复
  }

  async verifyUI(config, result) {
    const walkthroughResult = await this.callAgent(config.agent, {
      type: 'UI_WALKTHROUGH',
      description: '验证 UI 实现是否符合设计稿'
    });

    return {
      passed: walkthroughResult.passed,
      issues: walkthroughResult.issues || []
    };
  }

  async verifyFunctional(config, result) {
    const testResult = await this.callAgent(config.agent, {
      type: 'FUNCTIONAL_TEST',
      description: '执行功能测试验证'
    });

    return {
      passed: testResult.passed,
      issues: testResult.issues || []
    };
  }

  async verifyLint(config, result) {
    const { exec } = require('child_process');
    
    return new Promise(resolve => {
      exec(`npm run lint`, (error, stdout, stderr) => {
        resolve({
          passed: !error || config.failOnError === false,
          issues: error ? [stderr] : []
        });
      });
    });
  }

  async verifyBuild(config, result) {
    const { exec } = require('child_process');
    
    return new Promise(resolve => {
      exec(config.command, { cwd: config.cwd || process.cwd() }, 
        (error, stdout, stderr) => {
        resolve({
          passed: !error || config.failOnError === false,
          issues: error ? [stderr] : []
        });
      });
    });
  }

  async callAgent(agent, task) {
    // 调用 Agent 执行验证
  }
}
```

### 5. 交付层 + 主动熵管理服务

```javascript
// DeliveryLayer.js

class DeliveryLayer {
  constructor(config) {
    this.state = new StateManager(config.state);
    this.milestoneTracker = new MilestoneTracker(config.milestones);
    this.entropyService = new EntropyService(config.entropy);
    this.harnessFeedbackService = new HarnessFeedbackService(config.harnessFeedback);
    
    // 启动熵管理定时任务
    this.entropyService.start();
  }

  async startMilestone(workflowName, description) {
    const milestone = this.milestoneTracker.create(workflowName, description);
    this.state.set('running', `执行中: ${workflowName}`);
    return milestone;
  }

  async updateProgress(milestoneId, progress, taskResult = null) {
    this.milestoneTracker.update(milestoneId, progress, taskResult);
    this.state.updateProgress(progress);
  }

  async complete(workflow, results) {
    this.milestoneTracker.complete(workflow.name);
    this.state.set('completed', `完成: ${workflow.name}`);
    
    // 反馈闭环：检查是否需要反哺Harness
    await this.harnessFeedbackService.evaluate(results);
    
    return {
      status: 'success',
      artifacts: results.flatMap(r => r.artifacts || []),
      summary: `${workflow.name} 执行完成，共 ${results.length} 个任务`
    };
  }

  async onTaskFailure(task, error) {
    // 反馈闭环：失败后反思Harness问题
    const analysis = await this.harnessFeedbackService.analyzeFailure(task, error);
    if (analysis.shouldUpdateHarness) {
      await this.harnessFeedbackService.updateHarness(analysis.recommendation);
    }
  }
}

// HarnessFeedbackService.js - 失败后反思Harness问题并反哺

class HarnessFeedbackService {
  constructor(config) {
    this.failureThreshold = config.failureThreshold || 3;
    this.failurePatterns = new Map();
  }

  async analyzeFailure(task, error) {
    const key = `${task.type}_${error.code}`;
    const count = (this.failurePatterns.get(key) || 0) + 1;
    this.failurePatterns.set(key, count);

    return {
      shouldUpdateHarness: count >= this.failureThreshold,
      recommendation: {
        type: count >= this.failureThreshold ? 'constraint_update' : 'none',
        details: count >= this.failureThreshold 
          ? `Agent ${task.agent} 重复犯 ${error.code} 错误，建议添加约束规则`
          : null
      }
    };
  }

  async updateHarness(recommendation) {
    if (recommendation.type === 'constraint_update') {
      const update = this.generateConstraintUpdate(recommendation);
      await this.writeConstraintFile(update);
      console.log('[HarnessFeedback] 已更新约束规则:', update.filePath);
    }
  }

  generateConstraintUpdate(recommendation) {
    return {
      filePath: 'config/linter-rules/auto-generated.json',
      content: JSON.stringify({
        rule: recommendation.details,
        generatedAt: new Date().toISOString(),
        triggerCount: this.failureThreshold
      }, null, 2)
    };
  }

  async writeConstraintFile(update) {
    const fs = require('fs');
    const dir = require('path').dirname(update.filePath);
    
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    fs.writeFileSync(update.filePath, update.content);
  }
}

// EntropyService.js - 主动熵管理Agent（本地实现）

class EntropyService {
  constructor(config) {
    this.interval = config.interval || 3600000;
    this.maxAge = config.maxAge || 7 * 24 * 60 * 60 * 1000;
    this.outputDir = config.outputDir || './.entropy';
  }

  start() {
    this.timer = setInterval(() => this.cleanup(), this.interval);
  }

  stop() {
    if (this.timer) clearInterval(this.timer);
  }

  async cleanup() {
    console.log('[EntropyService] 执行熵清理');
    
    await this.scanDocConsistency();
    await this.scanArchitectureDrift();
    await this.cleanupStaleTransactions();
  }

  async scanDocConsistency() {
    const fs = require('fs');
    const path = require('path');
    const glob = require('glob');
    
    const docs = glob.sync('**/*.md', { ignore: 'node_modules/**' });
    const inconsistencies = [];

    for (const docPath of docs) {
      const content = fs.readFileSync(docPath, 'utf-8');
      const refs = this.extractCodeRefs(content);
      
      for (const ref of refs) {
        if (!fs.existsSync(ref.path)) {
          inconsistencies.push({ doc: docPath, missing: ref.path });
        }
      }
    }

    if (inconsistencies.length > 0) {
      this.saveReport('doc-inconsistencies.json', inconsistencies);
      console.log('[EntropyAgent] 发现文档不一致:', inconsistencies.length, '处');
    }
  }

  async scanArchitectureDrift() {
    const { execSync } = require('child_process');
    
    try {
      execSync('node config/structure-test.js', { stdio: 'pipe' });
    } catch (e) {
      this.saveReport('architecture-drift.json', { 
        error: e.message, 
        timestamp: new Date().toISOString() 
      });
      console.log('[EntropyAgent] 检测到架构漂移');
    }
  }

  async cleanupStaleTransactions() {
    const fs = require('fs');
    const statePath = './.opencode/state.json';
    
    if (fs.existsSync(statePath)) {
      const state = JSON.parse(fs.readFileSync(statePath, 'utf-8'));
      const stale = state.history?.filter(h => 
        Date.now() - new Date(h.timestamp).getTime() > this.maxAge
      );
      
      if (stale?.length > 0) {
        state.history = state.history.filter(h => 
          Date.now() - new Date(h.timestamp).getTime() <= this.maxAge
        );
        fs.writeFileSync(statePath, JSON.stringify(state, null, 2));
        console.log('[EntropyAgent] 清理过期状态:', stale.length, '条');
      }
    }
  }

  saveReport(filename, data) {
    const fs = require('fs');
    const path = require('path');
    
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
    
    fs.writeFileSync(
      path.join(this.outputDir, filename), 
      JSON.stringify(data, null, 2)
    );
  }

  extractCodeRefs(content) {
    const refRegex = /@([a-zA-Z0-9_\-\./]+)/g;
    const refs = [];
    let match;
    while ((match = refRegex.exec(content)) !== null) {
      refs.push({ path: match[1] });
    }
    return refs;
  }
}
```

---

## 五、Agent 上下文设计（分层结构）

### AGENTS.md 分层设计（根目录<60行，详细规则放子文件）

```markdown
# 项目经理 Agent 上下文

---
description: 项目经理 Agent，负责协调多 Agent 完成从需求到上线的完整开发流程
mode: primary
tools:
  read: true
  write: true
  edit: true
  glob: true
  grep: true
  task: true
---

## 索引

详细规则请参考：
- `.opencode/agents/pm/constraints.md` - 约束规则
- `.opencode/agents/pm/workflows.md` - 工作流定义
- `.opencode/agents/pm/verification.md` - 验证规则
- `.opencode/agents/pm/output-format.md` - 输出规范
```

#### 子文件1: .opencode/agents/pm/constraints.md

```markdown
# PM Agent 约束规则

## 硬约束（linter + 结构测试 + CI强制）

### PRD 格式校验
- 必须包含：projectName, description, features[], techStack, timeline
- 使用 prd-schema.json 验证

### 工作流约束
- 禁止循环依赖（workflow_no_circular_deps）
- 有 verify:true 的任务必须配置验证器

### 意图理解约束
- 置信度 < 0.6 时必须请求澄清
- 未知意图进入 fallback 流程
```

#### 子文件2: .opencode/agents/frontend/constraints.md

```markdown
# Frontend Agent 约束规则

## 硬约束

### 代码规范
- no_todo_unless_tracked: 禁止TODO除非工单已记录
- no_console_in_prod: 禁止生产环境console
- components_must_have_tests: 组件必须有测试

### 架构约束
- 分层：Types → Config → Repo → Service → Runtime → UI
- 每层只能依赖左侧的层
- 禁止跨层直接import
```

#### 子文件3: .opencode/agents/pm/observability.md

```markdown
# 可观测性集成

Agent 必须能自己验证结果，而非依赖人工检查。

## 本地可观测性栈（每个worktree一套）
- 日志：./.observability/logs/
- 指标：./.observability/metrics/
- 链路追踪：./.observability/traces/

## Agent 验证流程
1. 执行任务后自动运行 lint/test
2. 读取构建日志检查错误
3. 如失败，分析错误原因并自愈
4. 必要时请求人工介入
```

### 专业 Agent 上下文（模板）

```markdown
# .opencode/agents/{role}-agent.md

---
description: {角色} Agent
mode: subagent
tools:
  read: true
  write: true
  glob: true
  ...
---

## 角色定义

你是 {角色}，负责...

## 输入规范

当收到项目经理调度时，你会收到：
- task.type: 任务类型
- task.description: 任务描述
- context: 项目上下文（包含技术栈、约束等）
- artifacts: 相关的产物（PRD、设计稿等）

## 执行规范

1. 理解任务要求
2. 如有疑问，先提问而非猜测
3. 执行后验证结果
4. 返回标准格式的结果

## 输出格式

```json
{
  "status": "success|failed|needs_clarification",
  "taskId": "xxx",
  "artifacts": ["file1", "file2"],
  "summary": "完成描述"
}
```
```

---

## 六、专业 Agent Harness 差异化设计 + 工具精简 + 渐进自主性

### 可观测性集成（OpenAI实践：Agent自测）

```javascript
// .opencode/observability/config.json

{
  "enabled": true,
  "localStack": {
    "logs": "./.observability/logs",
    "metrics": "./.observability/metrics", 
    "traces": "./.observability/traces"
  },
  "agentSelfVerification": {
    "enabled": true,
    "steps": [
      "执行任务后自动运行 lint",
      "执行任务后自动运行 test",
      "读取构建日志检查错误",
      "分析错误原因并尝试自愈",
      "必要时请求人工介入"
    ]
  }
}

// Agent 自测示例（在 TaskScheduler 中集成）

class TaskScheduler {
  // ... 现有代码 ...

  async executeTask(task, options) {
    const context = this.buildContext(task, options.context);
    
    // 执行任务
    const result = await this.adapter.execute({
      agent: task.agent,
      task: { id: `task_${task.index}`, type: task.type, description: task.description },
      context,
      timeout: this.timeout
    });

    // Agent 自测（OpenAI实践）
    await this.selfVerify(task, result);

    return {
      taskId: task.index,
      type: task.type,
      status: result.status,
      artifacts: result.artifacts,
      output: result.output
    };
  }

  async selfVerify(task, result) {
    if (task.constraints && task.constraints.length > 0) {
      for (const constraint of task.constraints) {
        const checkResult = await this.runConstraintCheck(constraint);
        if (!checkResult.passed) {
          console.log(`[SelfVerify] ${constraint} 失败，尝试自愈...`);
          await this.attemptSelfHealing(task, checkResult.issues);
        }
      }
    }
  }

  async runConstraintCheck(constraint) {
    // 根据约束类型运行对应检查
    const checks = {
      'lint_check': () => execSync('npm run lint', { stdio: 'pipe' }),
      'structure_test': () => execSync('node config/structure-test.js', { stdio: 'pipe' }),
      'build_check': () => execSync('npm run build', { stdio: 'pipe' })
    };
    
    try {
      if (checks[constraint]) {
        checks[constraint]();
        return { passed: true };
      }
    } catch (e) {
      return { passed: false, issues: [e.message] };
    }
    
    return { passed: true };
  }

  async attemptSelfHealing(task, issues) {
    // Agent 尝试自愈
    console.log(`[SelfHealing] 尝试修复 ${task.type}: ${issues.join(', ')}`);
    // 调用修复Agent
  }
}

### 代码可读性（Application Legibility）

OpenAI实践发现：Agent理解代码的方式与人类不同，更依赖结构化线索。

```javascript
// config/legibility.json

{
  "naming_conventions": {
    "components": "PascalCase",
    "utils": "camelCase",
    "constants": "UPPER_SNAKE_CASE"
  },
  "structure_rules": [
    "显式类型定义，禁止隐式any",
    "禁止magic numbers，必须定义常量",
    "每个文件不超过300行",
    "禁止深度嵌套（max 3层）"
  ],
  "import_order": [
    "Vue/React核心",
    "外部库",
    "内部绝对路径@/..."
  ]
}

| Agent | 核心约束 | 验证方式 | 熵管理重点 | 工具子集 | 成熟度 |
|-------|----------|----------|------------|----------|--------|
| **PM** | 需求完整性、优先级合理性 | PRD 格式校验 + 结构测试 | 版本一致性 | task, read, write | L1-L3 |
| **UI** | 设计规范一致性、组件复用 | 设计稿审核 + 架构检查 | 素材清理 | read, write, glob | L1-L2 |
| **Frontend** | 代码规范、测试覆盖 | lint + structure test + build | 死代码清理 | read, write, edit, bash, grep | L1-L3 |
| **Tester** | 测试覆盖、断言有效性 | 测试通过率 | 废弃用例清理 | read, bash, grep | L1-L2 |

### 工具精简策略

```javascript
// config/agent_tools.json

{
  "product_manager": {
    "tools": ["task", "read", "write", "glob", "grep"],
    "rationale": "只需调度其他Agent和文档操作"
  },
  "ui_designer": {
    "tools": ["read", "write", "glob"],
    "rationale": "只需读取设计规范和产出设计稿"
  },
  "frontend_developer": {
    "tools": ["read", "write", "edit", "bash", "grep"],
    "rationale": "完整代码操作能力"
  },
  "tester": {
    "tools": ["read", "bash", "grep"],
    "rationale": "执行测试和读取代码"
  }
}
```

### 渐进自主性设计

```javascript
// config/maturity_levels.json

{
  "levels": {
    "L1_guided": {
      "description": "严格指导模式，每步需确认",
      "maxTaskDuration": 60000,
      "autoVerify": false,
      "escalateThreshold": 1
    },
    "L2_supervised": {
      "description": "监督模式，任务完成后验证",
      "maxTaskDuration": 300000,
      "autoVerify": true,
      "escalateThreshold": 3
    },
    "L3_autonomous": {
      "description": "自主模式，连续运行6小时+",
      "maxTaskDuration": 21600000,
      "autoVerify": true,
      "escalateThreshold": 5
    }
  },
  "progression": {
    "trigger": "连续N次任务成功",
    "L1_to_L2": 5,
    "L2_to_L3": 10
  }
}

---

## 七、OpenCode 集成方案

### 适配器接口

```javascript
// AgentAdapter 接口

class AgentAdapter {
  async execute(params) {
    // params: { agent, task, context, timeout }
    throw new Error('Not implemented');
  }
}

// OpenCode 适配器
class OpenCodeAdapter extends AgentAdapter {
  async execute(params) {
    // 调用 OpenCode Task API
    const result = await opencode.tasks.execute({
      agent: params.agent,
      prompt: this.buildPrompt(params.task, params.context),
      timeout: params.timeout
    });
    return result;
  }
}

// Mock 适配器（开发/测试用）
class MockAdapter extends AgentAdapter {
  async execute(params) {
    // 返回模拟结果
    return {
      status: 'success',
      artifacts: [],
      output: 'Mock result'
    };
  }
}
```

---

## 八、实施路径

### Phase 1：基础框架（1周）
- [ ] 意图理解层重构
- [ ] 工作流引擎实现（配置驱动）
- [ ] 状态管理基础

### Phase 2：执行能力（1周）
- [ ] 任务调度器（可插拔设计）
- [ ] 验证器实现
- [ ] OpenCode 适配器

### Phase 3：可靠性（1周）
- [ ] 熵管理服务
- [ ] 错误恢复机制
- [ ] 审计日志完善

### Phase 4：高级能力（持续）
- [ ] 复杂意图理解
- [ ] 动态工作流生成
- [ ] Agent 性能监控

---

## 九、关系总结

```
┌─────────────────────────────────────────────────────────────┐
│                    Harness 思想                            │
│  (约束 + 上下文 + 反馈循环 + 熵管理)                      │
└────────────────────────┬────────────────────────────────────┘
                         │ 基于
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    OpenCode 框架                            │
│  - Agent 框架                                               │
│  - 工具链（read/write/edit/bash）                          │
│  - 上下文机制（AGENTS.md）                                 │
│  - 配置系统（规则、工具、MCP）                              │
└────────────────────────┬────────────────────────────────────┘
                         │ 运行于
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              项目经理 Agent (实现目标)                       │
│  - 意图理解层（输入解析 → 意图分类 → 工作流匹配）         │
│  - 执行引擎层（工作流引擎 + 任务调度 + 验证器）            │
│  - 交付层（状态管理 + 里程碑 + 熵管理）                   │
└─────────────────────────────────────────────────────────────┘
```

---

## 十、对比优化总结

| 维度 | 原设计 | 优化后 |
|------|--------|--------|
| **工作流定义** | 硬编码函数 | JSON 配置驱动 |
| **任务依赖** | 隐式依赖 | 显式 dependsOn |
| **执行顺序** | 手动串行/并行 | 拓扑排序自动编排 |
| **验证器** | 内置模拟逻辑 | 可插拔可配置 |
| **Agent 调用** | 耦合在 dispatch | 适配器模式 |
| **熵管理** | 基础清理函数 | 独立服务 + 定时任务 |
| **扩展性** | 低 | 高（插件化） |
