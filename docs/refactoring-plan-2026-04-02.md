# BCP Admin UI 架构优化重构计划

**项目:** md-bcp-admin-ui (BCP 1.0 管理前端)
**制定日期:** 2026-04-02
**项目状态:** 维护模式（BCP 2.0/N8N 为新方向）| 11+ 生产客户 | 1-2 人团队
**前置:** 架构评审 P0 已完成 5 项 + P1 已完成 10 项（含深度探索新发现 + 迁移 Bug）
**进度:** Phase 1 ✅ 已完成 | Phase 2 待执行（API 层重构）

---

## 一、深度探索发现总览

通过 6 轮 Agent 深度探索（核心架构 / 视图组件 / API 依赖 / CRUD 重复模式 / Store 路由权限 / 构建测试 CI），发现 **48 项问题**，按严重度和影响范围分为 5 个 Phase。

### 问题分布统计

| 类别 | 严重 | 高 | 中 | 低 | 合计 |
|------|------|---|---|---|------|
| 安全漏洞 | 3 | 4 | 3 | 1 | 11 |
| 代码质量 | 1 | 3 | 6 | 3 | 13 |
| 架构设计 | 1 | 3 | 4 | 2 | 10 |
| 工程基建 | 1 | 2 | 4 | 1 | 8 |
| 性能问题 | 0 | 2 | 3 | 1 | 6 |
| **合计** | **6** | **14** | **20** | **8** | **48** |

---

## 二、Phase 1 — 安全与稳定性（本周，2-3 人天）

> 目标：消除所有已知安全漏洞和生产稳定性风险

### 1.1 axios 升级 0.18.1 → 0.21.4

| 项 | 详情 |
|---|------|
| **文件** | `package.json:22` |
| **问题** | 0.18.1 有 SSRF + ReDoS 两个已知 CVE，5+ 年未修复 |
| **方案** | 升级到 0.21.4（0.x 最后安全版，API 兼容） |
| **不做** | 不跳 1.x — 拦截器行为 + Content-Type 默认值有破坏性变更 |
| **回归** | 登录、CRUD 增删改查、文件上传下载、Dashboard 数据获取 |

### 1.2 auth.js Cookie 安全标志修复

| 项 | 详情 |
|---|------|
| **文件** | `src/utils/auth.js:14-17` |
| **问题** | 安全逻辑**完全反了** — 生产环境无 secure 标志，开发环境反而设了 `secure: true, sameSite: 'None'` |
| **当前代码** | |

```javascript
// 当前（错误）：
if (process.env.NODE_ENV === 'production') {
  result = Cookies.set(TokenKey, token)               // 生产：无保护 ❌
} else {
  result = Cookies.set(TokenKey, token, { secure: true, sameSite: 'None' }) // 开发：反而严格
}
```

```javascript
// 修复后：
if (process.env.NODE_ENV === 'production') {
  result = Cookies.set(TokenKey, token, { secure: true, sameSite: 'Strict' })  // 生产：HTTPS + 严格
} else {
  result = Cookies.set(TokenKey, token)                                         // 开发：无限制
}
```

| **额外** | 删除 line 12 的 `console.log(process.env.NODE_ENV)` |

### 1.3 permission.js 路径遍历修复

| 项 | 详情 |
|---|------|
| **文件** | `src/permission.js:56` |
| **问题** | `to.path.indexOf("/bcp-api") > -1` — 任何路径**包含** `/bcp-api` 就跳过鉴权 |
| **攻击** | `/admin/bcp-api-data` 或 `/fake/bcp-api/steal` 都会绕过认证 |
| **修复** | `to.path.startsWith('/bcp-api/')` 精确匹配前缀 |

### 1.4 request.js 健壮性修复（4 处）

| 项 | 文件位置 | 问题 | 修复 |
|---|---------|------|------|
| a | `request.js:49` | 403 处理 `store.dispatch` 未 await，存在竞态 | 添加 `await` |
| b | `request.js:94-97` | Network Error 返回 `undefined`（不是 rejected Promise） | `return Promise.reject(error)` |
| c | `request.js:100-102` | HTTP 403 同样返回 `undefined` | `return Promise.reject(error)` |
| d | `request.js:29,99` | 残留 `console.log` | 删除 |

### 1.5 ECharts / Monaco 内存泄漏修复

| 项 | 详情 |
|---|------|
| **文件** | `src/views/dashboard/index.vue` |
| **问题** | 3 个 gauge（CPU/Memory/Disk）+ 1 个 bar chart 在 `mounted()` 初始化，**无 `beforeDestroy` 清理** |
| **修复** | 添加 `beforeDestroy()` 钩子，调用所有实例的 `.dispose()` |

```javascript
beforeDestroy() {
  if (this.cpuChart) this.cpuChart.dispose()
  if (this.memoryChart) this.memoryChart.dispose()
  if (this.diskChart) this.diskChart.dispose()
  // flowChart 也需要从局部变量改为实例属性后 dispose
}
```

| **额外** | `src/views/integrationConfig/moudel/monaco.vue` 的 Monaco Editor 实例也需 dispose |

### 1.6 构建缓存优化

| 项 | 详情 |
|---|------|
| **文件** | `vue.config.js:61-63` |
| **问题** | `new Date().getTime()` 做文件名，**每次构建破坏所有浏览器缓存** |
| **修复** | `filename: 'static/js/[name].[contenthash:8].js'` |

### 1.7 CI 质量门禁生效

| 项 | 详情 |
|---|------|
| **文件** | `.github/workflows/ci.yml:31` |
| **问题** | `continue-on-error: true` 导致测试失败不阻断构建 |
| **修复** | 删除该行；先确保现有 7 个测试通过 |
| **额外** | 两个 job 重复 `npm install`，应启用 `actions/setup-node` 的 `cache: 'npm'` |

### Phase 1 验证

```bash
npm install axios@0.21.4
npm run lint && npm run test:unit && npm run build:prod
# 手动回归：登录/登出、CRUD、Dashboard 图表、文件上传
```

---

## 三、Phase 2 — API 层重构（第 2-3 周，3-4 人天）

> 目标：消除 60%+ 代码重复，建立 API 层标准规范

### 2.1 现状分析

**30 个 API 文件，1740 行代码，重复率 60%+：**

| 重复模式 | 出现次数 | 行数/次 | 总浪费行数 |
|---------|---------|---------|-----------|
| `getPage()` — GET 分页 | 15+ | 6 | ~90 |
| `submitForm()` — POST/PUT + menuArr 转换 | 12+ | 18 | ~216 |
| `batchDelete()` — DELETE + qs.stringify | 12+ | 8 | ~96 |
| `singleDelete()` — DELETE by id | 8+ | 6 | ~48 |
| **合计重复** | | | **~450 行** |

**典型复制粘贴证据：**
- `datasource.js:5` — URL 变量名 `role`（从 role.js 复制忘改）：`const URL = { role: '/services/fwcore/datasource' }`
- `datasource.js:15` — 注释写 "角色列表"（实际是数据源）
- `menuArr→menuIds` 转换 — 在 role.js / datasource.js / warnMethod.js / customerTenant.js 等 8 个文件完全相同
- 同功能双文件：`Administrative.js`(117行) vs `addministrative.js`(61行)，`IntegratedConfig.js`(136行) vs `IntegratedConfigura.js`(73行)

### 2.2 创建 CRUD API 工厂函数

**新建文件：** `src/api/_crud.js`

```javascript
import request from '@/utils/request'
import qs from 'qs'

/**
 * 创建标准 CRUD API
 * @param {string} baseUrl - 资源路径，如 '/services/fwcore/roles'
 * @param {Object} [options] - 扩展选项
 * @param {boolean} [options.withMenuIds] - 是否需要 menuArr→menuIds 转换
 */
export function createCrudApi(baseUrl, options = {}) {
  function processMenuIds(params) {
    if (options.withMenuIds && params.menuArr) {
      params.menuIds = params.menuArr.join(',')
      delete params.menuArr
    }
  }

  return {
    getPage(params) {
      return request({ url: baseUrl, method: 'get', params })
    },

    getById(id) {
      return request({ url: `${baseUrl}/${id}`, method: 'get' })
    },

    submitForm(params) {
      processMenuIds(params)
      return request({
        url: params.id ? `${baseUrl}/${params.id}` : baseUrl,
        method: params.id ? 'put' : 'post',
        data: params
      })
    },

    batchDelete(params) {
      return request({
        url: `${baseUrl}?${qs.stringify(params, { indices: false })}`,
        method: 'delete'
      })
    },

    singleDelete(id) {
      return request({ url: `${baseUrl}/${id}`, method: 'delete' })
    }
  }
}
```

### 2.3 逐步迁移 API 文件

**迁移后的 role.js（从 57 行 → 14 行）：**

```javascript
import { createCrudApi } from './_crud'
import request from '@/utils/request'

const baseUrl = '/services/fwcore/roles'
const crud = createCrudApi(baseUrl, { withMenuIds: true })

export const { getPage, submitForm, batchDelete, singleDelete } = crud

export function getRolesByUserId(userId) {
  return request({ url: `${baseUrl}/user/${userId}`, method: 'get' })
}
```

**迁移优先级（按风险从低到高）：**

| 批次 | 文件 | 原行数 | 预估行数 | 自定义端点 |
|------|------|--------|---------|-----------|
| 第1批 | role.js | 57 | 14 | getRolesByUserId |
| | customerTenant.js | 58 | 14 | getTenantList |
| | order.js | 81 | 10 | 无 |
| 第2批 | dictionary.js | 74 | 20 | PropList 子 CRUD |
| | datasource.js | 82 | 14 | getId |
| | warnMethod.js | 82 | 14 | getId, getName |
| 第3批 | Administrative.js | 117 | 20 | 多个自定义端点 |
| | IntegratedConfig.js | 136 | 25 | 多个自定义端点 |
| | warnConfig.js | 66 | 20 | getBaseConfig, sendConf |

### 2.4 清理废弃文件

| 操作 | 文件 | 原因 |
|------|------|------|
| **删除** | `src/api/addministrative.js` | 保留 `Administrative.js`，更新 import |
| **删除** | `src/api/IntegratedConfigura.js` | 保留 `IntegratedConfig.js`，更新 import |
| **修复** | `src/api/task.js:38` | 双斜杠 URL `'/services/fwcore//allocationTask'` |
| **清理** | 全部 API 文件 | 删除 13+ 处 `console.log`（泄露 params） |
| **修复** | 全部 API 文件 | 修正复制遗留的错误注释 |

### 2.5 API 层命名规范

迁移时统一：
- URL 常量名改为 `BASE_URL`（不再用 `role` 做变量名）
- 注释与实际功能对应
- 导出函数名遵循 CRUD 约定

### Phase 2 验证

```bash
npm run lint && npm run test:unit
# 每迁移一个 API 文件后，手动验证对应视图的 CRUD 操作
# 第1批（role/customerTenant/order）→ 验证角色/客户租户/工单页面
# 第2批/第3批依次验证
```

---

## 四、Phase 3 — 视图层重构（第 3-4 周，4-5 人天）

> 目标：消除视图层 CRUD 重复，拆分超大组件

### 3.1 现状分析 — CRUD 视图重复

**34 个视图，12418 行代码**，其中：

| 类型 | 数量 | 特征 |
|------|------|------|
| **纯 CRUD** | 3 | role(373行), customerTenant(286行), order(554行) — 完全相同的 getData/edit/remove/subForm |
| **CRUD + 小定制** | 4 | dictionary, warnConfig, task, datasource — CRUD 基础 + 1-2 个自定义方法 |
| **CRUD + 大定制** | 3 | warnMethod, orgClass, user — 条件表单 / 双弹窗 / 树+表 |
| **树形结构** | 2 | organization, menu — 非表格 CRUD |
| **只读/特殊** | 2 | taskStatistics, dashboard — 无 CRUD |
| **核心业务** | 1 | integrationConfig — 1651 行巨型组件 |
| **其他** | 19 | 登录/SSO/密码/前台/模板等 |

**4 个完全相同的代码块（每个出现在 6+ 视图中）：**

```
remove()     — 删除确认+批量删除    ~30行 × 6+ 视图 = ~180行重复
edit()       — 打开编辑弹窗        ~25行 × 6+ 视图 = ~150行重复
subForm()    — 表单验证+提交        ~15行 × 6+ 视图 = ~90行重复
getData()    — 分页数据加载         ~18行 × 6+ 视图 = ~108行重复
合计：~528 行完全重复代码
```

### 3.2 提取 CRUD Mixin

**新建文件：** `src/mixins/crud.js`

```javascript
/**
 * CRUD 通用 Mixin
 * 提取 getData / edit / remove / subForm 四个标准方法
 * 使用：mixins: [crudMixin(api)]，其中 api 须包含 getPage/submitForm/batchDelete
 */
export default function crudMixin(api) {
  return {
    methods: {
      getData(datas = this.datas) {
        this.$set(this, 'datas', datas)
        this.$set(this.datas.table, 'loading', true)
        api.getPage(datas.params).then(res => {
          this.$set(this.datas.resData, 'rows', res.model)
          this.$set(this.datas.params, 'currentPage', res.currentPage)
          this.$set(this.datas.params, 'pageSize', res.pageSize)
          this.$set(this.datas.resData, 'totalCount', res.totalCount)
          this.$set(this.datas.table, 'loading', false)
        })
      },

      remove(row) {
        const items = []
        if (!row) {
          if (!this.datas.multipleSelection.length) {
            this.$message.info('请选择相关数据')
            return
          }
          this.datas.multipleSelection.forEach(v => items.push(v.id))
        } else {
          items.push(row.id)
        }
        this.$confirm('是否删除?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          api.batchDelete({ items }).then(() => {
            this.$message.success('删除成功')
            this.getData()
            this.dialogFormVisible = false
          })
        }).catch(() => {})
      },

      subForm(formName) {
        this.$refs[formName].validate(valid => {
          if (valid) {
            api.submitForm(this[formName]).then(() => {
              this.$message.success('保存成功')
              this.getData()
              this.dialogFormVisible = false
            })
          }
        })
      }
    }
  }
}
```

**迁移后的 role/index.vue（从 373 行 → ~200 行）：**
- 删除 `getData()` `remove()` `subForm()` 方法体（~88行）
- 添加 `mixins: [crudMixin(api)]`
- 保留 `edit()` 方法（因各视图字段不同，暂不提取）
- 保留 `datas` 配置和模板

### 3.3 integrationConfig 拆分（1651 行 → 5 个文件）

| 子组件 | 提取自（原行号范围） | 预估行数 | 职责 |
|--------|---------------------|---------|------|
| `ParameterTable.vue` | lines 60-102 | ~80 | 集成参数配置表格 |
| `JobListTable.vue` | lines 135-277 | ~200 | 任务列表（input/transform/output 节点操作） |
| `NodeEditorDialog.vue` | lines 305-400 | ~150 | Monaco 编辑器弹窗（3 个 dialog 合一） |
| `BatchSettingsDialog.vue` | lines 449-486 | ~80 | 批量设置弹窗 |
| `index.vue` | 剩余逻辑 | ~600 | 主容器：API 调用 + 状态分发 + 子组件协调 |

**数据流设计：**
- `index.vue` 持有所有状态（单一数据源）
- 子组件通过 `props` 接收只读数据
- 子组件通过 `$emit` 事件通知状态变更
- `index.vue` 负责 API 调用和状态更新

### 3.4 合并 PropList / Freelist 组件

| 项 | 详情 |
|---|------|
| **文件** | `src/components/PropList/index.vue`(45行) + `src/components/Freelist/index.vue`(40行) |
| **问题** | 两个组件**几乎完全相同**，只是调用 API 不同（`getProplist` vs `getFreelist`） |
| **方案** | 合并为 `SelectLoader.vue`，通过 prop `apiMethod` 区分 |

### 3.5 ModFilter props 变异修复

| 项 | 详情 |
|---|------|
| **文件** | `src/components/ModFilter/index.vue:257` |
| **问题** | 组件直接修改 `this.datas.params.pageSize` 等属性，违反 Vue 单向数据流 |
| **影响** | 35+ 视图依赖此组件，不能一次性改 |
| **方案** | 分两步：(1) 先用 `.sync` 修饰符过渡 (2) 后续逐步改为 `$emit` 事件通知 |

### Phase 3 验证

```bash
npm run lint && npm run test:unit
# 手动回归全部 CRUD 视图的增删改查分页操作
# 重点验证 integrationConfig 的完整流程（最复杂视图）
```

---

## 五、Phase 4 — Store / 路由 / 权限加固（第 4 周，2-3 人天）

> 目标：修复认证流程中的隐患，加固核心状态管理

### 4.1 user.js State 声明补全

| 项 | 详情 |
|---|------|
| **文件** | `src/store/modules/user.js:5-10` |
| **问题** | State 缺少 `orgName` 属性声明，但 `SET_ORGNAME` mutation（line 23）在写入它 |
| **影响** | Vue 2 无法检测新增属性的变化（非响应式） |
| **修复** | State 初始化添加 `orgName: ''` |

### 4.2 permission.js 防御性加固

| 项 | 文件位置 | 修复 |
|---|---------|------|
| a | `permission.js:54` | 添加 menus 空值检查：`if (!menus || !menus.length) { resolve([]); return }` |
| b | `permission.js:63,82` | 验证 `url` 格式（不含 `..` 或绝对路径），防止路径遍历 |
| c | `permission.js:63` | 为 `require()` 添加错误回退组件，避免白屏 |

```javascript
// 修复 c：错误回退
component: (resolve) => {
  try {
    require([`@/views/${url}`], resolve)
  } catch (e) {
    resolve(require('@/views/404'))
  }
}
```

### 4.3 request.js 错误码处理完善

**当前问题：** 只处理 403 和 550，所有其他错误码（包括 551+）**静默返回为成功**。

```javascript
// 当前逻辑（request.js:48-63）：
if (res.code === 403) { ... reject }
if (res.code === 550) { ... reject }
else { return response.data }  // 552、500、501... 全部当成功返回！
```

**修复方案：** 添加 552 处理 + 通用错误码兜底

```javascript
if (res.code === 403) { /* 现有逻辑 */ }
else if (res.code === 550) { /* 现有逻辑 */ }
else if (res.code === 552) {
  // 强制修改密码 — 返回数据让 login 组件处理
  return response.data
}
else if (res.code && res.code >= 500) {
  Message({ message: res.message || res.msg || '服务器错误', type: 'error', duration: 5000 })
  return Promise.reject(new Error(res.message || '服务器错误'))
}
else {
  return response.data
}
```

### 4.4 SSO 登录流程修复

| 项 | 详情 |
|---|------|
| **文件** | `src/views/authLogin/index.vue` |
| **问题** | SSO 流程只调用 `user/token` 设置 token，**从不调用 `user/getInfo`** |
| **影响** | 导航栏显示空用户名，权限路由未生成（首次访问依赖 permission.js guard 补救） |
| **修复** | SSO 成功后调用 `await store.dispatch('user/getInfo')` 再跳转 |

### 4.5 date.js 原型污染修复

| 项 | 详情 |
|---|------|
| **文件** | `src/utils/date.js` |
| **问题** | `Date.prototype.format = function(fmt) { ... }` — 修改全局原型，可能与其他库冲突 |
| **修复** | 改为导出函数 `export function formatDate(date, fmt) { ... }` |
| **影响** | 搜索所有 `.format(` 调用点，更新为 `formatDate(date, fmt)` |

---

## 六、Phase 5 — 工程基建优化（持续，不单独排期）

> 目标：随日常维护逐步提升工程质量

### 5.1 依赖清理

| 操作 | 包名 | 原因 |
|------|------|------|
| deps → devDeps | `eslint-plugin-html` | 仅 lint 时使用，不应进入生产 bundle |
| 评估删除 | `console`(^0.7.2) | 浏览器原生支持，此 polyfill 包无必要 |
| 升级 | `@vue/test-utils` 1.0.0-beta.29 → 1.3.6 | beta 版本不稳定 |

### 5.2 全局 console.log 清理

- **范围：** 33 个文件、62+ 处 `console.log`
- **策略：** 每次修改某文件时顺带清除（P0-5 已将 ESLint no-console 设为 warn，`npm run lint` 会标记所有位置）
- **优先清理：** API 层的 console.log（泄露请求参数，Phase 2 一并处理）

### 5.3 Dockerfile 多阶段构建

**当前问题：** 需先在本地 `npm run build:prod`，再 `docker build`。CI 和本地构建不一致。

```dockerfile
# 改进后：
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build:prod

FROM nginx:1.25-alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://localhost/ || exit 1
CMD ["nginx", "-g", "daemon off;"]
```

### 5.4 nginx.conf CORS 收紧

| 项 | 详情 |
|---|------|
| **文件** | `nginx.conf:27` |
| **问题** | `add_header 'Access-Control-Allow-Origin' $http_origin` — 允许任意来源 |
| **修复** | 白名单校验，仅允许已知域名 |

### 5.5 CI 优化

| 项 | 文件 | 操作 |
|---|------|------|
| Node 版本 | `ci.yml:21,45` | 14 → 20（14 已 EOL） |
| 依赖缓存 | `ci.yml:23-24,47-48` | 添加 `cache: 'npm'`，避免两个 job 重复安装 |
| 使用 npm ci | `ci.yml:24,48` | `npm install` → `npm ci`（锁版本，更快） |

### 5.6 测试覆盖率提升

**现状：** 7 个测试文件、218 行测试代码、6/118 源文件有测试 = 5% 覆盖率

**jest.config.js:16 主动排除了关键模块：**
```javascript
collectCoverageFrom: ['src/utils/**/*.{js,vue}', '!src/utils/auth.js', '!src/utils/request.js', ...]
//                                                  ^^^^^^^^^^^^^^^^^^^^  ^^^^^^^^^^^^^^^^^^^^
//                                                  排除了认证模块！      排除了请求模块！
```

**策略：** 不大规模补测试（维护模式），但每个 Phase 改动的文件须补充测试：
- Phase 1：为 `auth.js` 和 `request.js` 拦截器补充测试
- Phase 2：为 `_crud.js` 工厂函数补充测试
- Phase 3：为 `crud.js` mixin 补充测试

---

## 七、明确不做的事项

| 提议 | 排除原因 |
|------|----------|
| **Vue 3 迁移** | Element UI 不兼容 Vue 3，需换 Element Plus，1-2 人无法承担。新投入给 N8N |
| **引入 TypeScript** | Vue 2 + TS 集成体验差，维护模式不值得 |
| **改密码哈希算法** | MD5 是后端 FwPasswordFilter 要求，单改前端会登录失败 |
| **容器化生产部署** | Host Nginx + 静态文件简单稳定，Docker 19.03 太旧 |
| **大规模补单元测试** | 维护模式不会有大量新功能，只针对改动文件补测试 |
| **Token 刷新机制** | 后端 Session TTL 86400s（24h），改造需前后端联动 |
| **CSRF 防护** | 后端基于 Session + b-token header，非 Cookie 认证，CSRF 风险较低 |
| **国际化 i18n** | 仅中国客户使用，无国际化需求 |

---

## 八、执行时间线

```
第 1 周  ─── Phase 1 (安全修复) ────────────────── 2-3 人天
                ├─ 1.1 axios 升级
                ├─ 1.2 auth.js Cookie 修复
                ├─ 1.3 permission.js 路径遍历
                ├─ 1.4 request.js 4 处修复
                ├─ 1.5 ECharts/Monaco dispose
                ├─ 1.6 contenthash
                └─ 1.7 CI 门禁

第 2-3 周 ─── Phase 2 (API 重构) ────────────────── 3-4 人天
                ├─ 2.2 创建 _crud.js 工厂
                ├─ 2.3 分 3 批迁移 API 文件
                ├─ 2.4 删除废弃文件
                └─ 2.5 清理 console.log

第 3-4 周 ─── Phase 3 (视图重构) ────────────────── 4-5 人天
                ├─ 3.2 提取 CRUD mixin
                ├─ 3.3 integrationConfig 拆分
                ├─ 3.4 合并 PropList/Freelist
                └─ 3.5 ModFilter 修复（第一步）

第 4 周   ─── Phase 4 (Store/路由加固) ──────────── 2-3 人天
                ├─ 4.1 user.js state 补全
                ├─ 4.2 permission.js 防御
                ├─ 4.3 错误码处理完善
                ├─ 4.4 SSO 流程修复
                └─ 4.5 date.js 原型修复

持续      ─── Phase 5 (工程基建) ────────────────── 随日常维护
                ├─ 依赖清理
                ├─ console.log 逐步清理
                ├─ Dockerfile 多阶段构建
                ├─ nginx CORS 收紧
                └─ CI 优化 + 测试覆盖提升
```

---

## 九、预期收益

| 指标 | 当前 | Phase 1 后 | Phase 2 后 | Phase 3 后 | 全部完成 |
|------|------|-----------|-----------|-----------|---------|
| 已知 CVE | 2 | 0 | 0 | 0 | 0 |
| API 层代码行 | 1740 | 1740 | ~900 | ~900 | ~900 |
| API 层重复率 | 60%+ | 60%+ | <10% | <10% | <10% |
| 视图层重复代码 | ~528行 | ~528行 | ~528行 | ~100行 | ~100行 |
| integrationConfig | 1651行 | 1651行 | 1651行 | ~600行 | ~600行 |
| 内存泄漏 | 4处 | 0 | 0 | 0 | 0 |
| CI 门禁 | 无效 | 生效 | 生效 | 生效 | 生效 |
| 测试覆盖 | 5% | 8% | 12% | 15% | 15%+ |

**总体：4 周内将技术债从"高风险"降至"可控"，维护成本降低约 40%。**

---

## 十、风险管控

| 风险 | 影响 | 缓解措施 |
|------|------|----------|
| axios 升级导致请求行为变化 | 生产 CRUD 故障 | 0.21.4 是 0.x 兼容版本；升级后全量回归 |
| API 工厂迁移遗漏 import | 页面功能缺失 | 分 3 批迁移，每批独立验证 |
| integrationConfig 拆分引入 bug | 核心业务受影响 | 拆分后对比旧版功能逐项验证 |
| CRUD mixin 与特定视图冲突 | 个别视图异常 | 先从最简单的 3 个纯 CRUD 视图开始 |
| ModFilter 改动影响 35+ 视图 | 全局影响 | Phase 3 只做第一步（.sync），不做破坏性改动 |
