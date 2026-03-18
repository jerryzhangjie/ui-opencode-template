# 开发输入文件

> 由项目经理自动生成，供前端开发Agent使用

## 项目信息

| 字段 | 值 |
|------|-----|
| 项目名称 | {{PROJECT_NAME}} |
| 生成日期 | {{GENERATE_DATE}} |
| 需求版本 | {{PRD_VERSION}} |
| 设计版本 | {{UI_VERSION}} |

---

## 一、核心功能模块

### 功能列表

| 序号 | 模块名称 | 优先级 | 描述 |
|------|----------|--------|------|
| {{NO}} | {{MODULE_NAME}} | {{PRIORITY}} | {{DESCRIPTION}} |

### 用户权限体系

```
{{USER_ROLES}}
```

---

## 二、技术要求

### 技术栈

- 前端框架：{{FRONTEND_FRAMEWORK}}
- 路由模式：{{ROUTER_MODE}}
- 状态管理：{{STATE_MANAGEMENT}}
- 数据可视化：{{CHART_LIB}}

### 安全性要求

```
{{SECURITY_REQUIREMENTS}}
```

---

## 三、UI设计规范

### 色彩规范

| 主题 | 主色 | 辅色 | 背景 |
|------|------|------|------|
| 浅色 | {{LIGHT_PRIMARY}} | {{LIGHT_SECONDARY}} | {{LIGHT_BG}} |
| 深色 | {{DARK_PRIMARY}} | {{DARK_SECONDARY}} | {{DARK_BG}} |

### 核心页面

| 页面 | 路由 | 核心元素 |
|------|------|----------|
| {{PAGE_NAME}} | {{ROUTE}} | {{CORE_ELEMENTS}} |

---

## 四、项目资源清单

### 已安装依赖

```
{{INSTALLED_DEPENDENCIES}}
```

### 已有组件

| 组件名 | 路径 | 说明 |
|--------|------|------|
| {{COMPONENT_NAME}} | {{COMPONENT_PATH}} | {{DESCRIPTION}} |

### 已有工具

| 工具名 | 路径 | 说明 |
|--------|------|------|
| {{UTILS_NAME}} | {{UTILS_PATH}} | {{DESCRIPTION}} |

---

## 五、开发约束

### 必须遵守

1. 使用项目已有组件和工具函数
2. 遵循 src/utils/ 下的代码规范
3. 页面路由使用 hash 模式
4. 组件使用动态组件前必须验证存在性

### 禁止事项

1. 禁止直接操作 DOM
2. 禁止使用未安装的依赖
3. 禁止创建与现有组件重复的组件

---

## 六、参考文档

- 完整需求文档：`doc/PRD-{{PROJECT_NAME}}.md`
- 完整设计文档：`doc/UI-{{PROJECT_NAME}}.md`
- 项目规范：`AGENTS.md`
