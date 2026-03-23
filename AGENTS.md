# AGENTS.md - Agent 开发规范

为 AI Agent 在本项目中运行提供上下文信息。

---

## 项目概览

- **技术栈**: Vue 2.7 + Vite 5 + Vue Router 3
- **包管理器**: npm
- **路由模式**: hash 模式

---

## 命令

```bash
npm run dev      # 启动开发服务器 http://localhost:3000
npm run build    # 生产构建到 dist/
npm run preview  # 本地预览生产构建
npm run test     # 测试 (Vitest)
```

---

## 代码规范

### Vue 2 组件结构
```vue
<template>
  <div class="component-name">
    <child-component :prop="value" @event="handler" />
  </div>
</template>

<script>
export default {
  name: 'ComponentName',
  props: {
    title: { type: String, required: true, default: '' },
    items: { type: Array, default: () => [] }
  },
  data() { return { localState: '' } },
  computed: { filteredItems() { return this.items.filter(i => i.active) } },
  methods: { handleClick() {} },
  beforeDestroy() {}
}
</script>

<style scoped>
.component-name {}
</style>
```

### 导入顺序
1. Vue 核心: `import Vue from 'vue'`
2. 外部库: `import axios from 'axios'`
3. 内部（绝对路径）: `import MyComponent from '@/components/MyComponent'`

### 命名规范
| 类型 | 规范 | 示例 |
|------|------|------|
| 组件 | PascalCase | `UserProfile.vue` |
| 工具/辅助 | camelCase | `formatDate.js` |
| 常量 | UPPER_SNAKE_CASE | `MAX_RETRIES` |
| Props | camelCase | `userName`, `isActive` |
| CSS 类 | kebab-case | `.user-avatar` |

---

## 项目结构
```
src/
├── main.js              # 入口文件
├── App.vue              # 根组件
├── router/index.js      # 路由配置
├── views/               # 页面级组件
├── components/          # 可复用组件
├── utils/               # 辅助函数
├── assets/              # 静态资源
└── __tests__/           # 测试文件
```

---

## 决策引擎

项目经理使用工作流引擎调度各Agent执行任务。

### 调用方式

```javascript
const pm = require('.opencode/pm');
const { execute } = require('.opencode/pm/core/workflow');

const decision = pm.decide('用户输入');
// 返回: { intent, workflow, agents, entities, parallel, ... }

await execute('用户输入');
// 执行完整工作流
```

### CLI 调用
```bash
node .opencode/pm/index.js --input "添加登录功能"
node .opencode/pm/index.js --status
node .opencode/pm/index.js --progress
node .opencode/pm/core/workflow.js "生成登录页面"
```

### 工作流
| 工作流 | 说明 | 调度顺序 |
|--------|------|----------|
| createProject | 新建项目 | PM + UI 并行 |
| requirementChange | 调整需求文档 | PM → 终止 |
| adjustStyle | 调整风格 | UI → 前端 → 验证循环 → 终止 |
| generatePage | 生成页面 | 前端 → 验证循环 → 终止 |
| modifyPage | 调整页面 | 前端 → 验证循环 → 终止 |

### 验证循环

验证循环在 generatePage/modifyPage/adjustStyle 工作流中执行：
1. 并行调用 UI走查 + 功能测试
2. 若存在UI问题 → 前端修复 → UI走查（循环）
3. 若存在测试问题 → 前端修复 → 功能测试（循环）
4. 最多5次迭代
5. 检查工程状态 → 交付

---

## Agents

| Agent | 描述 |
|-------|------|
| project-manager | 协调完整开发流程 |
| product-manager | 需求分析 |
| ui-designer | UI 设计 |
| frontend-developer | 前端开发 |
| tester | 功能测试 |

---

## 注意事项

- Vue 2.7: 使用 `beforeDestroy` 或 `beforeUnmount`
- Vite: 使用 `import.meta.env` 而非 `process.env`
- 禁止空 catch 块
- 禁止直接操作 DOM
