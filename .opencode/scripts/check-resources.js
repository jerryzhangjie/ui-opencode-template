#!/usr/bin/env node

/**
 * 项目资源检查脚本
 * 用于在开发前检查项目现有资源
 * 输出 JSON 格式供 Agent 使用
 */

const fs = require('fs');
const path = require('path');

const PROJECT_DIR = process.argv[2] || process.cwd();

function checkResources() {
  const result = {
    projectPath: PROJECT_DIR,
    timestamp: new Date().toISOString(),
    dependencies: [],
    components: [],
    layoutComponents: [],
    utils: [],
    views: [],
    router: null,
    styles: null,
    hasSrc: false
  };

  // 检查 src 目录
  const srcDir = path.join(PROJECT_DIR, 'src');
  result.hasSrc = fs.existsSync(srcDir);

  if (!result.hasSrc) {
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  // 检查 package.json
  const packageJson = path.join(PROJECT_DIR, 'package.json');
  if (fs.existsSync(packageJson)) {
    try {
      const pkg = JSON.parse(fs.readFileSync(packageJson, 'utf-8'));
      const deps = { ...pkg.dependencies, ...pkg.devDependencies };
      const coreDeps = ['vue', 'echarts', 'axios', 'vue-router', 'vuex', 'lodash', 'dayjs'];
      result.dependencies = coreDeps.filter(d => deps[d]).map(d => ({ name: d, version: deps[d] }));
    } catch (e) {
      // ignore
    }
  }

  // 检查组件目录
  const componentsDir = path.join(srcDir, 'components');
  if (fs.existsSync(componentsDir)) {
    result.components = walkDir(componentsDir, '.vue').map(f => 
      f.replace(componentsDir + '/', '').replace('.vue', '')
    );
  }

  // 检查布局组件
  const layoutDir = path.join(componentsDir, 'layout');
  if (fs.existsSync(layoutDir)) {
    result.layoutComponents = walkDir(layoutDir, '.vue').map(f => 
      f.replace(layoutDir + '/', '').replace('.vue', '')
    );
  }

  // 检查工具函数
  const utilsDir = path.join(srcDir, 'utils');
  if (fs.existsSync(utilsDir)) {
    result.utils = walkDir(utilsDir, '.js').map(f => 
      f.replace(utilsDir + '/', '').replace('.js', '')
    );
  }

  // 检查视图页面
  const viewsDir = path.join(srcDir, 'views');
  if (fs.existsSync(viewsDir)) {
    result.views = walkDir(viewsDir, '.vue').map(f => 
      f.replace(viewsDir + '/', '').replace('.vue', '')
    );
  }

  // 检查路由
  const routerFile = path.join(srcDir, 'router', 'index.js');
  if (fs.existsSync(routerFile)) {
    result.router = { path: 'src/router/index.js', exists: true };
  }

  // 检查样式
  const styleFile = path.join(srcDir, 'assets', 'styles', 'global.css');
  if (fs.existsSync(styleFile)) {
    result.styles = { path: 'src/assets/styles/global.css', exists: true };
  }

  console.log(JSON.stringify(result, null, 2));
}

function walkDir(dir, ext) {
  const files = [];
  if (!fs.existsSync(dir)) return files;
  
  const items = fs.readdirSync(dir);
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      files.push(...walkDir(fullPath, ext));
    } else if (item.endsWith(ext)) {
      files.push(fullPath);
    }
  }
  return files;
}

checkResources();
