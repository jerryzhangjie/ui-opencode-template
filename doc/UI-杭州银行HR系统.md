# 杭州银行HR系统 - UI设计文档

## 文档信息

| 项目 | 内容 |
|------|------|
| **文档名称** | 杭州银行HR系统 UI设计规范 |
| **版本** | v1.0 |
| **产品类型** | Dashboard / HR管理后台 |
| **行业** | 金融 / 银行 |
| **技术栈** | Vue 2.75 + Vite + ECharts 5.x + SCSS |
| **设计模式** | Conversion-Optimized (银行风格) |

---

## 1. 设计概要

### 1.1 产品定位

杭州银行HR系统是一款面向银行内部的人力资源管理Dashboard，旨在实现员工数据的可视化管理和决策支持。设计核心在于传达**专业、可靠、安全**的银行形象。

### 1.2 目标用户

- HR管理人员
- 部门主管
- 行领导决策层

### 1.3 核心价值

- **数据可视化**：直观的图表展示人力资源数据
- **专业可信**：银行级UI设计标准
- **安全可靠**：数据展示与权限控制的完美平衡
- **高效决策**：关键指标一目了然

---

## 2. 视觉设计规范

### 2.1 配色方案

本系统采用银行专业配色，以深海军蓝传达信任与稳重，金色点缀体现高端品质。

| 用途 | 颜色名称 | Hex值 | 使用场景 |
|------|----------|-------|----------|
| **主色** | 海军蓝 | `#0F172A` | 导航栏、主要按钮背景、标题文字 |
| **辅助色** | 商务蓝 | `#1E3A8A` | 卡片边框、次级标题、图表主色 |
| **强调色** | 琥珀金 | `#CA8A04` | 登录按钮、重要指标、高亮数据 |
| **成功色** | 翠绿 | `#16A34A` | 正向指标、入职数据、增长趋势 |
| **警告色** | 珊瑚红 | `#DC2626` | 离职数据、负向指标、错误状态 |
| **背景色** | 极光白 | `#F8FAFC` | 页面主背景、卡片背景 |
| **次级背景** | 冰蓝灰 | `#F1F5F9` | 表格奇数行、侧边栏背景 |
| **文字色** | 墨炭黑 | `#020617` | 正文、主要内容 |
| **次级文字** | 石墨灰 | `#475569` | 辅助说明、标签文字 |
| **边框色** | 银边灰 | `#E2E8F0` | 卡片边框、分割线 |

#### 配色应用比例

```
主色 (海军蓝):    ████████████░░░░░░░░ 40%
辅助色 (商务蓝):  ████████░░░░░░░░░░░░ 30%
强调色 (琥珀金):  ███░░░░░░░░░░░░░░░░░ 10%
功能色:           ███░░░░░░░░░░░░░░░░ 10%
背景/其他:        ████████░░░░░░░░░░░ 10%
```

#### 色阶系统

```
#0F172A (最深) ← 主色
#1E293B ← 主色浅色
#334155 ← 悬停态
#475569 ← 禁用态
#64748B ← 边框
#94A3B8 ← 占位符
#CBD5E1 ← 禁用文字
#E2E8F0 ← 分割线
#F1F5F9 ← 次级背景
#F8FAFC (最浅) ← 主背景
```

### 2.2 字体系统

采用 **IBM Plex Sans** 作为主字体，该字体专为金融、银行、企业级应用设计，传达专业、可信的形象。

#### 字体引入

```scss
// 在入口scss文件中引入
@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@300;400;500;600;700&display=swap');
```

#### 字号层级

| 级别 | 字号 | 字重 | 行高 | 用途 |
|------|------|------|------|------|
| **H1** | 32px | 700 | 1.2 | 页面主标题 |
| **H2** | 24px | 600 | 1.3 | 区块标题 |
| **H3** | 18px | 600 | 1.4 | 卡片标题 |
| **H4** | 16px | 500 | 1.4 | 副标题 |
| **Body** | 14px | 400 | 1.5 | 正文内容 |
| **Small** | 12px | 400 | 1.4 | 辅助说明、标签 |
| **Tiny** | 11px | 400 | 1.3 | 图表标签、图例 |

#### 字号应用规范

```scss
// 标题系统
.font-h1 { font-size: 32px; font-weight: 700; line-height: 1.2; }
.font-h2 { font-size: 24px; font-weight: 600; line-height: 1.3; }
.font-h3 { font-size: 18px; font-weight: 600; line-height: 1.4; }
.font-h4 { font-size: 16px; font-weight: 500; line-height: 1.4; }

// 正文系统
.font-body { font-size: 14px; font-weight: 400; line-height: 1.5; }
.font-small { font-size: 12px; font-weight: 400; line-height: 1.4; }
.font-tiny { font-size: 11px; font-weight: 400; line-height: 1.3; }
```

### 2.3 间距系统

采用 4px 基准网格，所有间距值为 4 的倍数。

| 名称 | 数值 | 用途 |
|------|------|------|
| **xs** | 4px | 标签内边距、图标与文字间距 |
| **sm** | 8px | 组件内部紧凑间距 |
| **md** | 16px | 组件间距、卡片内边距 |
| **lg** | 24px | 区块间距 |
| **xl** | 32px | 页面边距、区域间距 |
| **2xl** | 48px | 大区块分割 |

```scss
// 间距变量
$space-xs: 4px;
$space-sm: 8px;
$space-md: 16px;
$space-lg: 24px;
$space-xl: 32px;
$space-2xl: 48px;

// 使用示例
.card { padding: $space-md; margin-bottom: $space-lg; }
.section { padding: $space-xl 0; }
```

### 2.4 阴影与效果

| 名称 | 样式 | 用途 |
|------|------|------|
| **sm** | `0 1px 2px rgba(0,0,0,0.05)` | 轻微阴影、输入框 |
| **md** | `0 4px 6px -1px rgba(0,0,0,0.1)` | 卡片默认阴影 |
| **lg** | `0 10px 15px -3px rgba(0,0,0,0.1)` | 悬浮状态 |
| **xl** | `0 20px 25px -5px rgba(0,0,0,0.1)` | 弹窗、Dropdown |
| **inner** | `inset 0 2px 4px rgba(0,0,0,0.06)` | 按钮按下、输入框内阴影 |

```scss
// 阴影变量
$shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
$shadow-md: 0 4px 6px -1px rgba(0,0,0,0.1);
$shadow-lg: 0 10px 15px -3px rgba(0,0,0,0.1);
$shadow-xl: 0 20px 25px -5px rgba(0,0,0,0.1);

// 圆角
$radius-sm: 4px;
$radius-md: 8px;
$radius-lg: 12px;
$radius-full: 9999px;
```

---

## 3. 组件设计规范

### 3.1 按钮组件

#### 主要按钮 (Primary Button)

- **背景**: `#CA8A04` (琥珀金)
- **文字**: `#FFFFFF`
- **圆角**: 8px
- **内边距**: 12px 24px
- **字重**: 600
- **悬停**: 背景 `#B87A03`，上移 2px，阴影增强
- **按下**: 背景 `#A66B02`，阴影内凹
- **禁用**: 背景 `#CBD5E1`，文字 `#94A3B8`，无交互

```scss
.btn-primary {
  background: #CA8A04;
  color: #FFFFFF;
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: #B87A03;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(202, 138, 4, 0.3);
  }
  
  &:active {
    background: #A66B02;
    transform: translateY(0);
    box-shadow: inset 0 2px 4px rgba(0,0,0,0.1);
  }
  
  &:disabled {
    background: #CBD5E1;
    color: #94A3B8;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
}
```

#### 次要按钮 (Secondary Button)

- **背景**: `#FFFFFF`
- **边框**: 1px solid `#E2E8F0`
- **文字**: `#0F172A`
- **悬停**: 边框 `#1E3A8A`，文字 `#1E3A8A`

#### 文字按钮 (Text Button)

- **文字**: `#1E3A8A`
- **悬停**: 下划线

### 3.2 输入框组件

| 状态 | 边框颜色 | 背景 | 阴影 |
|------|----------|------|------|
| 默认 | `#E2E8F0` | `#FFFFFF` | 无 |
| 聚焦 | `#1E3A8A` | `#FFFFFF` | `0 0 0 3px rgba(30,58,138,0.1)` |
| 错误 | `#DC2626` | `#FEF2F2` | `0 0 0 3px rgba(220,38,38,0.1)` |
| 禁用 | `#E2E8F0` | `#F8FAFC` | 无 |

```scss
.input-field {
  width: 100%;
  height: 44px;
  padding: 0 16px;
  border: 1px solid #E2E8F0;
  border-radius: 8px;
  font-size: 14px;
  color: #020617;
  background: #FFFFFF;
  transition: all 0.2s ease;
  
  &::placeholder {
    color: #94A3B8;
  }
  
  &:focus {
    outline: none;
    border-color: #1E3A8A;
    box-shadow: 0 0 0 3px rgba(30,58,138,0.1);
  }
  
  &.error {
    border-color: #DC2626;
    background: #FEF2F2;
    box-shadow: 0 0 0 3px rgba(220,38,38,0.1);
  }
}
```

### 3.3 卡片组件

```scss
.card {
  background: #FFFFFF;
  border: 1px solid #E2E8F0;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
  transition: all 0.2s ease;
  
  &:hover {
    box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);
  }
  
  // KPI卡片特殊样式
  &.kpi-card {
    border-left: 4px solid #CA8A04;
  }
}
```

### 3.4 导航栏

- **高度**: 64px
- **背景**: `#0F172A` (深海军蓝)
- **文字**: `#FFFFFF`
- **Logo区域**: 左侧 200px
- **用户信息**: 右侧

```scss
.navbar {
  height: 64px;
  background: #0F172A;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 32px;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  
  .logo {
    display: flex;
    align-items: center;
    gap: 12px;
    
    img { height: 36px; }
    
    span {
      color: #FFFFFF;
      font-size: 18px;
      font-weight: 600;
    }
  }
  
  .user-info {
    display: flex;
    align-items: center;
    gap: 16px;
    color: #F8FAFC;
    
    .avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: #1E3A8A;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
    }
  }
}
```

### 3.5 复选框与开关

```scss
.checkbox {
  width: 18px;
  height: 18px;
  border: 2px solid #CBD5E1;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:checked {
    background: #1E3A8A;
    border-color: #1E3A8A;
  }
}

.toggle {
  width: 44px;
  height: 24px;
  background: #CBD5E1;
  border-radius: 12px;
  cursor: pointer;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    width: 20px;
    height: 20px;
    background: #FFFFFF;
    border-radius: 50%;
    top: 2px;
    left: 2px;
    transition: all 0.2s ease;
  }
  
  &.active {
    background: #16A34A;
    
    &::after {
      left: 22px;
    }
  }
}
```

---

## 4. 页面设计

### 4.1 登录页 (Login)

#### 布局结构

```
┌─────────────────────────────────────────────────────┐
│                    [顶部空白 80px]                    │
│  ┌──────────────────────┐  ┌─────────────────────┐ │
│  │                      │  │   登录表单区域        │ │
│  │    银行Logo +        │  │                     │ │
│  │    系统名称           │  │   用户名 [输入框]    │ │
│  │                      │  │   密码 [输入框]      │ │
│  │    欢迎文字           │  │   ☑ 记住密码        │ │
│  │                      │  │   [登录按钮]         │ │
│  │                      │  │   安全退出提示       │ │
│  └──────────────────────┘  └─────────────────────┘ │
│                    [底部空白 80px]                    │
└─────────────────────────────────────────────────────┘
```

#### 视觉规范

| 元素 | 规范 |
|------|------|
| **页面背景** | 渐变: `#0F172A` → `#1E3A8A` (15% → 85% 横向) |
| **左侧区域** | 占比 55%，银行Logo + 系统名称 + 欢迎语 |
| **右侧表单** | 占比 45%，白色卡片 (圆角 16px) |
| **Logo尺寸** | 80px × 80px |
| **表单卡片宽度** | 最大 420px，居中 |
| **输入框高度** | 48px |
| **登录按钮高度** | 52px |

#### 登录表单详细规范

```scss
.login-container {
  min-height: 100vh;
  display: flex;
  background: linear-gradient(135deg, #0F172A 15%, #1E3A8A 85%);
  
  .left-panel {
    flex: 0 0 55%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding-left: 80px;
    
    .logo-area {
      margin-bottom: 32px;
      
      img { width: 80px; height: 80px; }
    }
    
    .title {
      color: #FFFFFF;
      font-size: 36px;
      font-weight: 700;
      margin-bottom: 16px;
    }
    
    .welcome {
      color: rgba(255,255,255,0.8);
      font-size: 18px;
      line-height: 1.6;
    }
  }
  
  .right-panel {
    flex: 0 0 45%;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 40px;
    
    .login-card {
      width: 100%;
      max-width: 420px;
      background: #FFFFFF;
      border-radius: 16px;
      padding: 48px;
      box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);
    }
  }
}
```

#### 组件状态

| 状态 | 表现 |
|------|------|
| **输入错误** | 红色边框 + 红色底部提示文字 |
| **加载中** | 按钮显示 Loading 动画，禁用输入 |
| **登录失败** | 红色错误提示，密码清空，密码框聚焦 |

### 4.2 首页看板 (Dashboard)

#### 布局结构

```
┌──────────────────────────────────────────────────────────────┐
│  导航栏 (64px)                                                │
├──────────────────────────────────────────────────────────────┤
│  页面头部 (搜索栏 + 用户信息 + 刷新按钮)                         │
├──────────────────────────────────────────────────────────────┤
│  KPI 指标卡片行 (4个)                                          │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐                  │
│  │员工总数 │ │本月入职│ │本月离职│ │在编率  │                  │
│  └────────┘ └────────┘ └────────┘ └────────┘                  │
├──────────────────────────────────────────────────────────────┤
│  图表区域 (2行 × 2列)                                         │
│  ┌─────────────────┐  ┌─────────────────┐                     │
│  │  部门人员分布    │  │  人员流动趋势   │                     │
│  │   (饼图)        │  │   (折线图)      │                     │
│  └─────────────────┘  └─────────────────┘                     │
│  ┌─────────────────┐  ┌─────────────────┐                     │
│  │  岗位类型分布    │  │  年龄结构分析    │                     │
│  │   (环形图)       │  │   (条形图)       │                     │
│  └─────────────────┘  └─────────────────┘                     │
└──────────────────────────────────────────────────────────────┘
```

#### KPI 卡片设计

| 指标 | 图标 | 主数值颜色 | 趋势颜色 |
|------|------|------------|----------|
| **员工总数** | 👥 用户组 | `#0F172A` | 固定 |
| **本月入职** | ➕ 上升箭头 | `#16A34A` (正数) | 绿色上升 |
| **本月离职** | ➖ 下降箭头 | `#DC2626` (负数) | 红色下降 |
| **在编率** | 📊 百分比 | `#1E3A8A` | 绿色 >95%，黄色 80-95%，红色 <80% |

```scss
.kpi-card {
  background: #FFFFFF;
  border-radius: 12px;
  padding: 24px;
  border-left: 4px solid #CA8A04;
  display: flex;
  align-items: flex-start;
  gap: 16px;
  
  .kpi-icon {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #F1F5F9;
    
    svg { width: 24px; height: 24px; color: #1E3A8A; }
  }
  
  .kpi-content {
    flex: 1;
    
    .kpi-label {
      font-size: 14px;
      color: #64748B;
      margin-bottom: 8px;
    }
    
    .kpi-value {
      font-size: 28px;
      font-weight: 700;
      color: #0F172A;
      line-height: 1;
    }
    
    .kpi-trend {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 12px;
      margin-top: 8px;
      
      &.positive { color: #16A34A; }
      &.negative { color: #DC2626; }
    }
  }
}
```

#### 图表配色规范

| 图表 | 主色调 | 辅助色 |
|------|--------|--------|
| **部门人员分布饼图** | `#1E3A8A`, `#3B82F6`, `#60A5FA`, `#93C5FD`, `#BFDBFE` | 5个色阶蓝色 |
| **人员流动趋势折线** | 入职: `#16A34A` (翠绿), 离职: `#DC2626` (珊瑚红) | 网格线: `#E2E8F0` |
| **岗位类型环形图** | `#CA8A04`, `#EAB308`, `#FCD34D`, `#FDE68A`, `#FEF3C7` | 5个金色阶 |
| **年龄结构条形图** | `#0F172A`, `#1E293B`, `#334155`, `#475569`, `#64748B` | 5个灰阶 |

```javascript
// ECharts 主题色配置
const chartColors = {
  primary: '#1E3A8A',
  secondary: '#3B82F6',
  accent: '#CA8A04',
  success: '#16A34A',
  danger: '#DC2626',
  neutral: {
    900: '#0F172A',
    800:B',
    700: '#334155',
     '#1E293600: '#475569',
    500: '#64748B',
    400: '#94A3B8',
    300: '#CBD5E1',
    200: '#E2E8F0',
    100: '#F1F5F9',
    50: '#F8FAFC'
  },
  blues: ['#1E3A8A', '#3B82F6', '#60A5FA', '#93C5FD', '#BFDBFE'],
  golds: ['#CA8A04', '#EAB308', '#FCD34D', '#FDE68A', '#FEF3C7'],
  ageBars: ['#0F172A', '#1E293B', '#334155', '#475569', '#64748B']
}
```

#### 图表交互规范

| 交互 | 效果 | 时长 |
|------|------|------|
| **Tooltip 悬浮** | 背景加深，显示详细数值 | 即时 |
| **图例点击** | 显示/隐藏对应数据系列 | 300ms |
| **数据点点击** | 展开详情弹窗 | - |
| **时间切换** | 折线图数据平滑过渡 | 500ms |

---

## 5. 响应式设计

### 5.1 断点定义

| 断点 | 宽度 | 布局变化 |
|------|------|----------|
| **xs** | < 576px | 单列布局，KPI卡片堆叠 |
| **sm** | 576px - 767px | 2列KPI，图表单列 |
| **md** | 768px - 1023px | 2×2 图表，KPI 4列 |
| **lg** | 1024px - 1279px | 标准布局 |
| **xl** | 1280px - 1535px | 宽屏优化 |
| **2xl** | ≥ 1536px | 内容居中，最大宽度 1440px |

### 5.2 响应式规则

```scss
// 断点混合器
$breakpoints: (
  'xs': 576px,
  'sm': 768px,
  'md': 1024px,
  'lg': 1280px,
  'xl': 1536px
);

@mixin respond-to($breakpoint) {
  @if map-has-key($breakpoints, $breakpoint) {
    @media (max-width: map-get($breakpoints, $breakpoint)) {
      @content;
    }
  }
}

// 使用示例
.dashboard {
  @include respond-to('md') {
    .kpi-grid { grid-template-columns: repeat(2, 1fr); }
    .chart-grid { grid-template-columns: 1fr; }
  }
  
  @include respond-to('sm') {
    .kpi-grid { grid-template-columns: 1fr; }
    .navbar { padding: 0 16px; }
  }
}
```

---

## 6. 交互规范

### 6.1 过渡动画

| 场景 | 时长 | 缓动函数 |
|------|------|----------|
| **按钮悬停** | 200ms | `ease-out` |
| **卡片悬浮** | 200ms | `ease-out` |
| **页面切换** | 300ms | `ease-in-out` |
| **图表加载** | 800ms | `ease-out` |
| **下拉展开** | 150ms | `ease` |

```scss
// 过渡基础类
.transition-fast { transition: all 150ms ease; }
.transition-base { transition: all 200ms ease-out; }
.transition-slow { transition: all 300ms ease-in-out; }

// 动画 keyframes
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { 
    opacity: 0;
    transform: translateY(20px);
  }
  to { 
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes countUp {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

// KPI卡片入场动画
.kpi-card {
  animation: slideUp 0.5s ease-out forwards;
  
  &:nth-child(1) { animation-delay: 0ms; }
  &:nth-child(2) { animation-delay: 100ms; }
  &:nth-child(3) { animation-delay: 200ms; }
  &:nth-child(4) { animation-delay: 300ms; }
}
```

### 6.2 加载状态

```scss
// 骨架屏动画
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

.skeleton {
  background: linear-gradient(
    90deg,
    #F1F5F9 25%,
    #E2E8F0 50%,
    #F1F5F9 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 8px;
}

// 按钮加载状态
.btn-loading {
  position: relative;
  color: transparent;
  
  &::after {
    content: '';
    position: absolute;
    width: 20px;
    height: 20px;
    top: 50%;
    left: 50%;
    margin: -10px 0 0 -10px;
    border: 2px solid #FFFFFF;
    border-top-color: transparent;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
```

---

## 7. 可访问性要求

### 7.1 颜色对比度

| 文本类型 | 最小对比度 | 推荐组合 |
|----------|------------|----------|
| **大文本** (≥18px) | 3:1 | `#0F172A` on `#FFFFFF` |
| **普通文本** | 4.5:1 | `#020617` on `#FFFFFF` |
| **辅助文本** | 4.5:1 | `#475569` on `#F8FAFC` |
| **图标** | 3:1 | `#1E3A8A` on `#F8FAFC` |

### 7.2 键盘导航

- 所有交互元素可通过 Tab 键聚焦
- 聚焦状态有可见轮廓线 (`outline: 2px solid #1E3A8A`)
- 支持 Enter/Space 键触发点击
- 支持 Escape 关闭弹窗

```scss
// 聚焦样式
*:focus-visible {
  outline: 2px solid #1E3A8A;
  outline-offset: 2px;
}

// 跳过链接 (用于键盘导航)
.skip-link {
  position: absolute;
  top: -40px;
  left: 0;
  background: #1E3A8A;
  color: #FFFFFF;
  padding: 8px 16px;
  z-index: 1001;
  
  &:focus {
    top: 0;
  }
}
```

### 7.3 屏幕阅读器支持

- 所有图片添加 `alt` 属性
- 图表添加 `aria-label` 描述数据内容
- 按钮文字清晰表达动作
- 表单输入关联 `<label>`

```html
<!-- 正确示例 -->
<img src="logo.png" alt="杭州银行Logo" />
<button aria-label="刷新数据">
  <svg aria-hidden="true">...</svg>
</button>
<label for="username">用户名</label>
<input id="username" type="text" />
```

---

## 8. 图标与Logo规范

### 8.1 图标选择

**推荐图标库**: Heroicons 或 Lucide (SVG格式)

| 用途 | 图标名称 | 尺寸 |
|------|----------|------|
| 员工总数 | `users` | 24×24 |
| 入职 | `user-add` / `arrow-up` | 24×24 |
| 离职 | `user-remove` / `arrow-down` | 24×24 |
| 在编率 | `percent` / `chart-pie` | 24×24 |
| 刷新 | `refresh` | 20×20 |
| 用户 | `user` | 20×20 |
| 登出 | `logout` | 20×20 |
| 搜索 | `search` | 20×20 |
| 设置 | `settings` | 20×20 |

### 8.2 Logo 规范

```scss
// Logo 尺寸规范
.logo {
  // 登录页
  &.login { width: 80px; height: 80px; }
  
  // 导航栏
  &.navbar { height: 36px; width: auto; }
  
  // Favicon
  &.favicon { width: 32px; height: 32px; }
}
```

> **重要**: 禁止使用 emoji 作为图标，必须使用 SVG 格式的 Heroicons 或 Lucide 图标。

---

## 9. 验收检查清单

### 9.1 登录页验收

- [ ] 表单字段完整（用户名、密码）
- [ ] 记住密码复选框功能正常
- [ ] 表单验证错误提示显示正确
- [ ] 登录按钮加载状态正常
- [ ] 响应式布局在各断点正常
- [ ] 键盘导航正常（Tab/Enter）
- [ ] 颜色对比度达标

### 9.2 首页看板验收

- [ ] 4个KPI卡片数据正确显示
- [ ] KPI卡片入场动画流畅
- [ ] 部门人员分布饼图交互正常
- [ ] 人员流动趋势折线图支持时间切换
- [ ] 岗位类型环形图显示正确
- [ ] 年龄结构条形图数据准确
- [ ] 图表 Tooltip 交互正常
- [ ] 数据刷新功能正常
- [ ] 导航栏用户信息正确
- [ ] 响应式布局正常

### 9.3 视觉规范验收

- [ ] 配色严格遵循设计系统
- [ ] 字体层级清晰
- [ ] 间距统一一致
- [ ] 阴影效果正确
- [ ] 无 emoji 图标
- [ ] 所有图标为 SVG 格式

### 9.4 可访问性验收

- [ ] 颜色对比度 ≥ 4.5:1
- [ ] 所有图片有 alt 文本
- [ ] 表单有对应 label
- [ ] 键盘导航完整
- [ ] 聚焦状态可见
- [ ] 支持 `prefers-reduced-motion`

---

## 10. 文件结构建议

```
src/
├── assets/
│   ├── images/
│   │   └── logo.png              # 银行Logo
│   └── icons/                    # SVG图标
├── styles/
│   ├── variables.scss            # 颜色、间距变量
│   ├── typography.scss           # 字体规范
│   ├── components.scss          # 组件基础样式
│   └── animations.scss           # 动画定义
├── components/
│   ├── common/
│   │   ├── Button.vue
│   │   ├── Input.vue
│   │   ├── Card.vue
│   │   └── Loading.vue
│   ├── layout/
│   │   ├── Navbar.vue
│   │   └── Sidebar.vue
│   └── charts/
│       ├── PieChart.vue
│       ├── LineChart.vue
│       ├── DonutChart.vue
│       └── BarChart.vue
├── views/
│   ├── Login.vue
│   └── Dashboard.vue
└── utils/
    └── chartConfig.js            # ECharts配置
```

---

## 附录

### A. 色彩快速参考

```
银行专业配色:
├── 主色:    #0F172A (海军蓝)
├── 辅助色:  #1E3A8A (商务蓝)
├── 强调色:  #CA8A04 (琥珀金)
├── 成功:    #16A34A (翠绿)
├── 危险:    #DC2626 (珊瑚红)
├── 背景:    #F8FAFC (极光白)
└── 文字:    #020617 (墨炭黑)
```

### B. 字体快速参考

```
主字体: IBM Plex Sans
├── 引入: @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@300;400;500;600;700&display=swap')
├── H1:   32px/700
├── H2:   24px/600
├── H3:   18px/600
├── Body: 14px/400
└── Small: 12px/400
```

### C. 技术栈确认

| 项目 | 技术 |
|------|------|
| 框架 | Vue 2.75 |
| 构建 | Vite 5 |
| 路由 | Hash 模式 |
| 图表 | ECharts 5.x |
| 样式 | SCSS |
| 图标 | Heroicons/Lucide SVG |

---

*本文档为杭州银行HR系统 UI设计规范 v1.0*
