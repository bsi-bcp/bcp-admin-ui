# BCP Admin UI 下一阶段重构方案 + 风险评估

> 日期：2026-04-02 | 状态：已评审待执行 | 前置：P0/P1 修复已完成

## Context

BCP Admin UI 是 BCP 1.0 的企业管理后台前端（Vue 2.6 + Element UI），当前处于维护模式（1-2人团队，11+ 生产客户）。P0/P1 安全修复已完成，下一阶段目标是降低代码重复率，提升可维护性。

核心问题：
- **API 层**：30 个文件 1740 行，60%+ 代码重复（相同 CRUD 模板复制粘贴）
- **View 层**：8-10 个视图重复相同的 CRUD 方法，约 528 行重复
- **integrationConfig**：1651 行单文件组件，10+ 嵌套对话框，极难维护

---

## Phase 2：API 层 CRUD 工厂重构（3-4 人天）

### 目标

API 代码重复率 60%+ → <10%，1740 行 → ~900 行

### 2.1 创建 CRUD 工厂函数

**新建文件：`src/api/_crud.js`**

```javascript
import request from '@/utils/request'
import qs from 'qs'

export default function createCrudApi(resourceUrl, options = {}) {
  return {
    getPage(params) {
      return request({ url: resourceUrl, method: 'get', params })
    },
    getById(id) {
      return request({ url: `${resourceUrl}/${id}`, method: 'get' })
    },
    submitForm(params) {
      if (params.menuArr) {
        params.menuIds = params.menuArr.join(',')
        delete params.menuArr
      }
      return request({
        url: params.id ? `${resourceUrl}/${params.id}` : resourceUrl,
        method: params.id ? 'PUT' : 'POST',
        data: params
      })
    },
    batchDelete(params) {
      const deleteUrl = options.batchDeleteUrl || resourceUrl
      const queryParams = qs.stringify(params, { indices: false })
      return request({ url: `${deleteUrl}?${queryParams}`, method: 'DELETE' })
    },
    singleDelete(id) {
      return request({ url: `${resourceUrl}/${id}`, method: 'DELETE' })
    }
  }
}
```

### 2.2 迁移计划（3 批次）

**第 1 批 — 纯 CRUD 文件（5 个，风险最低）：**

| 文件 | URL | 行数 |
|------|-----|------|
| role.js | /services/fwcore/roles | 56 |
| license.js | /services/fwcore/license | 58 |
| freelist.js | /services/fwcore/freelist | 35 |
| IntegratedConfigura.js | /services/fwcore/IntegratedConfigura | 73 |
| customerTenant.js | /services/fwcore/customerTenant | 57 |

迁移后示例（role.js）：

```javascript
import createCrudApi from './_crud'
const api = createCrudApi('/services/fwcore/roles')
export const { getPage, submitForm, batchDelete, singleDelete } = api
```

**第 2 批 — CRUD + 少量自定义（7 个）：**

| 文件 | 自定义方法 |
|------|-----------|
| datasource.js | getId, getRolesByUserId, getName |
| dictionary.js | propList 子操作 |
| order.js | getId, getRolesByUserId, getName |
| warnMethod.js | getRolesByUserId, getName |
| warnConfig.js | 修复空函数 stub |
| orgClass.js | submitConfigForm, getTemplate, saveTemplate |
| frontComputer.js | getTenants |

模式：工厂导出 + 追加自定义方法

```javascript
import createCrudApi from './_crud'
const api = createCrudApi('/services/fwcore/datasource')
export const { getPage, submitForm, batchDelete, singleDelete } = api
// 自定义方法
export function getId(id) { ... }
export function getName(params) { ... }
```

**第 3 批 — 复杂文件（4 个）：**

| 文件 | 行数 | 复杂度 | 说明 |
|------|------|--------|------|
| user.js | 140 | 高 | login/logout/特殊操作（锁定/解锁/重置密码/同步）|
| IntegratedConfig.js | 136 | 高 | CRUD + 导入导出 + 任务运行 + 日志 |
| Administrative.js | 117 | 中 | CRUD + 模板管理 + 文件上传 |
| task.js | 85 | 中 | CRUD + 分配表单 + 多个下拉选项 |

### 2.3 清理工作

- `addministrative.js` 不直接删除，改为 deprecated 重导出（防止遗漏引用）
- 统一 URL 路径前导 `/`（`addministrative.js` 缺少前导 `/`）
- 移除 API 文件中所有 console.log
- 修复 warnConfig.js 两个空函数 stub（标注 intentionally empty）
- 删除 `common.js` 中的 `splitArr()`，统一用 `qs.stringify`
- 清理无用 async 声明（license.js, order.js, warnMethod.js）

### 2.4 不迁移的文件（10 个，保持原样）

| 文件 | 原因 |
|------|------|
| dashboard.js | 纯查询，无 CRUD 模式 |
| select.js | 仅 2 个查询方法 |
| ssoLogin.js | 仅 1 个方法 |
| table.js | 仅 1 个方法 |
| taskRunInfo.js | 仅 getPage |
| taskStatistics.js | 仅 1 个方法 |
| userlog.js | 仅 getPage |
| password.js | 特殊表单，非 CRUD |
| menu.js | 树形结构，非表格 CRUD |
| organization.js | 树形结构，非表格 CRUD |

---

## Phase 3：View 层 Mixin 提取 + integrationConfig 拆分（4-5 人天）

### 3.1 CRUD Mixin（降级方案：仅提取 getData）

**新建 `src/mixins/crud.js`**，仅提取分页查询逻辑。`remove`/`edit`/`subForm` 因变体过多，保留在各视图中。

适用 8 个视图：role, customerTenant, order, warnMethod, warnConfig, orgClass, frontComputer, frontComputerTask

### 3.2 integrationConfig 组件拆分（推迟到 Phase 2 稳定后评估）

```
src/views/integrationConfig/
├── index.vue              ← 主容器（~600 行）：ModFilter + 主表单 + 状态协调
├── components/
│   ├── JobListTable.vue   ← 任务列表表格（~200 行）：行操作、排序、复制
│   ├── NodeEditor.vue     ← 节点配置对话框（~300 行）：input/transform/output
│   ├── BatchSettings.vue  ← 批量设置对话框（~100 行）
│   ├── TaskRerun.vue      ← 补数/重跑对话框（~100 行）
│   └── LogSearch.vue      ← 日志查询对话框（~150 行）：日期范围 + 分页
```

通信模式：Props 下传 + $emit 上报，父组件持有所有 API 调用和状态

### 3.3 PropList + Freelist 合并（低风险，可随时执行）

合并为 `src/components/SelectLoader/index.vue`，通过 `apiMethod` prop 区分数据源。

---

# 风险评估报告

## 风险总览

| # | 风险项 | 等级 | 核心改进措施 |
|---|--------|------|-------------|
| 1 | 回归风险 | **高** | 新增 Phase 0 补充 contract test |
| 2 | API 兼容性 | **高** | batchDelete 不强行统一，工厂支持 options 覆盖 |
| 3 | Mixin 陷阱 | 中 | 降级为仅提取 getData |
| 4 | integrationConfig 拆分 | **高** | 推迟到 Phase 2 稳定后评估 |
| 5 | 渐进式发布 | 中 | 批次间隔 2 周，独立 PR |
| 6 | 团队能力 | 中偏高 | 每周重构 ≤40%，设时间盒 |
| 7 | 生产影响 | **高** | 灰度发布，后端确认参数格式 |

## 1. 回归风险 — 等级：高

**场景**：测试覆盖率仅 5%（6/118 文件），且全部是基础工具类测试。重构的 16 个 API 文件和 8 个视图文件零测试覆盖。

关键风险点：
- submitForm 的 menuArr→menuIds 转换在 10+ 文件中存在微妙差异（forEach 循环 vs `.join(',')`），工厂函数必须精确等价
- warnConfig.js 的 batchDelete/getId 是空函数，工厂若生成实际实现会改变运行时行为
- customerTenant.js 的 batchDelete 使用不同 URL 路径 (`/kitTenants/batch`)

**改进措施**：
1. **Phase 0（前置）**：为 16 个 API 文件补充 contract test（mock axios，验证请求 URL/method/params），预计 2-3 天
2. submitForm 的 menuArr 处理编写参数化测试：空数组、单元素、多元素、undefined 四种
3. 建立"重构前后 API 对照表"作为手工回归检查单

## 2. API 兼容性风险 — 等级：高

**场景**：batchDelete 存在 4 种不同实现模式：

| 模式 | 文件数 | URL 格式 |
|------|--------|----------|
| qs.stringify | 11 | `?items=1&items=2&items=3` |
| common.splitArr | 4 | `?items=1,2,3` |
| 空函数 | 1 | 无请求 |
| 自定义 URL | 2 | 不同的 endpoint |

**关键风险**：`splitArr` 和 `qs.stringify` 生成不同 URL 格式，后端可能依赖特定格式。强行统一会导致特定客户的批量删除失效。

**改进措施**：
1. 工厂函数支持 `options.batchDeleteUrl` 和 `options.batchDeleteMode` 覆盖
2. **统一前必须与后端确认**每个 endpoint 支持的参数格式
3. 对使用 splitArr 的 4 个文件（task/frontComputer/computerTask/orgClass），暂不迁移或保留原实现

## 3. Mixin 陷阱 — 等级：中

**场景**：项目无 mixin 使用经验。计划提取的方法（getData/remove/edit/subForm）在各视图中实现差异大。

风险点：
- `remove()` 至少 3 种变体（批量+单个、仅单个、确认弹窗文案不同）
- mixin 中的 `api` 是视图 import 的局部变量，mixin 无法直接访问
- data 合并时 `datas.filterList` 完全不同，无法提取

**改进措施**：
1. **降级方案**：mixin 仅提取 `getData` 分页查询逻辑，不提取 remove/edit/subForm
2. 使用函数工厂 `crudMixin(api)` 而非直接 mixin，显式传入 api 依赖
3. 方法使用 `$crud_` 前缀避免命名冲突

## 4. integrationConfig 拆分风险 — 等级：高

**场景**：60+ 状态变量、30+ 方法、12 个 dialog flag 存在深度交叉引用。

关键风险：
- jobList 是核心共享状态，拆分后 props/emit 事件链极长
- Monaco 编辑器 `$refs` 跨组件访问问题
- 弹窗联动（模板选择 → 主编辑 → 节点配置）状态同步复杂

**改进措施**：
1. **分两步**：先提取纯函数和常量，不动状态结构；稳定后再拆组件
2. jobList 留主组件，子组件通过 props 传入 + $emit 返回
3. 设置回退标准：拆分导致 >3 个非预期行为差异时立即回退
4. **建议推迟**到 Phase 2 完全稳定后再评估

## 5. 渐进式发布风险 — 等级：中

**场景**：分 3 批迁移期间（2-4 周），新旧 API 模式共存。

**改进措施**：
1. 每批迁移作为独立 PR，附带回退指令
2. 第 1 批选使用频率最低的文件（IntegratedConfigura.js），而非仅按复杂度分类
3. 批次间隔至少一个发布周期（2 周）

## 6. 团队能力风险 — 等级：中偏高

**场景**：1-2 人团队同时维护 11+ 客户生产系统 + 执行重构，总工作量 15-25 工作日。

**改进措施**：
1. 每周重构时间不超过 40%，60% 保留日常维护
2. 每个 Phase 设时间盒：Phase 2 超过 3 周未完成则暂停评估
3. 编写详细设计文档确保单人可独立继续或回退

## 7. 生产影响风险 — 等级：高

**场景**：11+ 客户使用不同功能路径，回滚需逐个协调。

**改进措施**：
1. 灰度发布：选 1 个低风险客户先升级，观察 2 周后推广
2. batchDelete 统一前必须与后端逐个确认参数格式兼容性
3. `addministrative.js` 不删除，改为 deprecated 重导出：`export * from './Administrative.js'`
4. 为集成配置的核心流程编写手工回归测试用例文档

---

## 总体建议

### 推荐执行优先级（调整后）

```
Phase 0（新增，最高优先级，2-3 天）
  └── 为 16 个待重构 API 文件补充 contract test

Phase 2-A（验证期，1 周）
  └── 迁移 3 个最简单纯 CRUD 文件 → 生产验证

Phase 2-B（主力迁移，2 周）
  └── 迁移 CRUD + 自定义文件 → 生产验证

Phase 2-C（复杂文件，1 周）
  └── user.js / Administrative.js / IntegratedConfig.js / task.js

Phase 3-A（低风险，随时可做）
  └── PropList + Freelist 合并

Phase 3-B（评估后决定）
  └── CRUD mixin 提取（仅 getData）

Phase 3-C（评估后决定，建议推迟）
  └── integrationConfig 拆分
```

### 关键安全措施

1. **不跳过 Phase 0**：没有测试的重构是赌博
2. **每批迁移间隔 2 周发布周期**
3. **回退方案预先文档化**
4. **batchDelete 不强行统一**：qs.stringify 和 splitArr 保持各自实现
5. **addministrative.js 改为 deprecated 重导出而非删除**

### 关键文件清单

**新建：**
- `src/api/_crud.js` — CRUD 工厂
- `src/mixins/crud.js` — getData mixin（Phase 3-B）
- `src/views/integrationConfig/components/*.vue`（Phase 3-C）

**修改：**16 个 API 文件 + 8 个视图文件

### 验证方案

1. `npm run lint` + `npm run test:unit` — 每次修改后
2. `npm run build:prod` — 每批迁移后
3. 手工 CRUD 操作验证（列表/新增/编辑/删除）— 每个迁移文件
4. 灰度客户 2 周观察期 — 每个 Phase 完成后
5. 集成配置完整流程回归 — Phase 3-C 后
