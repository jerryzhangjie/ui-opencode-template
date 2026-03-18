#!/bin/bash

# ==============================================
# 项目资源检查脚本
# 用于在开发前检查项目现有资源
# ==============================================

PROJECT_DIR="${1:-.}"

echo "========================================"
echo "🔍 项目资源检查"
echo "========================================"
echo ""

# 1. 检查项目目录
if [ ! -d "$PROJECT_DIR/src" ]; then
    echo "❌ 未找到 src 目录，请确认项目路径"
    exit 1
fi

echo "✅ 项目路径: $PROJECT_DIR"
echo ""

# 2. 检查 package.json
echo "📦 已安装依赖:"
if [ -f "$PROJECT_DIR/package.json" ]; then
    cat "$PROJECT_DIR/package.json" | grep -E '"(vue|echarts|axios|vue-router|vuex|lodash|dayjs)"' | sed 's/^/  - /' || echo "  (无核心依赖)"
else
    echo "  ❌ package.json 不存在"
fi
echo ""

# 3. 检查已有组件
echo "📂 已有组件:"
if [ -d "$PROJECT_DIR/src/components" ]; then
    find "$PROJECT_DIR/src/components" -name "*.vue" | sed 's|'"$PROJECT_DIR/src/components/"'||' | sed 's/.vue$//' | sed 's|/|.|g' | sed 's/^/  - /' || echo "  (无组件)"
else
    echo "  ❌ components 目录不存在"
fi
echo ""

# 4. 检查布局组件
echo "🏗️ 布局组件:"
if [ -d "$PROJECT_DIR/src/components/layout" ]; then
    find "$PROJECT_DIR/src/components/layout" -name "*.vue" | sed 's|'"$PROJECT_DIR/src/components/layout/"'||' | sed 's/.vue$//' | sed 's/^/  - /' || echo "  (无布局组件)"
else
    echo "  ⚪ 无独立布局组件目录"
fi
echo ""

# 5. 检查工具函数
echo "🛠️ 工具函数:"
if [ -d "$PROJECT_DIR/src/utils" ]; then
    find "$PROJECT_DIR/src/utils" -name "*.js" | sed 's|'"$PROJECT_DIR/src/utils/"'||' | sed 's/.js$//' | sed 's/^/  - /' || echo "  (无工具函数)"
else
    echo "  ⚪ 无工具函数目录"
fi
echo ""

# 6. 检查路由配置
echo "🛤️ 路由配置:"
if [ -f "$PROJECT_DIR/src/router/index.js" ]; then
    echo "  ✅ 路由文件存在"
    grep -E "path:" "$PROJECT_DIR/src/router/index.js" | sed "s/.*path: *'/'*//" | sed "s/'.*//" | sed 's/^/    - \//' | head -10
else
    echo "  ❌ 路由文件不存在"
fi
echo ""

# 7. 检查样式文件
echo "🎨 样式文件:"
if [ -f "$PROJECT_DIR/src/assets/styles/global.css" ]; then
    echo "  ✅ 全局样式存在"
else
    echo "  ⚪ 无全局样式文件"
fi
echo ""

# 8. 检查视图页面
echo "📄 已有页面:"
if [ -d "$PROJECT_DIR/src/views" ]; then
    find "$PROJECT_DIR/src/views" -name "*.vue" | sed 's|'"$PROJECT_DIR/src/views/"'||' | sed 's/.vue$//' | sed 's/^/  - /' || echo "  (无页面)"
else
    echo "  ❌ views 目录不存在"
fi
echo ""

echo "========================================"
echo "✅ 检查完成"
echo "========================================"
