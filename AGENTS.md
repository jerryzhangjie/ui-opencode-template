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

简化架构：利用LLM自身能力理解意图，最小化规则配置。

### 调用方式

```javascript
const { decide } = require('.opencode/scripts/simplified/index');
const result = decide('用户输入');
// 返回: { intent, workflow, agent, agents, entities, parallel, skill, ... }
```

### CLI 调用
```bash
node .opencode/scripts/simplified/index.js --input "添加登录功能"
node .opencode/scripts/simplified/index.js --status
```

### 意图类型
| 类型 | 说明 | 关键词示例 |
|------|------|-----------|
| Query | 查询类 | 状态、进度、问题 |
| Action | 执行类 | 添加、修改、优化、生成 |
| Consult | 咨询类 | 怎么、如何、建议 |
| Problem | 问题类 | 慢、错、报错 |
| Change | 变更类 | 需求变更、调整 |

### 常见工作流
| 工作流 | Agent | 说明 |
|--------|-------|------|
| createProject | PM + UI | 新建项目（并行） |
| addFeature | frontend-developer | 添加功能 |
| fixIssue | frontend-developer | 修复问题 |
| adjustStyle | ui-designer | 调整样式 |
| generatePage | frontend-developer | 生成页面 |

### 状态管理
```javascript
const { getState, setState } = require('.opencode/scripts/simplified/index');
getState();           // { currentState, history }
setState('developing', '开始开发');
```

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
