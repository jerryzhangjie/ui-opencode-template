# Project Manager Agent 测试报告

## 测试概要

- **测试时间**: 2026-03-19T05:48:47.042Z ~ 2026-03-19T05:48:48.292Z
- **总耗时**: 1237ms
- **总场景数**: 28
- **通过**: 28 ✅
- **失败**: 0 ❌
- **通过率**: 100.0%

## 详细结果

| 场景 | 类别 | 预期 | 实际 | 耗时 | 结果 | 备注 |
|------|------|------|------|------|------|------|
| 决策引擎: 新做一个用户管理系统 | intent | createProject | createProject | 145ms | ✅ |  |
| 决策引擎: 添加登录功能 | intent | addFeature | addFeature | 86ms | ✅ |  |
| 决策引擎: 修复登录页面样式错位 | intent | uiIssue | uiIssue | 94ms | ✅ | (意图类型匹配) |
| 决策引擎: 调整主题为深色模式 | intent | adjustStyle | adjustStyle | 97ms | ✅ |  |
| 决策引擎: 现在项目进展怎么样了 | intent | projectStatus | projectStatus | 88ms | ✅ |  |
| 决策引擎: 页面加载很慢怎么优化 | intent | performanceIssue | performanceIssue | 84ms | ✅ |  |
| 决策引擎: 登录功能不工作了 | intent | functionalBug | functionalBug | 81ms | ✅ |  |
| 决策引擎: 需求变更了，要加个手机验证码 | intent | requirementChange | requirementChange | 100ms | ✅ |  |
| 决策引擎: 用什么技术栈比较好 | intent | techSelection | techSelection | 100ms | ✅ |  |
| 决策引擎: 做个用户列表页面 | intent | generatePage | generatePage | 76ms | ✅ |  |
| 状态查询 | state | true | true | 96ms | ✅ |  |
| 增强引擎状态查询 | state | true | true | 88ms | ✅ |  |
| 进度查询 | state | true | true | 78ms | ✅ |  |
| 创建里程碑 | milestone | object | object | 2ms | ✅ |  |
| 更新里程碑进度 | milestone | 50 | 50 | 8ms | ✅ |  |
| 查询里程碑进度 | milestone | 50 | 50 | 0ms | ✅ |  |
| 标准调度 dispatch | contract | object | object | 2ms | ✅ |  |
| 并行调度 parallelDispatch | contract | object | object | 3ms | ✅ |  |
| 成功响应 respond | contract | object | object | 6ms | ✅ |  |
| 失败响应 respond | contract | object | object | 1ms | ✅ |  |
| 查询事务 getTransaction | contract | object | object | 0ms | ✅ |  |
| 构建Prompt buildPrompt | contract | string | string | 0ms | ✅ |  |
| 创建并行任务 | parallel | object | object | 0ms | ✅ |  |
| 更新并行任务 - 部分完成 | parallel | in_progress | in_progress | 1ms | ✅ |  |
| 更新并行任务 - 全部完成 | parallel | completed | completed | 1ms | ✅ |  |
| 相似度: "添加登录功能" vs "添加" | similarity | >= 0.5 | 0.650 | 0ms | ✅ |  |
| 相似度: "修复bug" vs "修复" | similarity | >= 0.5 | 0.680 | 0ms | ✅ |  |
| 相似度: "新做一个系统" vs "新项目" | similarity | >= 0.1 | 0.150 | 0ms | ✅ |  |

## 发现的缺陷

✅ 未发现缺陷

## 性能统计

| 类别 | 数量 | 平均耗时 |
|------|------|----------|
| intent | 10 | 95.1ms |
| state | 3 | 87.3ms |
| milestone | 3 | 3.3ms |
| contract | 6 | 2.0ms |
| parallel | 3 | 0.7ms |
| similarity | 3 | 0.0ms |

---
*报告生成时间: 2026-03-19T05:48:48.292Z*
