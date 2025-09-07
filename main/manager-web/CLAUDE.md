# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

这是小智ESP32服务器的管理后台Web应用，采用Vue 2 + Element UI架构，专注于AI设备管理和用户交互界面。

## 开发命令

```bash
# 开发服务器启动（端口8001，代理到8002）
npm run serve

# 生产构建
npm run build

# 打包分析（开启Bundle Analyzer）
npm run analyze
```

## 核心架构设计

### 样式设计理念与规范

**暗黑科技紫主题系统**
- 主色调：`#C966FF`（科技紫）
- 采用玻璃拟态（Glassmorphism）设计语言
- 全站使用透明背景 + 背景模糊的视觉层次
- Aurora动画背景作为全站基础背景层

**样式架构层次**
```
src/styles/
├── global.scss              # 全局玻璃效果和基础变量
├── element-ui-dark.scss      # Element UI暗黑主题覆盖
├── element-ui-override.scss  # Element UI组件定制
└── themes/
    └── dark-tech.scss        # 主题色彩系统和变量定义
```

**设计系统原则**
1. **透明层次设计**：所有容器使用`rgba(26, 26, 46, 0.85)`的半透明背景
2. **毛玻璃效果**：统一使用`backdrop-filter: blur(20px)`
3. **发光边框**：重要元素使用`#C966FF`渐变发光效果
4. **色彩渐变**：交互状态使用紫色系渐变过渡
5. **Aurora背景**：固定位置的全屏极光动画作为基础背景

### 技术架构

**Vue 2.6 + Element UI 2.15 技术栈**
- 状态管理：Vuex 3.x
- 路由：Vue Router 3.x
- HTTP客户端：axios + flyio
- 音频处理：opus-decoder + opus-recorder
- WebGL动画：OGL库（Aurora组件）

**项目结构**
```
src/
├── apis/               # API接口模块化管理
│   ├── api.js         # 统一API入口
│   └── module/        # 按业务模块划分的接口
├── components/        # 全局组件
│   └── Aurora.vue     # WebGL极光背景动画
├── views/            # 页面组件
├── store/            # Vuex状态管理
├── router/           # 路由配置
├── utils/            # 工具函数
└── styles/           # 样式系统
```

**API架构设计**
- 模块化API管理：按业务领域（user、device、admin等）分离
- 统一错误处理和响应拦截
- 支持开发/生产环境配置切换
- 代理配置：开发时自动代理`/xiaozhi`到本地8002端口

**CDN与Service Worker策略**
- 支持CDN模式动态切换（通过`VUE_APP_USE_CDN`环境变量）
- 自动Service Worker缓存管理
- 生产构建时自动代码分割和资源优化

## 特殊配置

**Webpack优化配置**
- 多线程编译和Terser压缩
- 智能代码分割（vendors/common chunks）
- Gzip压缩和缓存策略
- 支持Bundle分析模式

**开发服务器配置**
- 端口：8001
- 代理：`/xiaozhi` → `http://127.0.0.1:8002`
- 关闭错误覆盖层显示

## 组件开发规范

**Aurora背景组件集成**
- Aurora组件已集成到App.vue作为全站背景
- 颜色配置：`['#1A1A2E', '#C966FF', '#0F0F23']`
- 所有页面容器需要透明化以显示背景效果
- 要让背景能显示Aurora,每次样式改造的时候要注意这个,确保 Aurora 不会被盖住

**玻璃容器组件**
- 使用全局`.glass`类实现标准玻璃效果
- 重要容器使用增强的透明度和模糊效果
- 交互状态需要渐进式的透明度和发光变化

**主题色彩使用**
- 主要交互元素：`#C966FF`
- 悬停状态：`#D985FF`
- 激活状态：`#B347E8`
- 边框发光：`rgba(201, 102, 255, 0.3)`

## 状态管理

**Vuex Store结构**
- `token`：用户认证令牌（localStorage持久化）
- `userInfo`：用户信息和权限状态
- `isSuperAdmin`：超级管理员状态
- `pubConfig`：公共配置（版本信息、备案号、注册开关等）

**认证流程**
- 登录成功后设置token和用户信息到store和localStorage
- 路由守卫检查认证状态
- 支持自动登出和状态重置

## 音频处理

集成Opus编解码器支持实时音频处理，用于AI语音交互功能。

## 性能优化策略

- 生产环境移除console和debugger
- 启用文件系统缓存（.webpack_cache目录）
- 支持CDN外部化主要依赖包
- Gzip压缩静态资源
- Service Worker缓存策略