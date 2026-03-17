# AGENTS.md - Agent 开发规范

本文档为 AI Agent 在本项目中运行提供上下文信息。

---

## 项目概览

- **技术栈**: Vue 2.7 + Vite 5 + Vue Router 3
- **包管理器**: npm
- **构建工具**: Vite
- **路由模式**: hash 模式（配置于 src/router/index.js）

---

## 命令

### 开发
```bash
npm run dev        # 启动开发服务器 http://localhost:3000
```

### 构建
```bash
npm run build      # 生产构建到 dist/
npm run preview    # 本地预览生产构建
```

### 测试 (Vitest)
```bash
npm run test         # 监听模式运行测试
npm run test:run     # 运行一次测试
npm run test:ui      # UI 模式运行测试

# 运行单个测试文件
npm run test:run -- src/__tests__/auth.spec.js
npm run test:run -- src/__tests__/Login.spec.js
```

### 代码检查
> **尚未配置** - 未安装 ESLint/Prettier。

---

## 代码规范

### 通用原则
- 优先写清晰可读的代码，而非炫技
- 保持函数短小专注（单一职责）
- 使用有意义的命名 - 避免使用单字母（循环变量除外）
- 注释说明**原因**，而非**做了什么**

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
  methods: { handleClick() {} }
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
| 事件 | kebab-case | `@click` |
| CSS 类 | kebab-case | `.user-avatar` |

### 变量与函数
```javascript
const MAX_COUNT = 10
const users = []
let currentUser = null

function fetchUser(id) { return axios.get(`/users/${id}`) }
const handleClick = (event) => { console.log(event.target) }
```

### 错误处理
```javascript
async function loadData() {
  try {
    const response = await api.fetch()
    this.data = response.data
  } catch (error) {
    console.error('加载数据失败:', error)
    this.error = '加载数据失败，请重试。'
  }
}
// ❌ 禁止空 catch 块
```

### Vue Router
```javascript
// 路由懒加载
const Admin = () => import('@/views/Admin.vue')

// 导航守卫
router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth && !isAuthenticated) {
    next({ name: 'Login', query: { redirect: to.fullPath } })
  } else {
    next()
  }
})
```

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

## 自定义 Agents

项目配置了以下 agents（位于 `.opencode/agents/`）：

| Agent | 描述 | 使用方式 |
|-------|------|----------|
| project-manager | 项目经理，协调完整开发流程 | `@project-manager 创建登录页` |
| product-manager | 需求分析，输出需求文档 | `@product-manager 分析需求` |
| designer | 调用 ui-ux-pro-max 生成设计 | `@designer 生成设计文档` |
| frontend-developer | 前端开发，响应走查/缺陷 | `@frontend-developer 开发页面` |

---

## 重要说明

### Vue 2 特定
- 使用 `beforeDestroy` 或 `beforeUnmount`
- 数组/对象 props 需要工厂函数：`default: () => []`

### Vite 特定
- 使用 `import.meta.env` 而非 `process.env`
- `/public` 下的静态资源从根路径访问

### 避免事项
- ❌ 空 catch 块
- ❌ 直接操作 DOM（使用 Vue 响应式）
- ❌ 在模板中放逻辑（使用 methods/computed）

---

## 添加新依赖
添加任何包之前检查是否兼容 Vue 2 和 Node 18+。常用包：`lodash-es`, `dayjs`, `axios`, `vuex`。
