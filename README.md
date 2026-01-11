# BCP Admin UI

一个基于 Vue 2.x + Element UI 的企业级后台管理系统，提供数据集成、任务调度、权限管理等功能。

## 技术栈

- **前端框架**: Vue 2.x
- **UI 组件库**: Element UI
- **状态管理**: Vuex
- **路由**: Vue Router
- **HTTP 请求**: Axios
- **图表**: ECharts
- **代码编辑器**: Monaco Editor

## 功能模块

- **用户管理**: 用户账号的增删改查、状态管理
- **角色管理**: 角色权限配置、菜单授权
- **菜单管理**: 动态菜单配置
- **组织管理**: 组织架构管理
- **租户管理**: 多租户支持
- **数据源管理**: 多数据源配置与管理
- **任务管理**: 定时任务配置与调度
- **任务监控**: 任务执行记录与统计
- **字典管理**: 系统字典维护
- **告警配置**: 告警规则与通知方式配置
- **接口管理**: ERP 接口与系统接口管理
- **操作日志**: 用户操作记录查询

## 快速开始

### 环境要求

- Node.js >= 8.9
- npm >= 3.0.0

### 安装依赖

```bash
npm install
```

### 开发环境运行

```bash
npm run dev
```

### 生产环境构建

```bash
# 生产环境
npm run build:prod

# UAT 环境
npm run build:uat

# 预发布环境
npm run build:stage
```

### 代码检查

```bash
npm run lint
```

### 运行测试

```bash
npm run test:unit
```

## 项目结构

```
src/
├── api/            # API 接口
├── assets/         # 静态资源
├── components/     # 公共组件
├── icons/          # SVG 图标
├── layout/         # 布局组件
├── router/         # 路由配置
├── store/          # Vuex 状态管理
├── styles/         # 全局样式
├── utils/          # 工具函数
└── views/          # 页面视图
```

## 浏览器支持

支持现代浏览器和 IE10+。

| IE / Edge | Firefox | Chrome | Safari |
| --------- | ------- | ------ | ------ |
| IE10, IE11, Edge | last 2 versions | last 2 versions | last 2 versions |

## 开源协议

[MIT License](LICENSE)
