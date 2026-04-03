# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

BCP Admin UI — BCP 1.0（集成IDE）的企业管理后台前端。

**技术栈**: Vue 2.6.10 | Element UI 2.10.1 | ECharts 5.6.0 | Monaco Editor 0.27.0 | Axios 0.21.4 | Vuex 3.1.0 | Vue Router 3.0.6

## Commands

```bash
# Development
npm run dev                # Dev server on port 9528

# Build
npm run build:prod         # Production build (nginx proxy)
npm run build:stage        # Staging
npm run build:baiwei       # Baiwei production (nginx proxy, Makefile 使用)

# Code Quality
npm run lint               # ESLint check and auto-fix
npm run svgo               # Optimize SVG icons

# Testing
npm run test:unit          # Jest unit tests
npm run test:ci            # Lint + unit tests (CI pipeline)

# Run a single test file
npx jest tests/unit/utils/validate.spec.js
```

## Code Style (ESLint enforced)

- 2 空格缩进，单引号，无分号，无尾逗号
- `space-before-function-paren`: 禁止（`function() {}` 不是 `function () {}`）
- `eqeqeq`: 必须用 `===`（null 除外）
- `prefer-const`: 不修改的变量必须用 `const`
- `no-console`: warn 级别（允许 `console.warn`/`console.error`，`console.log` 会警告）
- `no-debugger`: 仅开发环境允许
- Vue: `name-property-casing` 必须 PascalCase，允许 `v-html`

## Git Conventions

Husky 强制执行：
- **pre-commit**: lint-staged 对暂存的 `.js/.vue` 文件运行 ESLint
- **commit-msg**: 必须遵循常规提交格式

```
<type>(<scope>): <subject>
# 示例: feat(user): 添加用户登录功能
# type: feat|fix|docs|style|refactor|perf|test|chore|revert
```

分支命名: `feature/xxx`, `fix/xxx`, `docs/xxx`, `refactor/xxx`, `style/xxx`, `test/xxx`

## Architecture

### Authentication & Permission Flow

1. **Login**: 用户名 + MD5(密码) → `POST /services/fwcore/login` → Token 存入 cookie (`VSESSIONID`)
2. **License 检查**: 登录时验证 license 有效期，临近过期弹出倒计时警告
3. **Route Guard** (`src/permission.js`): 拦截导航、验证 token，白名单: `/login`, `/404`, `/authLogin`
4. **动态路由**: `user/getInfo` 获取用户菜单 → `permission/generateRoutes` 从后端菜单配置动态创建路由。路由使用 `require` 异步加载: `component: (resolve) => require(['@/views/xxx'], resolve)`
5. **错误码**: 403→重定向登录, 550→显示错误, 552→强制修改密码

### State Management (Vuex)

```
src/store/
├── modules/
│   ├── user.js        # Token(VSESSIONID cookie), login/logout, 用户信息
│   ├── permission.js  # 从后端菜单动态生成路由
│   ├── app.js         # Sidebar 状态, 设备类型 (desktop/mobile)
│   └── settings.js    # UI 设置 (fixedHeader, sidebarLogo)
└── getters.js         # sidebar, device, token, avatar, name, orgName, roles, cur_user, permission_routes
```

### API Pattern

集中请求封装 (`src/utils/request.js`):
- Base URL: `VUE_APP_BASE_API` 环境变量
- `withCredentials: true`, 超时 15s
- 请求拦截器自动注入 `b-token` header
- 响应拦截器处理 403/550/552 错误码

```javascript
// 标准 CRUD 模式
import request from '@/utils/request'
const URL = { resource: '/services/fwcore/resource' }

getPage(params)      → GET    /services/fwcore/{resource}
submitForm(params)   → POST (新建) 或 PUT /services/fwcore/{resource}/:id (编辑)
batchDelete(params)  → DELETE /services/fwcore/{resource}?items=... (qs.stringify)
singleDelete(id)     → DELETE /services/fwcore/{resource}/:id
```

### Key Business Views

- `src/views/integrationConfig/` — **核心视图**，集成流配置，任务管线 (input/transform/output 节点)，最复杂的视图
- `src/views/dashboard/` — ECharts 仪表盘 (CPU/内存/磁盘/流量/失败排行)
- `src/views/login/` — 登录 (MD5 密码, 密码策略, license 检查)
- `src/views/authLogin/` — SSO 单点登录
- `src/components/ModFilter/` — 通用 CRUD 数据表格，多数视图基于此组件

### View Module Pattern

各功能模块 (`src/views/`) 典型结构:
- `index.vue` — 主页面, 使用 `<mod-filter :datas="datas">` 渲染数据表格
- `datas` 对象定义筛选条件、表格列、分页配置
- 对话框表单用于新增/编辑, `subFormDataRule` 定义校验规则
- 对应 API 文件在 `src/api/`

## Environment Configuration

| 文件 | NODE_ENV | VUE_APP_BASE_API | 说明 |
|------|----------|------------------|------|
| `.env.development` | development | `http://localhost:8819` | 本地开发, mock 代理 |
| `.env.production` | production | `/bcp-api` | 生产构建, Nginx 代理 |
| `.env.staging` | UAT | `/bcp-api` | Staging 构建 |
| `.env.baiwei` | production | `/bcp-api` | 百维生产, Nginx 代理 |

**开发环境 Mock**: `vue.config.js` 中 devServer proxy 将 `VUE_APP_BASE_API` 请求转发到 `mock/mock-server.js`。`src/main.js` 中 `mockXHR()` 仅在 development 环境加载。

## Build & Deploy

- **Docker**: `nginx:1.25-alpine` 基础镜像, 静态文件 → `/usr/share/nginx/html`, 端口 80
- **Docker Hub**: `zhangbq1681/bcp-admin-ui` (tags: `latest`, `master`, `v1.x.0`)
- **Nginx**: SPA 路由 (`try_files`), 反向代理 `/bcp-api/` → `http://bcp-admin:8819/`, gzip 压缩, CORS
- **docker-compose.yml**: 服务 `bcp-admin-ui`, 外部网络 `bcp-network`
- **Makefile**: 华为云 SWR 推送 (`swr.cn-north-4.myhuaweicloud.com/bcp-cloud/bcp-admin-ui`)
- **CI/CD**: 3 个 GitHub Actions — `ci.yml` (lint+test), `docker.yml` (构建推送镜像), `release.yml` (创建 Release)
- **Release**: `git tag v1.x.0 && git push origin v1.x.0` 触发自动构建+发布

## Build Config & Styling

- 路径别名: `@` → `src/`
- SVG Sprite Loader: `src/icons/` 目录下 SVG 自动注册为 `<svg-icon>` 组件
- SCSS 变量: `src/styles/variables.scss`，Element UI 覆写: `src/styles/element-ui.scss`
- CSS 命名: `.mod-*` (模块), `.app-container` (视图容器, padding 20px)

## Backend API

后端源码: `../md-bcp-fw-core/` (Gitee `szbsi/fw-core-micro`), Java 8 / Spring Boot 2.3.7 / MyBatis, 端口 8819。
Agent 引擎: `../md-bcp-agent/` (GitHub `bsi-bcp/bcp-md-agent`), 接收后端下发的集成配置。

前端视图与后端 Controller 一一对应，命名规则: `src/views/{module}/` → `src/api/{module}.js` → 后端 `/services/fwcore/{resource}` 端点。核心 Controller: `MdIntegrationConfigController`（集成配置）、`FwUserController`（用户，19端点）。

## 生产部署 (ECS-139: 139.9.27.37)

```
https://bcpcloud.cn
  → Host Nginx (:443 HTTPS, /usr/local/nginx)
    → 静态文件: /usr/local/bcpAdmin/ (前端 SPA)
    → /bcp-api/* 反向代理 → localhost:8443
      → fw-core-micro (/usr/local/fw-core-micro/app.jar, nohup 启动)
        → MySQL (139.9.42.180:3306, bsi-admin-test)
```

非容器部署。统一入口 bcpcloud.cn（IDE-124 已下线，不再区分生产/测试）。其他域名: grafana.bcpcloud.cn→:3000

## Known Issues

- API 文件命名: `Administrative.js` vs `addministrative.js`（两者操作不同 endpoint，已确认非重复）
- `src/views/integrationConfig/index.vue` 单文件 1651 行，待拆分（建议推迟到业务需求驱动时再执行）

## Architecture Review & Refactoring

架构评审报告: `docs/architecture-review-2026-04-02.md` | 重构计划: `docs/refactoring-plan-2026-04-02.md`

已完成: P0-P4 安全加固、API CRUD 工厂重构(`src/api/_crud.js`)、SelectLoader 组件合并、Monaco IntelliSense、console.log 全量清理。详见 `docs/refactoring-plan-phase2-3.md`。
