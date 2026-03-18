# OpenCode 项目上下文管理

本目录用于存储项目开发过程中的上下文信息，实现 Agent 间自动上下文共享。

## 目录结构

```
context/
├── current-task.md    # 当前任务状态
├── latest-prd.md      # 需求文档摘要（自动生成）
└── latest-ui.md       # UI设计文档摘要（自动生成）
```

## 使用方式

### 加载项目上下文

在前端开发时，Agent 会自动调用 `project-context` skill 来加载：

1. **技术栈信息** - 从 AGENTS.md 读取
2. **代码规范** - 项目开发规范
3. **当前任务** - 从 current-task.md 读取
4. **需求文档** - 从 latest-prd.md 或 doc/PRD-*.md 读取
5. **设计文档** - 从 latest-ui.md 或 doc/UI-*.md 读取

### 上下文自动更新

| 阶段 | 自动保存 |
|------|----------|
| 需求分析完成 | 保存到 latest-prd.md |
| UI设计完成 | 保存到 latest-ui.md |
| 代码开发完成 | 更新 current-task.md |

## 手动操作

### 查看当前上下文

```bash
# 查看当前任务
cat .opencode/context/current-task.md

# 查看最新需求
cat .opencode/context/latest-prd.md

# 查看最新设计
cat .opencode/context/latest-ui.md
```

### 清除上下文

```bash
rm -rf .opencode/context/*.md
```

## 优势

- ✅ 减少重复信息传递
- ✅ Agent 自动加载相关文档
- ✅ 支持断点续传（开发中断后继续）
- ✅ 便于回顾项目历史
