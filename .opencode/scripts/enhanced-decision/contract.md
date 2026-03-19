# Agent 通信契约 (Contract)

定义 PM 与 SubAgent 之间标准化的通信协议，确保任务调度的可靠性和可追溯性。

---

## 1. 调度命令格式

### 1.1 标准调度命令

```json
{
  "command": "dispatch",
  "transactionId": "txn_20240319_001",
  "timestamp": "2024-03-19T10:30:00Z",
  "sender": "project-manager",
  "receiver": "frontend-developer",
  "payload": {
    "task": {
      "id": "task_login_page",
      "type": "addFeature",
      "description": "实现用户登录页面",
      "priority": "P1"
    },
    "context": {
      "projectState": "planning",
      "currentPhase": "development",
      "intent": "Action",
      "workflow": "addFeature"
    },
    "artifacts": {
      "prd": "doc/PRD-用户登录.md",
      "ui": "doc/UI-用户登录.md"
    },
    "requirements": {
      "outputFormat": "json",
      "validationRequired": true,
      "selfTestRequired": true
    }
  }
}
```

### 1.2 并行调度命令

```json
{
  "command": "parallel-dispatch",
  "transactionId": "txn_20240319_002",
  "timestamp": "2024-03-19T10:30:00Z",
  "sender": "project-manager",
  "parallelTaskId": "parallel_design_dev",
  "tasks": [
    {
      "receiver": "product-manager",
      "payload": { "task": { "id": "task_prd", "type": "generatePRD" } }
    },
    {
      "receiver": "ui-designer",
      "payload": { "task": { "id": "task_ui", "type": "generateUI" } }
    }
  ],
  "syncRequired": true,
  "timeout": 300
}
```

---

## 2. 响应格式

### 2.1 成功响应

```json
{
  "command": "result",
  "transactionId": "txn_20240319_001",
  "status": "success",
  "timestamp": "2024-03-19T10:35:00Z",
  "sender": "frontend-developer",
  "receiver": "project-manager",
  "payload": {
    "taskId": "task_login_page",
    "result": {
      "filesCreated": ["src/views/LoginView.vue", "src/components/LoginForm.vue"],
      "testsAdded": ["tests/LoginView.spec.js"],
      "selfTestPassed": true
    },
    "artifacts": {
      "screenshots": ["login-form-desktop.png", "login-form-mobile.png"]
    },
    "metrics": {
      "linesAdded": 245,
      "linesModified": 0,
      "duration": "5m"
    }
  }
}
```

### 2.2 失败响应

```json
{
  "command": "result",
  "transactionId": "txn_20240319_001",
  "status": "failed",
  "timestamp": "2024-03-19T10:35:00Z",
  "sender": "frontend-developer",
  "receiver": "project-manager",
  "payload": {
    "taskId": "task_login_page",
    "error": {
      "code": "BLOCKED_BY_MISSING_DEP",
      "message": "缺少依赖组件 AuthService",
      "blockedBy": ["component_AuthService"]
    }
  }
}
```

### 2.3 需要澄清

```json
{
  "command": "clarification-required",
  "transactionId": "txn_20240319_001",
  "timestamp": "2024-03-19T10:35:00Z",
  "sender": "frontend-developer",
  "receiver": "project-manager",
  "payload": {
    "taskId": "task_login_page",
    "questions": [
      {
        "id": "q1",
        "field": "loginMethod",
        "question": "登录方式支持哪些？",
        "options": ["用户名密码", "手机验证码", "第三方OAuth"]
      }
    ]
  }
}
```

---

## 3. 状态同步

### 3.1 状态更新请求

```json
{
  "command": "state-update",
  "transactionId": "txn_20240319_003",
  "timestamp": "2024-03-19T10:40:00Z",
  "sender": "frontend-developer",
  "payload": {
    "milestoneId": "ms_login",
    "progress": 50,
    "taskCompleted": {
      "id": "task_login_form",
      "name": "登录表单组件",
      "duration": "3m"
    }
  }
}
```

### 3.2 进度查询

```json
{
  "command": "progress-query",
  "transactionId": "txn_20240319_004",
  "timestamp": "2024-03-19T10:45:00Z",
  "sender": "project-manager",
  "payload": {
    "milestoneId": "ms_login",
    "includeSubtasks": true
  }
}
```

---

## 4. 任务类型定义

| TaskType | 描述 | 预期输出 | 超时时间 |
|----------|------|----------|----------|
| `generatePRD` | 生成需求文档 | PRD markdown | 120s |
| `generateUI` | 生成UI设计稿 | UI markdown + 设计系统 | 180s |
| `addFeature` | 添加功能模块 | Vue组件 + 测试 | 300s |
| `modifyPage` | 修改页面 | 修改后的文件 | 180s |
| `adjustStyle` | 调整样式 | 样式变更 | 120s |
| `fixIssue` | 修复问题 | 修复 + 验证 | 180s |
| `uiWalkthrough` | UI走查 | 走查报告 | 120s |
| `functionalTest` | 功能测试 | 测试报告 | 180s |
| `optimize` | 性能优化 | 优化后的代码 | 240s |

---

## 5. 错误码定义

| 错误码 | 说明 | 处理建议 |
|--------|------|----------|
| `BLOCKED_BY_MISSING_DEP` | 缺少依赖 | 等待前置任务完成 |
| `BLOCKED_BY_CONFLICT` | 资源冲突 | 重新分配或等待 |
| `INVALID_INPUT` | 输入参数错误 | 返回澄清问题 |
| `EXECUTION_FAILED` | 执行失败 | 查看日志，报告问题 |
| `TIMEOUT` | 执行超时 | 重试或拆分任务 |
| `PARTIAL_SUCCESS` | 部分成功 | 继续或标记完成 |

---

## 6. 通信流程

### 6.1 标准任务流程

```
PM                    FD/UI/Test
 │                        │
 │──── dispatch ──────────>│
 │                        │
 │<─── result/success ────│
 │                        │
 │──── state-update ─────>│ (更新进度)
```

### 6.2 带澄清流程

```
PM                    FD
 │                        │
 │──── dispatch ──────────>│
 │                        │
 │<─── clarification ─────│
 │                        │
 │──── clarified ─────────>│
 │                        │
 │<─── result/success ────│
```

### 6.3 并行任务流程

```
PM               PM-Agent    UI-Agent
 │                   │            │
 │─── parallel ─────>│            │
 │   -dispatch       │            │
 │                   │────> ... ──>│
 │                   │            │
 │<─── sync ─────────│<── ... <───│
 │   wait all        │            │
 │                   │            │
```

---

## 7. 调度函数 (Node.js)

```javascript
const { dispatch, parallelDispatch, queryProgress, updateProgress } = require('./contract');

await dispatch({
  receiver: 'frontend-developer',
  task: { id: 'task_1', type: 'addFeature', description: '登录页面' },
  context: { projectState: 'planning' },
  artifacts: { prd: 'doc/PRD-login.md' }
});

await parallelDispatch([
  { receiver: 'product-manager', task: { id: 't1', type: 'generatePRD' } },
  { receiver: 'ui-designer', task: { id: 't2', type: 'generateUI' } }
]);
```

---

## 8. 使用指南

### 8.1 PM 调度 SubAgent

```javascript
const { dispatch } = require('.opencode/scripts/enhanced-decision/contract');

// 标准调度
await dispatch({
  receiver: 'frontend-developer',
  task: { id: 'task_login', type: 'addFeature', description: '实现登录页' },
  artifacts: { prd: 'doc/PRD-login.md', ui: 'doc/UI-login.md' }
});
```

### 8.2 SubAgent 返回结果

```javascript
const { respond } = require('.opencode/scripts/enhanced-decision/contract');

respond({
  status: 'success',
  taskId: 'task_login',
  result: { filesCreated: ['src/views/Login.vue'] }
});
```

### 8.3 查询进度

```javascript
const { queryProgress } = require('.opencode/scripts/enhanced-decision/contract');

const progress = await queryProgress();
console.log(`整体进度: ${progress.overallProgress}%`);
```
