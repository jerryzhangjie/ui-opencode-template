# 多智能体协同原型设计平台 - 架构设计

## 一、架构概览

基于 Harness Engineering 理念，本项目采用**三层架构**：

```
┌─────────────────────────────────────────────────────────────┐
│                    PROJECT MANAGER                           │
│              (决策引擎 + 工作流调度 + 状态管理)                │
├─────────────────────────────────────────────────────────────┤
│                      HARNESS LAYER                           │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────────┐ │
│  │ 上下文工程   │ │ 架构约束    │ │ 熵管理                  │ │
│  │ Context     │ │ Constraint  │ │ Entropy Management     │ │
│  │ Engineering │ │ Enforcement │ │ (垃圾回收)              │ │
│  └─────────────┘ └─────────────┘ └─────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│                      AGENT POOL                              │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌───────┐ ┌──────┐ │
│  │ Product  │ │ UI       │ │ Frontend │ │ Test  │ │User  │ │
│  │ Manager  │ │ Designer │ │ Developer│ │ Agent │ │      │ │
│  └──────────┘ └──────────┘ └──────────┘ └───────┘ └──────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## 二、Harness 核心组件

### 2.1 上下文工程 (Context Engineering)

**目标**: 确保每个 Agent 能看到正确的信息

| 组件 | 位置 | 说明 |
|------|------|------|
| `AGENTS.md` | 仓库根目录 | 主入口，Agent 启动时自动读取 |
| `AGENTS/pm.md` | `.opencode/agents/` | 项目经理专用上下文 |
| `AGENTS/product-manager.md` | `.opencode/agents/` | 产品经理知识库 |
| `AGENTS/ui-designer.md` | `.opencode/agents/` | UI设计规范 |
| `AGENTS/frontend-developer.md` | `.opencode/agents/` | 前端开发规范 |
| `AGENTS/tester.md` | `.opencode/agents/` | 测试规范 |

**上下文加载规则**:
```
1. Agent 启动 → 读取根目录 AGENTS.md
2. 解析 mode 字段 → 确定是否为 subagent
3. subagent → 读取对应 AGENTS/{role}.md
4. 动态上下文: 每次调度时注入任务相关文档路径
```

### 2.2 架构约束 (Architectural Constraints)

**目标**: 通过确定性规则约束 Agent 解空间

| 约束类型 | 工具 | 作用 |
|----------|------|------|
| 依赖分层 | 结构化测试 | Types → Config → Repo → Service → Runtime → UI |
| 命名规范 | 自定义 linter | 强制 camelCase/PascalCase |
| 代码规范 | ESLint + Prettier | 格式统一 |
| 目录结构 | 路径验证 | 强制 src/views, src/components |
| 任务类型 | Task Registry | 每个任务有明确类型和产出 |

**硬约束 > 软约束原则**:
```javascript
// ❌ 软约束 (prompt 告知)
"请遵循 Vue 2.7 规范开发组件"

// ✅ 硬约束 (CI 强制)
if (!componentHas name || !componentHas template) {
  CI.fail('组件缺少必要字段');
}
```

### 2.3 熵管理 (Entropy Management)

**目标**: 对抗 AI 生成代码的熵增

| 任务 | 触发条件 | 执行 Agent |
|------|----------|------------|
| 文档一致性检查 | 每次 PR | PM (自动扫描) |
| 架构违规扫描 | 每日定时 | PM |
| 死代码清理 | 每周定时 | PM |
| 依赖审计 | 每次构建 | PM |

---

## 三、Agent 定义

### 3.1 Agent 元数据结构

```yaml
# .opencode/agents/{role}.md
---
description: Agent 描述
mode: primary | subagent  # primary=可被用户直接调用
temperature: 0.3          # 生成温度
max_steps: 50              # 最大步数
permission:
  task:                    # 可调度其他 Agent
    product-manager: allow
    ui-designer: allow
    frontend-developer: allow
    tester: allow
  tools:                   # 可用工具
    read: true
    write: true
    edit: true
    bash: true
---
```

### 3.2 五个 Agent 职责

| Agent | 核心职责 | 任务类型 |
|-------|----------|----------|
| **Project Manager** | 工作流调度、状态管理、决策 | workflow orchestration |
| **Product Manager** | 需求分析、PRD 生成/调整 | generatePRD, adjustPRD |
| **UI Designer** | 风格设计、UI走查 | generateUI, adjustStyle, uiWalkthrough |
| **Frontend Developer** | 页面生成/调整、缺陷修复 | generatePage, modifyPage, fixIssue |
| **Tester** | 功能测试、缺陷验证 | functionalTest |

---

## 四、工作流定义

### 4.1 工作流配置 (workflows.json)

```json
{
  "createProject": {
    "description": "新建项目",
    "agents": ["product-manager", "ui-designer"],
    "parallel": true,
    "steps": [
      { "action": "parallelDispatch", "tasks": ["generatePRD", "generateUI"] },
      { "action": "terminate" }
    ]
  },
  "requirementChange": {
    "description": "调整需求文档",
    "agents": ["product-manager"],
    "steps": [
      { "action": "dispatch", "task": "adjustPRD" },
      { "action": "terminate" }
    ]
  },
  "adjustStyle": {
    "description": "调整风格",
    "agents": ["ui-designer", "frontend-developer", "ui-designer", "tester"],
    "steps": [
      { "action": "dispatch", "task": "adjustStyle" },
      { "action": "dispatch", "task": "rebuildForStyle" },
      { "action": "verificationLoop" }
    ]
  },
  "generatePage": {
    "description": "生成页面",
    "agents": ["frontend-developer"],
    "steps": [
      { "action": "dispatch", "task": "generatePage" },
      { "action": "verificationLoop" }
    ]
  },
  "modifyPage": {
    "description": "调整页面",
    "agents": ["frontend-developer"],
    "steps": [
      { "action": "dispatch", "task": "modifyPage" },
      { "action": "verificationLoop" }
    ]
  }
}
```

### 4.2 验证循环 (Verification Loop)

```
┌─────────────────────────────────────────────────────────────┐
│                    verificationLoop                         │
├─────────────────────────────────────────────────────────────┤
│  maxIterations: 5                                           │
│                                                             │
│  while (uiIssues || testIssues) {                          │
│    parallel:                                                │
│      - uiWalkthrough (UI Designer)                        │
│      - functionalTest (Tester)                            │
│                                                             │
│    if (hasUIIssue) {                                       │
│      fixUIIssue → uiWalkthrough (循环)                     │
│    }                                                       │
│    if (hasTestIssue) {                                    │
│      fixTestIssue → functionalTest (循环)                   │
│    }                                                       │
│  }                                                         │
│                                                             │
│  checkProjectStatus → terminate                            │
└─────────────────────────────────────────────────────────────┘
```

---

## 五、调度协议

### 5.1 消息格式

```typescript
// 调度请求
interface DispatchRequest {
  receiver: string;           // 目标 Agent
  task: {
    id?: string;
    type: TaskType;          // 任务类型
    description: string;     // 任务描述
  };
  artifacts?: {               // 传递的文档
    prd?: string;
    ui?: string;
  };
  options?: {
    timeout?: number;
    retry?: number;
  };
}

// 调度响应
interface DispatchResponse {
  status: 'success' | 'failed' | 'pending';
  transactionId: string;
  taskId: string;
  result?: {
    filesCreated?: string[];
    summary: string;
  };
}
```

### 5.2 API

```javascript
const pm = require('.opencode/pm');

// 决策
const decision = pm.decide('用户输入');
// { workflow, agents, parallel, entities }

// 单点调度
const result = await pm.dispatch({
  receiver: 'frontend-developer',
  task: { type: 'generatePage', description: '生成登录页' }
});

// 并行调度
const parallel = await pm.parallelDispatch([
  { receiver: 'ui-designer', task: { type: 'uiWalkthrough' } },
  { receiver: 'tester', task: { type: 'functionalTest' } }
]);

// 状态管理
pm.setState('developing', '开始开发');
pm.addMilestone('登录模块', '完成登录功能');
```

---

## 六、数据流

### 6.1 状态存储

```
.opencode/pm/data/
├── state.json          # 当前状态 { currentState, history }
├── milestones.json    # 里程碑 [{ id, name, progress, tasks }]
├── transactions.json  # 调度记录 [{ id, from, to, task, status }]
├── sessions.json      # 会话管理 [{ id, created, context }]
├── cache.json         # 缓存 { key, value, expiry }
└── context_chain.json # 上下文链 [{ sessionId, role, messages }]
```

### 6.2 任务生命周期

```
[用户输入]
     ↓
[决策引擎] → 匹配工作流
     ↓
[PM] → 创建里程碑
     ↓
[调度执行]
     ├─→ [单点调度] → [Agent 执行] → [响应]
     └─→ [并行调度] → [Agent 并行执行] → [汇总响应]
     ↓
[验证循环] (如需)
     ↓
[状态更新] → 里程碑进度 100%
     ↓
[检查工程状态]
     ↓
[终止/交付]
```

---

## 七、Harness 配置杠杆

| 杠杆 | 当前实现 | 建议增强 |
|------|----------|----------|
| **AGENTS.md** | 根目录 | 每个 Agent 独立文件，控制在 60 行内 |
| **确定性约束** | 目录结构验证 | 添加 linter + 结构化测试 |
| **工具精简** | 基础工具 | 根据任务类型动态加载工具子集 |
| **Sub-Agent 隔离** | 独立上下文 | 每个子任务独立上下文窗口 |
| **反馈循环** | 验证循环 | 添加自验证 checklist |
| **CI 限速** | 无 | 添加最大迭代次数限制 |
| **垃圾回收** | 无 | 定时任务扫描技术债 |

---

## 八、与 OpenCode 集成

### 8.1 OpenCode 扮演角色

OpenCode 在本项目中作为 **Harness 执行层**:

```
┌────────────────────────────────────────┐
│  PM Workflow Engine (Node.js)          │
│  - 决策、工作流编排、状态管理            │
├────────────────────────────────────────┤
│  OpenCode Runtime (Agent Harness)       │
│  - 上下文加载                           │
│  - 工具执行                            │
│  - 会话管理                            │
│  - Skill 加载                          │
├────────────────────────────────────────┤
│  LLM Provider                          │
│  - OpenAI / Anthropic / 本地模型        │
└────────────────────────────────────────┘
```

### 8.2 调用方式

```bash
# CLI 方式
node .opencode/pm/index.js --input "生成登录页面"

# 编程方式
const { execute } = require('.opencode/pm/core/workflow');
await execute('添加用户管理功能');
```

---

## 九、关键设计原则

1. **仓库即唯一知识源**: 所有 Agent 需要的文档必须在仓库中
2. **硬约束优先**: CI 能拦截的不要靠 prompt
3. **约束解放生产力**: 清晰的边界让 Agent 更快收敛
4. **渐进式自主性**: 从简单任务开始，逐步提升权限
5. **反馈驱动改进**: Agent 犯错 → 改进 Harness → 不再犯
6. **模块化可拆卸**: Harness 要能随模型能力进化

---

## 十、文件结构

```
.opencode/
├── agents/
│   ├── project-manager.md     # 项目经理 (primary)
│   ├── product-manager.md     # 产品经理 (subagent)
│   ├── ui-designer.md         # UI设计师 (subagent)
│   ├── frontend-developer.md # 前端开发 (subagent)
│   └── tester.md              # 测试专家 (subagent)
├── pm/
│   ├── index.js              # 入口 + 核心 API
│   ├── config/
│   │   ├── intents.json      # 意图配置
│   │   └── workflows.json    # 工作流配置
│   ├── core/
│   │   ├── decide.js         # 决策引擎
│   │   ├── dispatch.js      # 调度器
│   │   ├── workflow.js       # 工作流执行
│   │   ├── state.js          # 状态管理
│   │   ├── prompt.js         # 提示词生成
│   │   └── session.js        # 会话管理
│   ├── lib/
│   │   ├── cache.js          # 缓存管理
│   │   └── entropy.js        # 熵管理
│   └── data/                 # 状态存储
├── skills/
│   ├── product-manager-skill/
│   └── ui-ux-pro-max/
└── config.json               # OpenCode 配置
```



意图。           意图（8）

规划agent。      硬编码（8）

按顺序调度


优化方案：
agent调度流程硬编码，改为主agent规划，对规划出的agent调度再执行硬编码(强约束确保质量和调度自由度????)

流式输出的类型，可以在opencode源码中的提示词中查阅到

借鉴claudecode记录状态的机制实现右侧任务进展面板数据（暂时不做，先按opencode自行写文件来实现）

对话始终在跟主agent对话（暂定，opencode实则支持与子agent对话）


