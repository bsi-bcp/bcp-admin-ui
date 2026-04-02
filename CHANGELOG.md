# 更新日志

本项目的所有重要更改都将记录在此文件中。

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/)，
版本号遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

## [Unreleased]

### 新增
- **Monaco IntelliSense**: 脚本编辑器启用 JavaScript 自动补全，支持标准 API（console/Array/...）和业务字段补全 (`src/views/integrationConfig/moudel/monaco.vue`)
  - 安装 `monaco-editor-webpack-plugin@4.2.0`，配置 Worker 加载（TypeScript Language Service）
  - 增强编辑器选项：suggest、quickSuggestions、wordBasedSuggestions、parameterHints
  - 新增 `fields` prop：传入字段列表后 `obj.` 自动联想所有属性
  - 实现双重补全：CompletionItemProvider（兜底）+ addExtraLib（类型推断 + hover 提示）
  - 修复内存泄漏：添加 beforeDestroy 生命周期 dispose 编辑器实例
  - 修复 Object.assign 污染 defaultOpts 的 bug

### 重构
- **API CRUD 工厂**: 新建 `src/api/_crud.js` 工厂函数，封装 getPage/getById/submitForm/batchDelete/singleDelete 通用逻辑
- **API 层迁移**: 16 个 API 文件迁移到工厂模式，消除 60%+ 重复代码（menuArr 处理、qs.stringify 等）
  - 第 1 批: role, license, freelist, IntegratedConfigura, customerTenant（纯 CRUD）
  - 第 2 批: datasource, dictionary, order, warnMethod, warnConfig, orgClass, frontComputer（CRUD + 自定义）
  - 第 3 批: Administrative, IntegratedConfig, task（复杂文件，CRUD 部分用工厂）
  - user.js 代码清理（非标准 CRUD，不适用工厂）
- **Bug**: 修复 `addministrative.js` URL 缺少前导 `/` 的问题（`services/fwcore/template` → `/services/fwcore/template`）
- **清理**: 迁移过程中移除 API 文件中的 console.log
- **组件合并**: PropList 和 Freelist 共享底层 `SelectLoader` 组件，消除重复模板和逻辑（`src/components/SelectLoader/`）

### 测试
- **API contract test**: 为 16 个 API 模块新增 139 个 contract test 用例，覆盖全部导出函数的请求 URL、method、params（`tests/unit/api/`）
- **CRUD 工厂测试**: `_crud.spec.js` 12 个用例覆盖工厂函数全部方法和 options 配置
- **重构基线**: 测试覆盖率从 6 文件提升到 23 文件（176 个用例）

### 安全
- **request.js**: 新增 552 错误码处理（密码过期 → 提示用户 + 重定向登录），清理注释代码块
- **date.js**: 消除 Date.prototype 原型污染，改为纯函数 `formatDate(date, fmt)` 导出
- **permission.js**: 动态路由加载添加错误边界，组件缺失时 fallback 到 404 而非白屏；menus 为空时防御处理

### 清理
- **console.log**: 清理全部 42 处 console.log（20 个文件），错误处理改用 console.error，调试日志删除
- **debugger**: 删除 taskStatistics 中遗留的 debugger 语句
- **warnConfig.js**: 修复 `e.message()` 误加调用括号的 bug
- **依赖清理**: 移除 `console`(npm 包)、`script-loader`(未使用)，`eslint-plugin-html` 从 dependencies 移到 devDependencies
- **死代码**: 删除 integrationConfig/index.vue 中 4 个 Node.js 内置模块的错误导入（assert/tls/path/console）

### 基础设施
- **CI 升级**: 3 个 GitHub Actions workflow 从 Node 14 升级到 Node 20，`npm install` 改为 `npm ci`，启用 npm 缓存
- **OpenSSL 兼容**: 添加 `NODE_OPTIONS=--openssl-legacy-provider` 环境变量（webpack 4 + Node 17+ 兼容）
- **Dockerfile**: 改为多阶段构建（node:20-alpine 构建 + nginx:1.25-alpine 运行），新增 `.dockerignore`
- **Monaco 字段接线**: `getDatasourceFields` API + index.vue 打开节点对话框时自动获取字段传递给编辑器（后端接口就绪后自动生效）

### 文档
- **重构方案**: 新增 `docs/refactoring-plan-phase2-3.md` Phase 2-3 完整方案 + 7 项风险评估
- **Monaco 分析**: 新增 `docs/monaco-intellisense-analysis.md` IntelliSense 问题根因 + 4 阶段优化方案

### 修复
- **安全**: 移除生产环境 MockXHR 加载，改为仅 development 环境启用 (`src/main.js`)
- **安全**: 移除 permission.js 中泄露 session token 的 console.log
- **Bug**: 修复 request.js 响应拦截器中 `this.$router` 在模块上下文崩溃的问题，改用 `router.push`
- **依赖**: 锁定 qs 版本为 `^6.14.1`，原为 `latest` 导致构建不可复现
- **Bug**: 修改用户名称后导航栏不更新 — 编辑当前用户后刷新 Vuex 缓存 (`src/views/user/index.vue`)
- **安全**: auth.js Cookie 安全标志逻辑修正 — 生产环境设置 `secure: true, sameSite: 'Strict'` (`src/utils/auth.js`)
- **安全**: permission.js 路径白名单从模糊匹配改为精确前缀匹配，防止鉴权绕过 (`src/permission.js`)
- **安全**: request.js 响应拦截器 403 处理添加 await，修复竞态条件 (`src/utils/request.js`)
- **Bug**: request.js Network Error 和 HTTP 403 错误处理返回 undefined 改为正确的 Promise.reject (`src/utils/request.js`)
- **内存泄漏**: Dashboard ECharts 4 个实例添加 beforeDestroy dispose (`src/views/dashboard/index.vue`)
- **Bug**: user.js Vuex State 缺少 orgName 声明导致非响应式更新 (`src/store/modules/user.js`)
- **测试**: 修复 validate.spec.js 用例与 validUsername 实现不一致的问题

### 安全
- **依赖**: axios 从 0.18.1 升级到 0.21.4，修复 SSRF 和 ReDoS 漏洞 (`package.json`)

### 变更
- **代码质量**: ESLint `no-console` 规则从 off 改为 warn 级别（允许 warn/error，console.log 会警告）
- **构建**: 文件名从时间戳改为 contenthash，浏览器缓存不再每次构建全部失效 (`vue.config.js`)
- **CI**: 移除 `continue-on-error: true`，测试失败将阻断构建 (`.github/workflows/ci.yml`)
- **环境**: 删除无效的 .env.uat 配置（指向不存在的服务器），.env.production 改为 `/bcp-api` Nginx 代理
- **环境**: 移除 package.json 中 build:uat 脚本

### 文档
- **架构评审**: 新增 `docs/architecture-review-2026-04-02.md` 完整架构评审报告
- **重构计划**: 新增 `docs/refactoring-plan-2026-04-02.md` 5 阶段架构优化方案
- **CLAUDE.md**: 更新环境配置表和部署描述，反映 IDE 合并后的单环境架构

### 内部（代码结构变更）
- request.js 响应拦截器重构：回调改为 async，错误处理统一返回 rejected Promise
- auth.js 简化：删除注释代码和调试日志，Cookie 设置逻辑从 6 行精简到 2 行
- permission.js 清理：删除 2 处 console.log，修复白名单判断逻辑
- dashboard/index.vue 生命周期：flowChart 从局部变量改为实例属性，添加 beforeDestroy 钩子
- vue.config.js：删除运行时 Timestamp 变量，改用 webpack 内置 contenthash

---

## [1.2.0] - 2025-01-11

### 新增
- **Docker Hub 集成**: 自动构建并推送镜像到 Docker Hub
- **Docker Hub 徽章**: README 添加镜像拉取次数徽章
- **快速部署文档**: 添加 docker pull 一键部署说明
- **镜像标签说明**: 文档化 latest、master、版本号等标签

### 变更
- **Docker 工作流**: 配置自动推送到 zhangbq1681/bcp-admin-ui
- **README 更新**: 优化 Docker 部署章节结构

### 基础设施
- Docker Hub 自动化推送流水线
- 多标签镜像发布（latest、分支名、版本号、commit SHA）

---

## [1.1.0] - 2025-01-11

### 新增
- **项目截图**: 添加登录、仪表盘、用户管理、任务管理、数据源配置截图
- **贡献指南**: CONTRIBUTING.md 完整的贡献流程文档
- **Issue 模板**: Bug 报告和功能请求表单式模板
- **PR 模板**: 标准化的 Pull Request 描述模板
- **更新日志**: CHANGELOG.md 版本变更记录
- **行为准则**: CODE_OF_CONDUCT.md 社区行为规范
- **安全策略**: SECURITY.md 漏洞报告和安全指南
- **Dependabot**: 自动依赖更新配置（npm、GitHub Actions、Docker）
- **Husky**: Git pre-commit 钩子，提交前自动运行 ESLint
- **Commit 规范**: commit-msg 钩子强制执行 Conventional Commits 格式

### 变更
- **EditorConfig**: 增强代码风格配置，支持更多文件类型
- **CI 工作流**: 修复 Node.js 版本兼容性问题，使用 Node.js 14
- **Release 工作流**: 添加 contents: write 权限，修复自动发布

### 基础设施
- lint-staged 暂存文件代码检查
- 依赖分组更新（dev-dependencies、test-dependencies）
- 忽略核心包主版本更新（vue、element-ui、vuex、vue-router）

---

## [1.0.0] - 2025-01-11

### 新增
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

### 技术栈
- Vue 2.6.10
- Element UI 2.10.1
- Vuex 3.1.0
- Vue Router 3.0.6
- Axios 0.18.1
- ECharts 5.6.0
- Monaco Editor 0.27.0

### 基础设施
- Docker 部署支持
- Docker Compose 编排配置
- Nginx 反向代理配置
- GitHub Actions CI/CD 工作流
- 自动化 Release 发布

### 文档
- README 项目文档
- CONTRIBUTING 贡献指南
- Issue 和 PR 模板
- MIT 开源许可证

---

## 版本说明

### 版本号格式

`主版本号.次版本号.修订号`

- **主版本号**: 不兼容的 API 变更
- **次版本号**: 向下兼容的功能新增
- **修订号**: 向下兼容的问题修复

### 变更类型

- `新增` - 新功能
- `变更` - 对现有功能的更改
- `弃用` - 即将移除的功能
- `移除` - 已移除的功能
- `修复` - Bug 修复
- `安全` - 安全漏洞修复

---

[Unreleased]: https://github.com/bsi-bcp/bcp-admin-ui/compare/v1.2.0...HEAD
[1.2.0]: https://github.com/bsi-bcp/bcp-admin-ui/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/bsi-bcp/bcp-admin-ui/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/bsi-bcp/bcp-admin-ui/releases/tag/v1.0.0
