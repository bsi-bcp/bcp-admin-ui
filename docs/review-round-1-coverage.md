# integrationConfig 测试套件覆盖率评审报告 (Round 1)

**评审日期**: 2026-04-04
**评审范围**: index.spec.js (59 用例) + monaco.spec.js (20 用例) + multipleTable.spec.js (9 用例) = 88 个测试用例
**源码范围**: index.vue (1815行, 57方法) + monaco.vue (355行, 12方法) + multipleTable.vue (113行, 5方法)

---

## 1. 覆盖率评分

### 1.1 总评分: 5.5 / 10

| 维度 | 得分 | 满分 | 说明 |
|------|------|------|------|
| **方法覆盖率** | 2.5 | 4 | index.vue: 37/57 = 64.9%; monaco.vue: 10/12 = 83.3%; multipleTable: 5/5 = 100% |
| **分支覆盖率** | 1.5 | 3 | 多数被测方法仅覆盖 happy path, error/catch 分支大面积遗漏 |
| **边界条件覆盖率** | 1.5 | 3 | 空数组/null 有零星覆盖, 但缺乏系统性的边界测试 |

### 1.2 方法覆盖率明细 (index.vue)

**已测试方法 (37/57)**:
`formatContent`, `_assignSortIds`, `jobRowClassName`, `handleExportCommand`, `copyParamCode`, `showCronDialog`, `cronConfirm`, `initOptions`, `initData`, `addJob`, `addJobJson`, `deljobList`, `copyJob`, `copyJobJson`, `enableAll`, `moveUp`, `moveDown`, `templateData`, `changeOptionsInput`, `changeOptionsTransform`, `changeOptionsOutput`, `affirmInNode`, `affirmTransformNode`, `affirmOutNode`, `setValue`, `loadDatasourceFields`, `delTableData`, `scriptNotNull`, `issue`, `runTask`, `pollTaskLog`, `clearLogPoll`, `addParam`, `batchSetParams`

(注: `derive` 和 `expForIot` 通过 `handleExportCommand` 间接测试)

**未测试方法 (20/57)**:
`goToDatasource`, `initParamSortable`, `initJobSortable`, `runAgain`, `logSearch`, `getTaskLog`, `logload`, `handleSizeChange`, `handleCurrentChange`, `importFile`, `addByJson`, `batchSetConfirm`, `modelShow`, `remove`, `exceedFile`, `handlePreview`, `beforeUpload`, `handleUpload`, `subForm`, `edit`, `getData`, `clearValidate`, `cellMouseEnter`

### 1.3 方法覆盖率明细 (monaco.vue)

**已测试方法 (10/12)**:
`clearContent`, `setValue`, `getVal`, `formatCode`, `copyCode`, `maxEditor`, `minEditor`, `registerCompletionProvider`, `updateTypeDefinitions` + 组件 export/data 验证

**未测试方法 (2/12)**:
`init()` (核心初始化,含编辑器创建、运行时类型注册、代码片段注册), `beforeDestroy` (资源释放)

---

## 2. 遗漏的关键方法 (必须补充)

以下方法属于核心业务流程,未被测试构成重大风险:

### 2.1 `subForm(formData)` -- 严重程度: P0

**位置**: `/Users/paul/Documents/GitHub/md-bcp-1.0/md-bcp-admin-ui/src/views/integrationConfig/index.vue` L1608-L1658

**原因**: 这是保存配置的核心方法,涉及表单构建(`obj`)、pluginsList 组装、`$refs.configForm.validate`、`api.submitForm`、保存后 `api.getIdRow` 回读重建 `pathMap` 等多个关键逻辑。任何一个环节出错都会导致数据丢失或不一致。

**需要覆盖的分支**:
- validate 通过 -> submitForm 成功 -> getIdRow 成功
- validate 通过 -> submitForm 成功 -> getIdRow 失败 (catch)
- validate 通过 -> submitForm 失败 (catch)
- validate 失败 -> return false
- pluginsUpload ref 存在时的 pluginsList 组装
- pluginsUpload ref 不存在时的空 pluginsList

### 2.2 `edit(row)` -- 严重程度: P0

**位置**: L1665-L1724

**原因**: 新增和编辑的入口方法,包含两条完全不同的代码路径(row===0 新增 vs row 编辑)。新增路径重置所有表单字段、设置默认模板和租户;编辑路径调用 `api.getIdRow` 解析 JSON、构建 `pathMap`、恢复文件列表。

**需要覆盖的分支**:
- `row === 0` (新增路径): 重置、默认值、打开弹窗
- `row !== 0` (编辑路径): API 调用、JSON 解析、pathMap 构建、pluginsList 恢复
- 编辑路径中 `data.pluginsList` 存在和不存在的情况

### 2.3 `getData(datas)` -- 严重程度: P0

**位置**: L1725-L1737

**原因**: 配置列表的数据加载方法,在 created 中未直接调用但被 `mod-filter` 组件的 `@query` 事件触发。该方法使用 `$set` 更新多个响应式属性。分析文档 B2 指出其缺少 `.catch` 处理,`table.loading` 在错误时不关闭。

**需要覆盖的分支**:
- API 成功时 resData 正确赋值
- API 失败时 loading 状态(当前是 bug,应验证 bug 存在)

### 2.4 `remove(row)` -- 严重程度: P1

**位置**: L1554-L1569

**原因**: 删除操作,涉及 `$confirm` 确认 + `api.singleDelete` + 成功消息 + 刷新列表。

**需要覆盖的分支**:
- $confirm 确认 -> singleDelete 成功
- $confirm 取消

### 2.5 `modelShow()` -- 严重程度: P1

**位置**: L1521-L1552

**原因**: 模板选择确认的核心方法,调用 `api.getTemplateContent` 加载模板内容并填充 `jobList`、`tableData`、`pathMap`、`fileList`。templateData 方法已测试但 modelShow 本身未测试。

**需要覆盖的分支**:
- API 返回包含 pluginsList 的响应
- API 返回不含 pluginsList 的响应
- configValue 为 null 时 tableData 回退为空数组

### 2.6 `batchSetConfirm()` -- 严重程度: P1

**位置**: L1429-L1445

**原因**: 批量设置的确认方法,遍历 jobList 按类型匹配更新 configValue 中的 dataSource。`batchSetParams` 已测试,但实际执行批量更新的 `batchSetConfirm` 未测试,形成测试断链。

### 2.7 `importFile(event)` -- 严重程度: P1

**位置**: L1447-L1469

**原因**: 文件导入功能,使用 FileReader 解析 JSON 文件并替换 jobList 和 tableData。涉及异步读取、JSON 解析、Loading 管理。

### 2.8 `beforeUpload(file)` -- 严重程度: P2

**位置**: L1580-L1604

**原因**: 插件上传前校验,包含文件扩展名(.js)和大小(5MB)校验。分析文档 B5 指出提示语与实际校验不一致(提示2M实际校验5M),测试应验证此 bug。

**需要覆盖的分支**:
- 文件 > 5MB -> 警告
- 非 .js 文件 -> 警告
- 合法 .js 文件 -> api.upload 调用

### 2.9 `getTaskLog()` -- 严重程度: P2

**位置**: L1049-L1053

**原因**: 日志查询的直接 API 调用方法, 被 `handleSizeChange` 和 `handleCurrentChange` 依赖。

### 2.10 `logload()` -- 严重程度: P2

**位置**: L1055-L1062

**原因**: 补数日志加载方法, 设置 `repairFlag=true` 后调用 API, 成功后关闭 loading。

### 2.11 `handleSizeChange(val)` / `handleCurrentChange(val)` -- 严重程度: P2

**位置**: L1064-L1072

**原因**: 日志分页控制, 修改 pageSize/currentPage 后调用 getTaskLog。逻辑简单但属于标准分页模式,应确保字段正确更新。

### 2.12 `runAgain(data)` -- 严重程度: P2

**位置**: L1029-L1037

**原因**: 补数弹窗的入口方法, 重置 reRun 对象并打开弹窗。

### 2.13 Monaco `init()` 方法 -- 严重程度: P1

**位置**: `/Users/paul/Documents/GitHub/md-bcp-1.0/md-bcp-admin-ui/src/views/integrationConfig/moudel/monaco.vue` L221

**原因**: 编辑器初始化的核心方法, 负责销毁旧实例、调用 `registerRuntimeLib()`、`registerSnippets()`、创建编辑器实例、注册字段补全和类型定义。是 monaco.vue 中最复杂且最重要的方法。

---

## 3. 遗漏的分支条件 (建议补充)

### 3.1 `issue()` -- 缺少 catch 分支

当前测试覆盖了 code===200 和 code!==200, 但未覆盖 API 调用本身抛出异常 (L1142-L1144 的 `.catch`)。

### 3.2 `runTask()` -- 缺少 catch 分支

L1086-L1089 的 `.catch(() => { this.logLoading.close(); this.$message.error('补数请求失败') })` 未测试。

### 3.3 `pollTaskLog()` -- 缺少 catch 分支 及 MAX_RETRIES 边界

L1104-L1111 的 `.catch` 分支未测试。也未测试 retryCount === MAX_RETRIES (即 5) 时的行为:日志仍为空但已耗尽重试次数时是否正确关闭 loading。

### 3.4 `affirmInNode()` -- 缺少 validate 失败分支

当前测试了 validate(true) 的三种子分支, 但未测试 `validate(cb => cb(false))` 即表单校验失败的情况。

### 3.5 `affirmOutNode()` -- 缺少 validate 失败分支及脚本为空分支

只测试了 validate 通过且脚本非空的 happy path, 未测试:
- validate 失败
- validate 通过但 scriptContent 为空

### 3.6 `changeOptionsInput/Transform/Output` -- 缺少 scriptContent === undefined 分支

当前测试提供的 configValue 都包含 scriptContent, 未测试 configValue 中不含 scriptContent 时的默认示例数据回退逻辑 (L1249-L1251, L1279-L1281, L1303-L1305)。

### 3.7 `changeOptionsInput` -- 缺少 apiUp 类型的默认值设置分支

L1266-L1269 中 apiUp 类型时设置 protocol 和 authFlag 默认值的逻辑未测试。

### 3.8 `loadDatasourceFields` -- 缺少 API 返回 catch 分支

L1332-L1334 中 API 调用失败时 `currentFields = []` 未测试。

### 3.9 `copyParamCode` -- 缺少 clipboard 成功回调中的 success 消息

当前测试只验证了 `writeText` 被调用, 未验证 `.then()` 中的成功消息。

### 3.10 `batchSetParams` -- 缺少 jobList 非空时的完整构建逻辑

当前测试仅测了空 jobList 的边界情况 (L811-L818), 未测试 jobList 非空时如何按类型去重构建 batchTableData。

---

## 4. 遗漏的边界场景

### 4.1 formatContent -- 未测试非 JSON 字符串输入

如传入 `null`、`undefined`、纯文本 `"hello"`、含 `[]` 的数组 JSON、包含 Unicode 字符的 JSON。

### 4.2 addJobJson -- 未测试仅部分节点缺失的 JSON

例如 `{"inNode":{}, "transformNode":{}}` (缺 outNode) 或 `{"inNode":{}, "outNode":{}}` (缺 transformNode)。当前测试了 `{"inNode":{}}` 但未穷举。

### 4.3 jobList 超大数据

未测试 jobList 包含数百个任务时 `enableAll`、`batchSetParams`、`batchSetConfirm` 的行为。

### 4.4 copyJob / copyJobJson -- 嵌套对象的深拷贝独立性

未验证修改拷贝后的对象不会影响原对象 (deep copy 独立性)。

### 4.5 deljobList -- $confirm 被拒绝的路径

当前测试仅验证了 $confirm resolve 的路径, 未测试 $confirm reject (用户取消) 时 jobList 保持不变。

### 4.6 initData -- curFlag 为 undefined/null 的情况

当前测试了 true/false, 但 JS 中 falsy 值多样, 未测试 undefined/0 等输入。

### 4.7 Monaco registerCompletionProvider -- provideCompletionItems 返回值验证

已测试 provider 被注册, 但未调用 `provideCompletionItems` 函数验证其返回的 suggestions 数组内容是否正确包含字段名。

### 4.8 Monaco updateTypeDefinitions -- 字段类型映射正确性

已测试 `addExtraLib` 被调用且内容包含字段名, 但未验证 fieldType 到 TypeScript 类型的映射是否正确(如 `number` -> `number`, `date` -> `string` 等)。

### 4.9 multipleTable -- getList API 失败的情况

仅测试了 API 成功场景, 未测试 `getPageAuth` reject 时的行为。

---

## 5. 具体补充建议

以下为可直接执行的 Jest 测试用例代码片段:

### 5.1 subForm -- 保存成功路径

```javascript
describe('subForm', () => {
  it('builds obj correctly and calls submitForm on valid form', async () => {
    const vm = createVm()
    vm.subFormData = { id: '1', name: 'test', nodeId: 'n1', templateId: 0, tenantId: '1', templateName: '自定义' }
    vm.jobList = [{ jobName: 'j1', inNode: { type: 'db', configValue: '{}' }, outNode: { type: 'db', configValue: '{}' }, transformNode: { type: 'js', configValue: '{}' } }]
    vm.tableData = [{ key: 'k1', value: 'v1' }]
    vm.fileMap = {}
    vm.$refs = {
      configForm: { validate: jest.fn(cb => cb(true)) },
      pluginsUpload: { uploadFiles: [] }
    }
    vm.getData = jest.fn()
    
    api.submitForm.mockResolvedValueOnce({ model: '1' })
    api.getIdRow.mockResolvedValueOnce({ model: JSON.stringify({
      jobList: [{ jobName: 'j1', inNode: { type: 'db', configValue: '{}', id: 'i1' }, outNode: { type: 'db', configValue: '{}', id: 'o1' }, transformNode: { type: 'js', configValue: '{}', id: 't1' } }]
    })})
    
    vm.subForm('configForm')
    await new Promise(r => setTimeout(r, 0))
    
    expect(api.submitForm).toHaveBeenCalledWith(expect.objectContaining({
      name: 'test',
      jobList: expect.any(Array),
      configValue: expect.any(Array)
    }))
    expect(vm.$message.success).toHaveBeenCalledWith('保存成功')
  })

  it('does not call submitForm when validate fails', () => {
    const vm = createVm()
    vm.$refs = {
      configForm: { validate: jest.fn(cb => cb(false)) },
      pluginsUpload: { uploadFiles: [] }
    }
    vm.subForm('configForm')
    expect(api.submitForm).not.toHaveBeenCalled()
  })
})
```

### 5.2 edit -- 新增与编辑路径

```javascript
describe('edit', () => {
  it('resets form data and opens dialog for new config (row===0)', async () => {
    const vm = createVm()
    vm.$refs = {
      configForm: { clearValidate: jest.fn() },
      pluginsUpload: { clearFiles: jest.fn() },
      paramTable: { $el: { querySelector: jest.fn(() => document.createElement('tbody')) } },
      jobTable: { $el: { querySelector: jest.fn(() => document.createElement('tbody')) } }
    }
    await vm.edit(0)
    expect(vm.subFormData.templateName).toBe('自定义')
    expect(vm.subFormData.templateId).toBe(0)
    expect(vm.subFormData.tenantId).toBe('1')
    expect(vm.jobList).toEqual([])
    expect(vm.tableData).toEqual([])
    expect(vm.dialogFormVisible).toBe(true)
  })

  it('loads existing config for edit (row with id)', async () => {
    const mockData = {
      id: '123', name: 'test', nodeId: 'n1', templateId: 1,
      tenantId: 5, templateName: 'tpl1',
      jobList: [{ jobName: 'j1', inNode: { type: 'db', configValue: '{}' }, outNode: { type: 'db', configValue: '{}' }, transformNode: { type: 'js', configValue: '{}' } }],
      configValue: '[{"key":"k1","value":"v1"}]',
      pluginsList: [{ name: 'plugin.js', fileUrl: '/url' }]
    }
    api.getIdRow.mockResolvedValueOnce({ model: JSON.stringify(mockData) })
    
    const vm = createVm()
    vm.$refs = {
      configForm: { clearValidate: jest.fn() },
      pluginsUpload: { clearFiles: jest.fn() },
      paramTable: { $el: { querySelector: jest.fn(() => document.createElement('tbody')) } },
      jobTable: { $el: { querySelector: jest.fn(() => document.createElement('tbody')) } }
    }
    await vm.edit({ id: '123' })
    
    expect(api.getIdRow).toHaveBeenCalledWith('123')
    expect(vm.subFormData.name).toBe('test')
    expect(vm.jobList.length).toBe(1)
    expect(vm.fileList.length).toBe(1)
    expect(vm.dialogFormVisible).toBe(true)
  })
})
```

### 5.3 remove -- 删除确认与取消

```javascript
describe('remove', () => {
  it('calls singleDelete after confirm and refreshes list', async () => {
    const vm = createVm()
    vm.$confirm = jest.fn(() => Promise.resolve())
    vm.getData = jest.fn()
    api.singleDelete.mockResolvedValueOnce({})
    
    vm.remove({ id: '1' })
    await new Promise(r => setTimeout(r, 0))
    
    expect(api.singleDelete).toHaveBeenCalledWith('1')
    expect(vm.$message.success).toHaveBeenCalledWith(expect.objectContaining({ message: '删除成功' }))
  })

  it('does not delete when confirm is cancelled', async () => {
    const vm = createVm()
    vm.$confirm = jest.fn(() => Promise.reject())
    
    vm.remove({ id: '1' })
    await new Promise(r => setTimeout(r, 0))
    
    expect(api.singleDelete).not.toHaveBeenCalled()
  })
})
```

### 5.4 batchSetConfirm -- 批量更新数据源

```javascript
describe('batchSetConfirm', () => {
  it('updates dataSource in all job configValues', () => {
    const vm = createVm()
    vm.jobList = [{
      inNode: { classify: 'in', type: 'db', configValue: '{"dataSource":"old1","scriptContent":"sql"}' },
      outNode: { classify: 'out', type: 'dbWrite', configValue: '{"dataSource":"old2","scriptContent":"insert"}' },
      transformNode: { type: 'js', configValue: '{}' }
    }]
    vm.batchTableData = [
      { nodeType: 'in', sourceType: 'db', dataSource: 'new1' },
      { nodeType: 'out', sourceType: 'dbWrite', dataSource: 'new2' }
    ]
    
    vm.batchSetConfirm()
    
    const inConfig = JSON.parse(vm.jobList[0].inNode.configValue)
    const outConfig = JSON.parse(vm.jobList[0].outNode.configValue)
    expect(inConfig.dataSource).toBe('new1')
    expect(outConfig.dataSource).toBe('new2')
    expect(vm.batch_falg).toBe(false)
    expect(vm.$message).toHaveBeenCalledWith(expect.objectContaining({ type: 'success' }))
  })
})
```

### 5.5 modelShow -- 模板选择确认

```javascript
describe('modelShow', () => {
  it('loads template content and populates jobList and tableData', async () => {
    const vm = createVm()
    vm.temData = { id: 't1', name: 'Template A' }
    
    api.getTemplateContent.mockResolvedValueOnce({
      jobList: [{ jobName: 'j1', inNode: { type: 'db', configValue: '{}' }, outNode: { type: 'db', configValue: '{}' }, transformNode: { type: 'js', configValue: '{}' } }],
      configValue: '[{"key":"k1","value":"v1"}]',
      pluginsList: [{ name: 'p.js', fileUrl: '/url' }]
    })
    
    vm.modelShow()
    await new Promise(r => setTimeout(r, 0))
    
    expect(vm.subFormData.templateName).toBe('Template A')
    expect(vm.subFormData.templateId).toBe('t1')
    expect(api.getTemplateContent).toHaveBeenCalledWith('t1')
    expect(vm.jobList.length).toBe(1)
    expect(vm.tableData.length).toBe(1)
    expect(vm.fileList.length).toBe(1)
    expect(vm.ShowMoule).toBe(false)
  })

  it('handles null configValue gracefully', async () => {
    const vm = createVm()
    vm.temData = { id: 't2', name: 'Template B' }
    
    api.getTemplateContent.mockResolvedValueOnce({
      jobList: [],
      configValue: null,
      pluginsList: null
    })
    
    vm.modelShow()
    await new Promise(r => setTimeout(r, 0))
    
    expect(vm.tableData).toEqual([])
    expect(vm.fileList).toEqual([])
  })
})
```

### 5.6 runTask -- catch 分支

```javascript
describe('runTask - error path', () => {
  it('closes loading and shows error message on API failure', async () => {
    const closeFn = jest.fn()
    Loading.service.mockReturnValue({ text: '', close: closeFn })
    api.runTask.mockRejectedValueOnce(new Error('network error'))
    
    const vm = createVm()
    vm.reRun = { taskId: 't1', configId: 'c1' }
    vm.runTask()
    await new Promise(r => setTimeout(r, 0))
    
    expect(closeFn).toHaveBeenCalled()
    expect(vm.$message.error).toHaveBeenCalledWith('补数请求失败')
  })
})
```

### 5.7 pollTaskLog -- catch 分支及 MAX_RETRIES 边界

```javascript
describe('pollTaskLog - error and exhaustion', () => {
  it('retries on API error when retryCount < MAX', async () => {
    jest.useFakeTimers()
    api.getTaskLog.mockRejectedValueOnce(new Error('timeout'))
    const closeFn = jest.fn()
    const vm = createVm()
    vm.logLoading = { close: closeFn, text: '' }
    
    vm.pollTaskLog(0)
    await Promise.resolve()
    
    expect(vm.queryLogTask).toBeDefined()
    expect(closeFn).not.toHaveBeenCalled()
    jest.useRealTimers()
  })

  it('closes loading when retryCount reaches MAX on catch', async () => {
    api.getTaskLog.mockRejectedValueOnce(new Error('timeout'))
    const closeFn = jest.fn()
    const vm = createVm()
    vm.logLoading = { close: closeFn, text: '' }
    
    vm.pollTaskLog(5)
    await Promise.resolve()
    
    expect(closeFn).toHaveBeenCalled()
  })

  it('closes loading when retryCount reaches MAX with empty logs', async () => {
    api.getTaskLog.mockResolvedValueOnce({ model: [], totalCount: 0 })
    const closeFn = jest.fn()
    const vm = createVm()
    vm.logLoading = { close: closeFn, text: '' }
    
    vm.pollTaskLog(5)
    await Promise.resolve()
    
    expect(closeFn).toHaveBeenCalled()
  })
})
```

### 5.8 beforeUpload -- 文件校验

```javascript
describe('beforeUpload', () => {
  it('rejects files larger than 5MB', () => {
    const vm = createVm()
    vm.$notify = { warning: jest.fn() }
    const bigFile = { name: 'plugin.js', size: 6 * 1024 * 1024 }
    const result = vm.beforeUpload(bigFile)
    expect(result).toBe(false)
    expect(vm.$notify.warning).toHaveBeenCalledWith(expect.objectContaining({
      message: expect.stringContaining('不得超过')
    }))
  })

  it('rejects non-.js files', () => {
    const vm = createVm()
    vm.$notify = { warning: jest.fn() }
    const txtFile = { name: 'data.txt', size: 1024 }
    const result = vm.beforeUpload(txtFile)
    expect(result).toBe(false)
    expect(vm.$notify.warning).toHaveBeenCalledWith(expect.objectContaining({
      message: expect.stringContaining('js文件')
    }))
  })

  it('uploads valid .js file under 5MB', () => {
    const vm = createVm()
    vm.subFormData = { id: 'cfg1' }
    const validFile = { name: 'helper.js', size: 1024 }
    vm.beforeUpload(validFile)
    expect(api.upload).toHaveBeenCalled()
  })
})
```

### 5.9 importFile -- 文件导入

```javascript
describe('importFile', () => {
  it('parses JSON file and populates jobList and tableData', async () => {
    jest.useFakeTimers()
    const vm = createVm()
    vm.$refs = { impUpload: { clearFiles: jest.fn() } }
    
    const fileContent = JSON.stringify({
      jobList: [{ jobName: 'imported', inNode: { type: 'db', configValue: '{}' }, outNode: { type: 'db', configValue: '{}' }, transformNode: { type: 'js', configValue: '{}' } }],
      configValue: '[{"key":"p1","value":"v1"}]'
    })
    
    // Mock FileReader
    const mockReader = {
      readAsText: jest.fn(),
      result: fileContent,
      onload: null
    }
    global.FileReader = jest.fn(() => mockReader)
    
    vm.importFile({ raw: new Blob([fileContent]) })
    
    // Simulate onload callback
    mockReader.onload()
    
    expect(vm.jobList.length).toBe(1)
    expect(vm.jobList[0].jobName).toBe('imported')
    expect(vm.import_flag).toBe(false)
    
    jest.advanceTimersByTime(1000)
    expect(vm.$refs.impUpload.clearFiles).toHaveBeenCalled()
    jest.useRealTimers()
  })
})
```

### 5.10 getData -- 列表查询

```javascript
describe('getData', () => {
  it('calls getPage and populates resData on success', async () => {
    const vm = createVm()
    api.getPage.mockResolvedValueOnce({
      model: [{ id: '1', name: 'cfg1' }],
      currentPage: 1,
      pageSize: 10,
      totalCount: 1
    })
    
    vm.getData(vm.datas)
    await new Promise(r => setTimeout(r, 0))
    
    expect(api.getPage).toHaveBeenCalled()
    expect(vm.datas.resData.rows).toEqual([{ id: '1', name: 'cfg1' }])
    expect(vm.datas.table.loading).toBe(false)
  })
})
```

### 5.11 issue -- catch 分支

```javascript
describe('issue - API error', () => {
  it('closes loading on API rejection', async () => {
    api.issueType.mockRejectedValueOnce(new Error('network'))
    const closeFn = jest.fn()
    const vm = createVm()
    vm.$loading = jest.fn(() => ({ close: closeFn }))
    
    vm.issue('config1')
    await new Promise(r => setTimeout(r, 0))
    
    expect(closeFn).toHaveBeenCalled()
  })
})
```

### 5.12 getTaskLog 及日志分页

```javascript
describe('getTaskLog', () => {
  it('calls API and sets logList and totalCount', async () => {
    api.getTaskLog.mockResolvedValueOnce({ model: [{ message: 'log1' }], totalCount: 1 })
    const vm = createVm()
    vm.getTaskLog()
    await new Promise(r => setTimeout(r, 0))
    expect(vm.logList).toEqual([{ message: 'log1' }])
    expect(vm.log.totalCount).toBe(1)
  })
})

describe('handleSizeChange', () => {
  it('updates pageSize and calls getTaskLog', () => {
    const vm = createVm()
    vm.getTaskLog = jest.fn()
    vm.handleSizeChange(50)
    expect(vm.log.pageSize).toBe(50)
    expect(vm.getTaskLog).toHaveBeenCalled()
  })
})

describe('handleCurrentChange', () => {
  it('updates currentPage and calls getTaskLog', () => {
    const vm = createVm()
    vm.getTaskLog = jest.fn()
    vm.handleCurrentChange(3)
    expect(vm.log.currentPage).toBe(3)
    expect(vm.getTaskLog).toHaveBeenCalled()
  })
})
```

### 5.13 runAgain -- 补数弹窗入口

```javascript
describe('runAgain', () => {
  it('resets reRun, sets taskId/configId, and opens dialog', () => {
    const vm = createVm()
    vm.subFormData = { id: 'cfg1' }
    vm.runAgain({ row: { id: 'task1', jobName: 'Job A' } })
    expect(vm.reRun.taskId).toBe('task1')
    expect(vm.reRun.configId).toBe('cfg1')
    expect(vm.logList).toEqual([])
    expect(vm.foot_job_name).toBe('Job A')
    expect(vm.rerun_falg).toBe(true)
  })
})
```

### 5.14 batchSetParams -- 非空 jobList 的完整测试

```javascript
describe('batchSetParams with jobs', () => {
  it('builds batchTableData from unique input/output types', () => {
    const vm = createVm()
    vm.optionsInput = [
      { propkey: 'db', propvalue: '数据库查询' },
      { propkey: 'apiUp', propvalue: 'API上报' }
    ]
    vm.optionsOutput = [
      { propkey: 'dbWrite', propvalue: '数据库回写' }
    ]
    vm.jobList = [
      { inNode: { type: 'db' }, outNode: { type: 'dbWrite' } },
      { inNode: { type: 'db' }, outNode: { type: 'dbWrite' } },
      { inNode: { type: 'apiUp' }, outNode: { type: 'dbWrite' } }
    ]
    
    vm.batchSetParams()
    
    expect(vm.batch_falg).toBe(true)
    // db + apiUp for input, dbWrite for output = 3 rows
    expect(vm.batchTableData.length).toBe(3)
    expect(vm.batchTableData[0].sourceTypeName).toBe('数据库查询')
    expect(vm.batchTableData[1].sourceTypeName).toBe('API上报')
    expect(vm.batchTableData[2].sourceTypeName).toBe('数据库回写')
  })
})
```

### 5.15 Monaco init() 方法

```javascript
describe('AcMonaco - init()', () => {
  it('disposes existing editor before creating new one', () => {
    const disposeFn = jest.fn()
    const vm = createVm({ monacoEditor: { dispose: disposeFn } })
    // Stub monaco.editor.create
    monaco.editor.create.mockReturnValue(mockEditor)
    
    Component.methods.init.call(vm)
    
    expect(disposeFn).toHaveBeenCalled()
    expect(monaco.editor.create).toHaveBeenCalled()
  })

  it('creates editor with merged opts', () => {
    const vm = createVm({ monacoEditor: null })
    monaco.editor.create.mockReturnValue(mockEditor)
    
    Component.methods.init.call(vm)
    
    expect(monaco.editor.create).toHaveBeenCalledWith(
      vm.$refs.container,
      expect.objectContaining({ theme: 'vs-dark' })
    )
  })
})
```

---

## 6. 优先级排序总结

| 优先级 | 方法 | 原因 |
|--------|------|------|
| **P0** | `subForm`, `edit`, `getData` | 核心 CRUD 流程, 未被测试 |
| **P1** | `remove`, `modelShow`, `batchSetConfirm`, `importFile`, Monaco `init` | 关键业务操作 |
| **P2** | `beforeUpload`, `getTaskLog`, `logload`, `handleSizeChange`, `handleCurrentChange`, `runAgain`, `exceedFile` | 辅助功能 |
| **P3** | `goToDatasource`, `addByJson`, `handleUpload`, `handlePreview`, `clearValidate`, `logSearch`, `cellMouseEnter` | 简单/占位方法 |

**建议执行顺序**: 先补充 P0 方法测试(约 8 个用例), 再补充 P1 方法测试(约 10 个用例), 可将方法覆盖率从 64.9% 提升至 ~90%。同时对已有测试补充 catch/error 分支(约 8 个用例), 可显著提升分支覆盖率。

---

### Critical Files for Implementation

- /Users/paul/Documents/GitHub/md-bcp-1.0/md-bcp-admin-ui/tests/unit/views/integrationConfig/index.spec.js
- /Users/paul/Documents/GitHub/md-bcp-1.0/md-bcp-admin-ui/src/views/integrationConfig/index.vue
- /Users/paul/Documents/GitHub/md-bcp-1.0/md-bcp-admin-ui/tests/unit/views/integrationConfig/monaco.spec.js
- /Users/paul/Documents/GitHub/md-bcp-1.0/md-bcp-admin-ui/src/views/integrationConfig/moudel/monaco.vue
- /Users/paul/Documents/GitHub/md-bcp-1.0/md-bcp-admin-ui/docs/ide-integrationConfig-analysis.md