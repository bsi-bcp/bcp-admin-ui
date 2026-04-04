# BCP IDE 集成配置页面（integrationConfig）全量分析报告

> 日期: 2026-04-04 | 分析范围: index.vue (1815行) + monaco.vue (355行) + multipleTable.vue (113行) + IntegratedConfig.js (100行)

---

## 1. 架构概览

### 1.1 文件结构

```
src/views/integrationConfig/
  index.vue                    # 主视图（模板587行 + 脚本1153行 + 样式75行）
  moudel/
    monaco.vue                 # Monaco 编辑器封装组件（355行）
    multipleTable.vue          # 模板选择单选表组件（113行）
```

### 1.2 依赖关系图

```
                          index.vue
                      ┌───────┼───────────────────────┐
                      v       v                       v
               monaco.vue  multipleTable.vue    Cron 组件
                  |              |            (@/components/cron/cron)
           monaco-editor    addministrative.js
                             (模板 API)
                      ┌───────┼───────┐
                      v       v       v
 IntegratedConfig.js  select.js  menu.js        (API 层)
                      └───────┼───────┘
                              v
                    @/utils/request.js  ──>  Axios + b-token
                              |
                    @/api/_crud.js      ──>  CRUD 工厂（getPage/submitForm/batchDelete/singleDelete）
```

### 1.3 外部依赖

| 分类 | 依赖 | 用途 |
|------|------|------|
| **API** | `IntegratedConfig.js` | 配置 CRUD + 下发 + 补数 + 日志 + 导出 + 上传 + 字段列表 |
| **API** | `select.js` | `getFreelist` — 下拉选项（租户/数据源/示例数据） |
| **API** | `menu.js` | `getSourceTypeOptions` — 字典查询（输入/转换/输出类型） |
| **工具** | `@/utils/date.js` | `formatDate` — 日期格式化 |
| **工具** | `sortablejs` | 参数表、任务列表行拖拽排序 |
| **工具** | `element-ui/Loading` | 全屏加载蒙版（补数/导入） |
| **组件** | `ModFilter` | 通用 CRUD 数据表格（搜索 + 分页 + 列配置） |
| **组件** | `Cron` | Cron 表达式可视化设置弹窗 |
| **Store** | `cur_user` (Vuex getter) | 当前用户信息（tenantId, userType） |

---

## 2. 模板结构

### 2.1 对话框清单（11个）

| # | 名称 | visible 绑定 | 宽度 | 功能 |
|---|------|-------------|------|------|
| 1 | 新增/编辑 | `dialogFormVisible` | 1120px | 主表单（配置名称 + 参数 + 插件 + 任务列表） |
| 2 | 选择模板 | `ShowMoule` | 50% | 内嵌 multipleTable 组件，单选模板 |
| 3 | 输入节点配置 | `ShowInput_Database` | 60% | 数据源 + Cron + 脚本（MonAco） |
| 4 | 转换节点配置 | `switchNode` | 60% | 纯脚本编辑（MonAcoTransformNode） |
| 5 | 输出节点配置 | `Showoutput_Transfer` | 60% | 数据源 + 脚本（outMonAco） |
| 6 | Cron 可视化 | `cronDialogVisible` | 640px | Cron 组件，append-to-body |
| 7 | 补数执行 | `rerun_falg` | 1120px | 时间范围 + 参数 + 日志表格 |
| 8 | 批量设置 | `batch_falg` | 60% | 按类型批量设置数据源 |
| 9 | 导入 | `import_flag` | 400px | 文件拖拽上传（JSON 文件） |
| 10 | JSON 新增任务 | `new_flag` | 650px | 输入 JSON 串添加任务行 |
| 11 | 日志查询 | `log_flag` | 1120px | 时间范围 + 关键词搜索 + 分页日志表 |

### 2.2 表格清单（4个）

| # | ref | 数据源 | 功能 | 特殊属性 |
|---|-----|--------|------|---------|
| 1 | `paramTable` | `tableData` | 参数键值对（拖拽排序） | `row-key="__sortId"`, Sortable |
| 2 | `jobTable` | `jobList` | 任务列表（输入/转换/输出节点 + 状态） | `row-key="__sortId"`, Sortable, `row-class-name` |
| 3 | 无 | `logList` | 补数日志（补数弹窗内） | `max-height="250"` |
| 4 | 无 | `logList` | 日志查询（日志弹窗内，含分页） | `height="650px"` |

### 2.3 Monaco 编辑器实例（3个）

| ref 名称 | 所在对话框 | 用途 |
|----------|----------|------|
| `MonAco` | 输入节点配置 | 输入脚本编辑 |
| `MonAcoTransformNode` | 转换节点配置 | 转换脚本编辑 |
| `outMonAco` | 输出节点配置 | 输出脚本编辑 |

三个实例均接收 `:fields="currentFields"` prop，用于 `obj.` 属性自动补全。

---

## 3. 数据模型

### 3.1 data() 响应式变量分组（约60个）

**对话框状态（11个 boolean）**

| 变量 | 默认值 | 控制对话框 |
|------|--------|----------|
| `dialogFormVisible` | false | 新增/编辑 |
| `ShowMoule` | false | 模板选择 |
| `ShowInput_Database` | false | 输入节点 |
| `switchNode` | false | 转换节点 |
| `Showoutput_Transfer` | false | 输出节点 |
| `cronDialogVisible` | false | Cron 设置 |
| `rerun_falg` | false | 补数 |
| `batch_falg` | false | 批量设置 |
| `import_flag` | false | 导入 |
| `new_flag` | false | JSON新增 |
| `log_flag` | false | 日志查询 |

**表单数据**

| 变量 | 结构 | 用途 |
|------|------|------|
| `subFormData` | `{id, name, nodeId, templateId, tenantId, templateName}` | 集成配置主表单 |
| `inNode` | `{cron, IncrementalField, dataSource, protocol, authFlag, scriptContent, path}` | 输入节点配置 |
| `outNode` | `{cron, IncrementalField, dataSource, scriptContent, path}` | 输出节点配置 |
| `transformNode` | `{IncrementalField, dataSource, scriptContent}` | 转换节点配置 |
| `reRun` | `{taskId, configId, runTime, runParams, responseMsg}` | 补数参数 |
| `log` | `{taskId, runTime[], message, pageSize, currentPage, totalCount, repairFlag}` | 日志查询参数 |
| `jsonTask` | `{newJson}` | JSON 新增任务 |

**列表数据**

| 变量 | 类型 | 用途 |
|------|------|------|
| `jobList` | Array | 任务列表（含嵌套 inNode/transformNode/outNode） |
| `tableData` | Array | 参数键值对表 |
| `logList` | Array | 日志记录 |
| `batchTableData` | Array | 批量设置的数据源/节点映射 |
| `fileList` | Array | 插件文件列表 |

**下拉选项**

| 变量 | 来源 API | 内容 |
|------|---------|------|
| `bcpDatasourceName` | `sel.getFreelist({code:'bcp.datasource.name'})` | 数据源 id→name 映射 |
| `bcpTenantName` | `sel.getFreelist({code:'bcp.tenant.name'})` | 租户 id→name 映射 |
| `exampleData` | `sel.getFreelist({code:'bcp.example.data'})` | 示例脚本（in/transform/out） |
| `optionsInput` | `menuApi.getSourceTypeOptions('md.bcp.input.type')` | 输入节点类型 |
| `optionsTransform` | `menuApi.getSourceTypeOptions('md.bcp.transform.type')` | 转换节点类型 |
| `optionsOutput` | `menuApi.getSourceTypeOptions('md.bcp.output.type')` | 输出节点类型 |

**其他**

| 变量 | 用途 |
|------|------|
| `sortIdCounter` | 行 ID 自增计数器（拖拽排序用） |
| `pathMap` (Map) | API 上报路径唯一性校验缓存 |
| `currentFields` | 当前数据源字段列表（传给 Monaco 补全） |
| `currentRow` | 当前编辑的任务行索引 |
| `showEditor` | 编辑器显示标记（1=输入, 2=转换, 3=输出） |
| `menuURL` | 当前路由路径（控制 IMC 模式下隐藏导出） |
| `queryLogTask` | 轮询定时器句柄 |
| `logLoading` | Loading 实例引用 |

### 3.2 验证规则

**subFormDataRule**
- `name`: 必填
- `tenantId`: 必填（仅 admin 用户可见该字段）
- `templateId`: 必填

**inNodeFormRule**
- `dataSource`: 必选（change 触发）
- `cron`: 必填（API 上报类型时隐藏此字段，动态条件必填）
- `IncrementalField`: 必填（仅数据库查询类型显示）
- `path`: 必填（API 查询/API 上报类型显示）

**outNodeFormRule**
- `dataSource`: 必选（change 触发）
- `path`: 必填（仅 API 调用类型显示）

**scriptNotNull**（自定义校验方法）
- 检查 `node.scriptContent === ''`，空则弹出错误提示

### 3.3 分页配置（datas 对象）

`datas` 对象传给 `<mod-filter>` 组件：
- `filterList`: 6 列（名称/客户/模板/修改时间/状态/操作），名称列作为搜索条件
- `resData`: 分页响应（rows, pageSize, currentPage, totalCount）
- `table`: 表格配置（loading, orderNo, selection）

---

## 4. 方法清单（60+ 方法）

### 4.1 CRUD 主流程

| 行号 | 方法 | 功能 | API 调用 |
|------|------|------|---------|
| 1725 | `getData(datas)` | 查询配置列表（分页） | `api.getPage()` |
| 1665 | `edit(row)` | 新增(row===0)或编辑配置 | `api.getIdRow()` |
| 1608 | `subForm(formData)` | 保存配置表单 | `api.submitForm()` + `api.getIdRow()` |
| 1554 | `remove(row)` | 删除配置（确认弹窗） | `api.singleDelete()` |
| 1009 | `derive(row)` | 导出配置 JSON | `api.exportExcel()` |
| 1019 | `expForIot(type, row)` | 导出 it/ot JSON | `api.expForIot()` |

### 4.2 任务管理

| 行号 | 方法 | 功能 |
|------|------|------|
| 1475 | `addJob()` | 添加空任务行 |
| 1470 | `addByJson()` | 打开 JSON 新增弹窗 |
| 1497 | `addJobJson()` | 解析 JSON 串添加任务 |
| 1341 | `deljobList(data)` | 删除任务行（确认弹窗） |
| 1353 | `copyJob(data)` | 复制任务行（追加到列表） |
| 1368 | `copyJobJson(data)` | 复制任务 JSON 到剪贴板 |
| 1363 | `enableAll(flag)` | 一键启用/禁用所有任务 |
| 1447 | `importFile(event)` | 从文件导入任务列表 |

### 4.3 节点配置

| 行号 | 方法 | 功能 |
|------|------|------|
| 1243 | `changeOptionsInput(data)` | 打开输入节点配置弹窗 |
| 1273 | `changeOptionsTransform(data)` | 打开转换节点配置弹窗 |
| 1296 | `changeOptionsOutput(data)` | 打开输出节点配置弹窗 |
| 1174 | `affirmInNode()` | 确认输入节点（校验 + path 唯一性 + 脚本非空） |
| 1216 | `affirmTransformNode()` | 确认转换节点（脚本非空） |
| 1227 | `affirmOutNode()` | 确认输出节点（表单校验 + 脚本非空） |
| 1320 | `setValue(monaco, node)` | 设置 Monaco 编辑器值 |
| 1325 | `loadDatasourceFields(datasourceId)` | 获取数据源字段列表（Monaco 补全） |

### 4.4 参数管理

| 行号 | 方法 | 功能 |
|------|------|------|
| 1393 | `addParam()` | 添加参数行 |
| 1337 | `delTableData(index)` | 删除参数行 |
| 908 | `copyParamCode(key)` | 复制 `context.getParams().get("key")` 到剪贴板 |
| 930 | `initParamSortable()` | 初始化参数表拖拽排序 |

### 4.5 下发与补数

| 行号 | 方法 | 功能 | API 调用 |
|------|------|------|---------|
| 1124 | `issue(row)` | 下发配置到 Agent | `api.issueType()` (timeout 120s) |
| 1074 | `runTask()` | 执行补数任务 | `api.runTask()` |
| 1029 | `runAgain(data)` | 打开补数弹窗 | 无 |
| 1091 | `pollTaskLog(retryCount)` | 轮询补数日志（最多5次，间隔5s） | `api.getTaskLog()` |
| 1114 | `clearLogPoll()` | 清除轮询定时器 + 关闭 Loading | 无 |

### 4.6 日志

| 行号 | 方法 | 功能 | API 调用 |
|------|------|------|---------|
| 1038 | `logSearch(data)` | 日志查询入口（当前 alert 建设中） | 无 |
| 1049 | `getTaskLog()` | 查询任务日志（分页） | `api.getTaskLog()` |
| 1055 | `logload()` | 加载补数日志 | `api.getTaskLog()` |
| 1064 | `handleSizeChange(val)` | 日志分页 - 切换每页条数 | `getTaskLog()` |
| 1069 | `handleCurrentChange(val)` | 日志分页 - 切换页码 | `getTaskLog()` |

### 4.7 初始化

| 行号 | 方法 | 功能 |
|------|------|------|
| 974 | `initOptions()` | 加载所有下拉选项（6个并行请求） |
| 995 | `initData(curFlag)` | 初始化日期默认值（当天 00:00 - 23:59） |
| 952 | `initJobSortable()` | 初始化任务表拖拽排序 |
| 930 | `initParamSortable()` | 初始化参数表拖拽排序 |

### 4.8 模板

| 行号 | 方法 | 功能 |
|------|------|------|
| 1168 | `templateData(val, type)` | 接收模板选择事件 |
| 1521 | `modelShow()` | 确认模板选择，加载模板内容 |

### 4.9 批量设置

| 行号 | 方法 | 功能 |
|------|------|------|
| 1396 | `batchSetParams()` | 打开批量设置弹窗，构建数据源/节点映射 |
| 1429 | `batchSetConfirm()` | 确认批量设置，更新所有任务的数据源 |

### 4.10 工具方法

| 行号 | 方法 | 功能 |
|------|------|------|
| 870 | `formatContent(content)` | JSON 字符串格式化（手写缩进） |
| 892 | `_assignSortIds(list)` | 为列表项分配 `__sortId`（拖拽排序用） |
| 898 | `jobRowClassName({row})` | 禁用任务行样式（`job-disabled-row`） |
| 901 | `handleExportCommand(command, row)` | 导出下拉命令分发 |
| 1205 | `scriptNotNull(node)` | 脚本非空校验 |

### 4.11 上传

| 行号 | 方法 | 功能 |
|------|------|------|
| 1571 | `exceedFile(files, fileList)` | 文件超出5个限制警告 |
| 1577 | `handlePreview(file)` | 点击已上传文件，下载插件 |
| 1580 | `beforeUpload(file)` | 上传前校验（仅 .js，<5MB）并上传 |
| 1605 | `handleUpload(file)` | 空方法（http-request 占位） |

### 4.12 导航

| 行号 | 方法 | 功能 |
|------|------|------|
| 918 | `showCronDialog()` | 打开 Cron 弹窗 |
| 922 | `cronConfirm()` | 确认 Cron 表达式 |
| 926 | `goToDatasource()` | 新窗口打开数据源管理页 |
| 1659 | `clearValidate()` | 清除表单验证状态 |
| 1147 | `moveUp(index)` | 任务行上移（已不在模板中使用） |
| 1158 | `moveDown(index)` | 任务行下移（已不在模板中使用） |

---

## 5. 核心业务流程

### 5.1 新增配置

```
用户点击「新增」
  → edit(0)
    → 重置 subFormData / tableData / jobList / 节点数据
    → 设置默认模板「自定义」(templateId=0)
    → 设置默认 tenantId = cur_user.tenantId
    → 打开 dialogFormVisible
    → initParamSortable() + initJobSortable()
  → 用户填写表单 + 配置任务 + 编辑脚本
  → 点击「保存」
    → subForm('configForm')
      → 构建 obj = {...subFormData, jobList, configValue: tableData, pluginsList}
      → $refs.configForm.validate()
      → api.submitForm(obj)
        → 新建: POST /services/fwcore/config
        → 编辑: PUT  /services/fwcore/config/:id
      → 成功后 getData() 刷新列表
      → api.getIdRow() 回读 jobList（获取服务端生成的 ID）
```

### 5.2 编辑配置

```
用户点击「编辑」
  → edit(row)
    → api.getIdRow(row.id) 获取完整配置 JSON
    → JSON.parse(res.model) → 解析 jobList + configValue + pluginsList
    → 构建 pathMap（API 上报路径校验缓存）
    → _assignSortIds() 分配拖拽 ID
    → 打开 dialogFormVisible
```

### 5.3 配置下发

```
用户在编辑弹窗点击「下发」
  → issue(subFormData.id)
    → Loading.service('正在下发，请稍候...')
    → api.issueType(id)  // GET /services/fwcore/config/send/:id, timeout 120s
      → 后端 fw-core → POST agent:8080/api/console/config + /api/console/datasource
      → Agent 重新加载 Quartz 任务 + 数据源连接池
    → res.model.code === 200 → 成功提示 + 刷新列表
    → 否则显示 res.model.msg 错误
```

### 5.4 补数执行

```
用户点击任务行「补数」
  → runAgain(scope)
    → 打开 rerun_falg 弹窗
  → 用户设置时间范围 + 参数
  → 点击「确定」
    → runTask()
      → Loading.service('任务执行中...')
      → api.runTask(reRun)  // POST /services/fwcore/config/run-task, timeout 120s
      → 成功后 pollTaskLog(0)
        → api.getTaskLog(log) 查询日志
        → 日志为空且 retryCount < 5 → setTimeout 5s 后重试
        → 日志有数据或重试耗尽 → logLoading.close()
  → 弹窗关闭时 → clearLogPoll() 清除定时器
```

### 5.5 模板选择

```
用户在新增弹窗点击「选择模板」
  → ShowMoule = true
  → multipleTable 组件加载模板列表
    → api.getPageAuth({ tenantId }) 从 addministrative.js
  → 用户单选/双击模板行
    → $emit('templateData', val, type)
    → type===2(双击) → 自动调用 modelShow()
    → type===1(单选) → 用户点击「确定」→ modelShow()
  → modelShow()
    → 设置 subFormData.templateName/templateId
    → api.getTemplateContent(id) 加载模板内容
    → 填充 jobList + tableData + fileList + pathMap
    → 关闭模板弹窗
```

---

## 6. 表单验证规则

| 规则集 | 字段 | 条件 | 消息 |
|--------|------|------|------|
| `subFormDataRule` | name | 必填 | 请填写名称 |
| | tenantId | admin 用户必填 | 请选择客户 |
| | templateId | 必填 | 请选择模板 |
| `inNodeFormRule` | dataSource | 必选（非自定义脚本） | 请选择数据源 |
| | cron | 必填（非 API 上报） | 请填写定时配置 |
| | IncrementalField | 必填（仅数据库查询） | 请填写自增字段 |
| | path | 必填（API 查询/API 上报） | 请填写访问路径 |
| `outNodeFormRule` | dataSource | 必选（非自定义脚本） | 请选择数据源 |
| | path | 必填（仅 API 调用） | 请填写访问路径 |
| `scriptNotNull` | scriptContent | 自定义方法，三节点均调用 | 脚本为必填项 |

注意: 验证规则静态定义，但对应的表单项通过 `v-if` 动态显示，因此实际上是「条件必填」行为。

---

## 7. 数据结构

### 7.1 jobList 项结构

```javascript
{
  __sortId: Number,          // 前端拖拽排序 ID（自增）
  id: String,                // 服务端生成，新建时为空
  jobName: String,           // 任务名称
  enable: 'true' | 'false',  // 启用状态（字符串 boolean）
  inNode: {
    id: String,
    classify: 'in',
    type: String,            // 输入类型 key（如 'dbQuery', 'apiQuery', 'apiUp', 'jsScript'）
    configValue: String      // JSON 字符串，包含 cron/dataSource/scriptContent/path 等
  },
  transformNode: {
    id: String,
    classify: 'transform',
    type: String,
    configValue: String      // JSON 字符串，包含 scriptContent
  },
  outNode: {
    id: String,
    classify: 'out',
    type: String,            // 输出类型 key（如 'dbWrite', 'apiCall', 'jsScript'）
    configValue: String      // JSON 字符串，包含 dataSource/scriptContent/path 等
  }
}
```

### 7.2 tableData（参数）项结构

```javascript
{
  __sortId: Number,
  key: String,     // 参数名称
  value: String    // 参数值
}
```

### 7.3 configValue JSON 字符串格式（节点内部）

输入节点（数据库查询示例）:
```json
{
  "cron": "0 0/5 * * * ?",
  "dataSource": "123",
  "IncrementalField": "update_time",
  "scriptContent": "result.field = obj.field;",
  "protocol": "http",
  "authFlag": "Y",
  "path": "/api/data"
}
```

### 7.4 API 请求/响应格式

提交保存 (`submitForm`):
```javascript
{
  id: String|null,
  name: String,
  nodeId: String,
  templateId: Number,
  tenantId: String,
  templateName: String,
  jobList: [...],
  configValue: [...],       // tableData 数组
  pluginsList: [{ name, configId, fileUrl }]
}
```

响应 (`getIdRow`):
```javascript
{
  model: String  // JSON 字符串，JSON.parse 后结构同提交数据
}
```

---

## 8. 边界条件与已知问题

### 8.1 功能性问题

| 编号 | 问题 | 严重度 | 位置 |
|------|------|--------|------|
| B1 | `logSearch()` 当前为 `alert('建设中...')`，日志查询功能未完成 | 中 | L1039 |
| B2 | `getData()` 错误时 `table.loading` 不关闭（无 `.catch` 重置） | 中 | L1725-1737 |
| B3 | `submitForm` 失败时无 toast 提示，仅 `console.error` | 低 | L1651-1653 |
| B4 | `moveUp`/`moveDown` 方法已被 Sortable 拖拽替代，但代码未删除 | 低 | L1147-1167 |
| B5 | `beforeUpload` 提示 "文件大小不得超过2M" 但实际校验 5MB | 低 | L1585-1589 |

### 8.2 admin vs 非 admin 差异

- admin 用户: 显示「客户」选择字段（`tenantId`），`subFormDataRule.tenantId` 生效
- 非 admin 用户: 隐藏该字段，`tenantId` 自动取 `cur_user.tenantId`
- `initOptions()` 中 `bcpDatasourceName` 按当前用户 `tenantId` 过滤

### 8.3 API 路径唯一性校验

- `pathMap` (Map) 缓存 API 上报类型的 `path → nodeId` 映射
- `affirmInNode()` 中检查: 若 path 已存在且 nodeId 不同 → 报错
- 保存后 `api.getIdRow()` 回读时重建 pathMap
- 注意: pathMap 仅在前端校验，不依赖后端唯一性约束

### 8.4 数据源 ID 类型不一致

- `bcpDatasourceName` 的 key 为字符串（Object key 天然是 string）
- `inNode.dataSource` / `outNode.dataSource` 原始值可能为 Number
- 已通过模板中 `:value="optindex + ''"` 强制转 string 兼容

### 8.5 定时器泄漏风险

- `queryLogTask` (setTimeout) 在补数弹窗关闭时通过 `@close="clearLogPoll"` 清除
- 但若用户在轮询中关闭整个编辑弹窗（`dialogFormVisible=false`），补数弹窗的 `@close` 不触发
- 组件级 `beforeDestroy` 未清除 `queryLogTask`

### 8.6 IMC 模式

- `menuURL` 中含 'IMC' 时隐藏「更多」导出按钮（L10）
- IMC 是独立菜单入口，复用同一视图但限制功能

---

## 9. 子组件分析

### 9.1 Monaco 编辑器（monaco.vue, 355行）

**组件名**: `AcMonaco`

**Props**:

| prop | 类型 | 默认值 | 用途 |
|------|------|--------|------|
| `opts` | Object | `{}` | 编辑器选项覆写 |
| `height` | Number | 300 | 编辑器高度 |
| `fields` | Array | `[]` | 数据源字段列表（自动补全） |

**核心方法**:

| 方法 | 功能 |
|------|------|
| `init()` | 销毁旧实例 → 注册运行时类型 → 注册代码片段 → 创建编辑器 → 绑定 change 事件 |
| `setValue(data)` | 设置编辑器内容 |
| `getVal()` | 获取编辑器内容 |
| `clearContent()` | 清空编辑器 |
| `formatCode()` | 触发 Monaco 格式化 |
| `copyCode()` | 复制代码到剪贴板 |
| `maxEditor()` | 全屏模式 |
| `minEditor()` | 退出全屏 |
| `registerCompletionProvider()` | 注册 `obj.` 属性补全（基于 fields） |
| `updateTypeDefinitions()` | 通过 `addExtraLib` 声明 obj 字段类型 |

**自动补全**: 

1. **运行时类型** (全局注册一次): `obj`, `result`, `params`, `logger`, `print` 的 TypeScript 声明
2. **代码片段** (全局注册一次): 5 个 BCP 运行时片段
   - `for-obj-fields` - 遍历 obj 字段
   - `if-null-check` - 空值检查
   - `result-set` - 设置 result 输出
   - `logger-info` - 输出日志
   - `try-catch` - 异常捕获
3. **字段补全** (per-instance): `obj.` 触发后按 `fields` 数组生成属性建议
4. **类型定义** (per-instance): `addExtraLib` 为 obj 生成精确类型声明

**资源释放** (`beforeDestroy`):
- `completionDisposable.dispose()` — 释放字段补全提供者
- `extraLibDisposable.dispose()` — 释放类型定义
- `monacoEditor.dispose()` — 释放编辑器实例

**编辑器配置**:
- 主题: `vs-dark`
- 语言: `javascript`
- TypeScript 目标: ES5（匹配 Nashorn 引擎）
- minimap: 禁用
- 自动补全: 启用关键词/片段/变量/函数/属性
- Tab 补全: 开启

### 9.2 模板选择（multipleTable.vue, 113行）

**组件名**: 默认导出（无 name 属性）

**数据**:

| 变量 | 用途 |
|------|------|
| `tableData` | 模板列表 |
| `radioId` | 当前选中的模板名称 |
| `setData` | 分页参数（未实际使用分页组件） |

**方法**:

| 方法 | 功能 |
|------|------|
| `getList()` | 通过 `api.getPageAuth({tenantId})` 加载模板列表 |
| `rowClick(row)` | 设置 radioId（单选） |
| `handleSelectionChange(val)` | 发出 `templateData` 事件 (type=1, 单选) |
| `handleSelection(val)` | 发出 `templateData` 事件 (type=2, 双击确认) |

**已知问题**:
- 通过 `this.$parent.$parent.cur_user.tenantId` 访问父组件数据，紧耦合
- 分页参数 `setData` 定义了但分页 UI 未渲染
- 无 name 属性，违反项目 ESLint 规则（PascalCase name）

---

## 10. 测试覆盖现状

### 10.1 已有测试

| 文件 | 用例数 | 覆盖内容 |
|------|--------|---------|
| `tests/unit/api/IntegratedConfig.spec.js` | 15 | 所有 14 个 API 函数的 HTTP 方法/URL/参数 |
| `tests/unit/api/IntegratedConfigura.spec.js` | 6 | IntegratedConfigura CRUD 6 个函数 |
| `tests/unit/api/_crud.spec.js` | 11 | createCrudApi 工厂函数 |

### 10.2 缺失测试

| 目标 | 建议用例数 | 优先级 | 说明 |
|------|-----------|--------|------|
| index.vue 视图组件 | 25-30 | P1 | getData/edit/subForm/issue/runTask 等核心流程 |
| monaco.vue 组件 | 10-12 | P2 | init/setValue/getVal/registerCompletionProvider |
| multipleTable.vue 组件 | 5-6 | P3 | getList/rowClick/handleSelection |
| 节点配置流程 | 10-12 | P1 | changeOptionsInput/affirmInNode 等 |
| 边界条件 | 8-10 | P2 | 空 jobList/pathMap 冲突/脚本空值 |

**预估需补充**: 约 60-70 个测试用例

---

## 附录: IntegratedConfig.js API 完整列表

| 函数 | HTTP | URL | 超时 | 来源 |
|------|------|-----|------|------|
| `getPage(params)` | GET | `/services/fwcore/config` | 默认 | _crud |
| `submitForm(params)` | POST/PUT | `/services/fwcore/config[/:id]` | 默认 | _crud |
| `batchDelete(params)` | DELETE | `/services/fwcore/config?...` | 默认 | _crud |
| `singleDelete(id)` | DELETE | `/services/fwcore/config/:id` | 默认 | _crud |
| `getIdRow(id)` | GET | `/services/fwcore/config/:id` | 默认 | 自定义 |
| `getRolesByUserId(params)` | GET | `/services/fwcore/config/user/:id` | 默认 | 自定义 |
| `getName(params)` | GET | `/services/fwcore/config` | 默认 | 自定义 |
| `exportExcel(param)` | GET | `/services/fwcore/config/down/:id` | 默认 | 自定义 |
| `expForIot(param)` | GET | `/services/fwcore/config/down/:type/:id` | 默认 | 自定义 |
| `runTask(param)` | POST | `/services/fwcore/config/run-task` | 120s | 自定义 |
| `getTaskLog(param)` | POST | `/services/fwcore/config/task/log` | 30s | 自定义 |
| `issueType(param)` | GET | `/services/fwcore/config/send/:id` | 120s | 自定义 |
| `getTemplateContent(id)` | GET | `/services/fwcore/template/down/:id` | 默认 | 自定义 |
| `upload(params, configId)` | POST | `/services/fwcore/upload-plugins/:configId` | 默认 | 自定义 |
| `getDatasourceFields(id)` | GET | `/services/fwcore/datasource/fields/:id` | 默认 | 自定义 |
