# 更新日志

本项目的所有重要更改都将记录在此文件中。

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/)，
版本号遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

## [Unreleased]

### 计划中
- 暗黑模式支持
- 国际化 (i18n) 支持
- 更多图表组件

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

[Unreleased]: https://github.com/paul-zhang-sudo/bcp-admin-ui/compare/v1.1.0...HEAD
[1.1.0]: https://github.com/paul-zhang-sudo/bcp-admin-ui/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/paul-zhang-sudo/bcp-admin-ui/releases/tag/v1.0.0
