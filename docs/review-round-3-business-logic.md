# integrationConfig 测试套件评审 -- 第三轮: 业务逻辑完整性

> 评审日期: 2026-04-04  
> 评审视角: 业务逻辑专家  
> 测试文件: `tests/unit/views/integrationConfig/index.spec.js` (59 用例)  
> 源码文件: `src/views/integrationConfig/index.vue` (1815 行, 60+ 方法)  
> 参考文档: `docs/ide-integrationConfig-analysis.md`

---

## 1. 业务场景覆盖评分: 5.5 / 10

### 评分依据

| 维度 | 得分 | 满分 | 说明 |
|------|------|------|------|
| 方法级覆盖率 | 3.0 | 4.0 | 59 用例覆盖了约 30 个方法 (占全部 40+ 个 methods 的 ~70%), 但核心 CRUD 方法 `edit`/`subForm`/`remove`/`getData` 全部缺失 |
| 核心用户流程 | 0.5 | 2.5 | 新增/编辑/保存/下发的端到端流程完全未测试; 仅测试了流程中的个别子步骤 (如 addJob, affirmInNode 等) |
| 业务规则验证 | 1.5 | 2.0 | pathMap 唯一性有基本测试; scriptNotNull 有基本测试; 但表单验证规则的条件触发逻辑未测试 |
| 边界与异常 | 0.5 | 1.5 | 仅有 2 个边界条件用例 (enableAll 空列表, batchSetParams 空列表); 缺少 API 失败处理、JSON 解析异常、定时器泄漏等关键边界 |

### 核心发现

**已覆盖的优势区域:**
- 工具方法 (formatContent, _assignSortIds, jobRowClassName) -- 覆盖良好
- 任务列表 CRUD (addJob, addJobJson, deljobList, copyJob, copyJobJson, enableAll, moveUp/moveDown) -- 覆盖完整
- 节点配置打开/确认 (changeOptionsInput/Transform/Output, affirmInNode/Transform/OutNode) -- 有基本覆盖
- 下发与补数 (issue, runTask, pollTaskLog, clearLogPoll) -- 有基本覆盖

**根本性缺陷:**
- 测试套件采用了"方法抽取直接调用"策略 (不做组件挂载), 这意味着完全无法验证模板层的 `v-if` 条件渲染、事件绑定、表单验证规则触发等 UI 驱动的业务逻辑
- 四个最关键的 CRUD 方法 (`edit`, `subForm`, `remove`, `getData`) 完全没有被测试, 这些方法承载了配置的新增、编辑加载、保存提交、列表刷新等核心流程

---

## 2. 遗漏的关键业务场景

### 2.1 新增完整链路: edit(0) --> 模板选择 --> 添加任务 --> 配置节点 --> 保存 --> 下发

**当前状态:** 完全未测试

`edit(0)` 方法 (源码 L1665-L1692) 是新增入口, 它执行以下关键业务逻辑:
- 重置所有表单数据 (`subFormData`, `tableData`, `jobList`, 三个节点对象)
- 设置默认模板为"自定义" (`templateId=0, templateName='自定义'`)
- 设置默认租户为当前用户 (`cur_user.tenantId`)
- 清除上传文件列表
- 打开编辑弹窗
- 初始化拖拽排序

**遗漏的测试点:**
- edit(0) 是否正确重置了所有 subFormData 字段为 null
- edit(0) 是否将 jobList 和 tableData 清空
- edit(0) 是否设置了默认 templateId=0 和 templateName='自定义'
- edit(0) 是否将 tenantId 设置为 cur_user.tenantId 的字符串形式

### 2.2 编辑完整链路: edit(row) --> 加载配置 --> 解析 JSON --> 修改 --> 保存

**当前状态:** 完全未测试

`edit(row)` 方法 (源码 L1694-L1723) 负责:
- 调用 `api.getIdRow(row.id)` 获取配置详情
- 解析 `res.model` (JSON 字符串) 为结构化对象
- 填充 jobList, tableData (从 configValue JSON 解析)
- 重建 pathMap (遍历所有 apiUp 类型的 inNode)
- 加载 pluginsList 到 fileList 和 fileMap
- 解构赋值 subFormData

**遗漏的测试点:**
- getIdRow 返回的 JSON 字符串能否正确解析并填充所有字段
- configValue (参数表) 的 JSON.parse 是否正确
- pathMap 在编辑加载时是否正确重建
- pluginsList 是否正确映射到 fileList 和 fileMap
- tenantId 是否被转换为字符串 (源码 `data.tenantId + ''`)

### 2.3 保存流程: subForm(formData)

**当前状态:** 完全未测试

`subForm` (源码 L1608-L1657) 是核心保存方法, 包含:
- 构建提交对象: `{...subFormData, jobList, configValue: tableData, pluginsList}`
- 从上传组件构建 pluginsList (避免残留重复)
- 表单验证 (`$refs[formData].validate`)
- 调用 `api.submitForm(obj)` 提交
- 成功后: 更新 `subFormData.id`, 刷新列表, 回读 jobList 重建 pathMap
- 失败时: 仅 console.error, 无用户提示 (已知问题 B3)

**遗漏的测试点:**
- 提交对象的结构是否正确 (特别是 configValue 是 tableData 数组而非 JSON 字符串)
- pluginsList 是否从 uploadFiles 正确构建
- 保存成功后是否回读并重建 pathMap
- 表单验证失败时是否阻止提交

### 2.4 删除流程: remove(row)

**当前状态:** 完全未测试

`remove` (源码 L1554-L1569) 负责:
- 确认弹窗
- 调用 `api.singleDelete(row.id)`
- 成功后刷新列表

### 2.5 列表查询: getData(datas)

**当前状态:** 完全未测试

`getData` (源码 L1725-L1737) 负责:
- 设置 loading 状态
- 调用 `api.getPage` 获取分页数据
- 填充 resData (rows, currentPage, pageSize, totalCount)
- 注意: 缺少 `.catch` 重置 loading (已知问题 B2)

### 2.6 导入文件: importFile(event)

**当前状态:** 完全未测试

`importFile` (源码 L1447-L1468) 负责:
- 通过 FileReader 读取上传的 JSON 文件
- 解析 JSON 获取 jobList 和 configValue
- 替换当前 jobList 和 tableData
- 分配排序 ID

**遗漏的测试点:**
- 正常 JSON 文件的导入是否正确替换 jobList
- configValue 为 null 时 tableData 是否默认为空数组
- 导入后是否正确分配 __sortId

### 2.7 批量设置数据源: batchSetParams() + batchSetConfirm()

**当前状态:** batchSetParams 仅测试了空 jobList 的边界条件; batchSetConfirm 完全未测试

`batchSetParams` (源码 L1396-L1427) 核心逻辑:
- 收集所有任务的输入/输出节点类型 (使用 Set 去重)
- 构建 batchTableData 映射表 (类型 --> 数据源)

`batchSetConfirm` (源码 L1429-L1445) 核心逻辑:
- 遍历所有任务, 根据 batchTableData 更新每个任务的输入/输出节点 configValue 中的 dataSource
- 需要 JSON.parse 和 JSON.stringify 往返转换

**遗漏的测试点:**
- batchSetParams 在有任务时是否正确收集类型并构建映射表
- batchSetConfirm 是否正确更新所有任务节点的 dataSource
- 批量设置后 configValue 的 JSON 完整性

### 2.8 模板加载: modelShow()

**当前状态:** 仅测试了 templateData 事件分发; modelShow 完全未测试

`modelShow` (源码 L1521-L1551) 是模板选择确认后的核心方法:
- 设置 templateName 和 templateId
- 调用 `api.getTemplateContent` 加载模板内容
- 替换 jobList 和 tableData
- 重建 pathMap
- 加载 pluginsList

### 2.9 文件上传: beforeUpload / exceedFile / handlePreview

**当前状态:** 完全未测试

`beforeUpload` (源码 L1580-L1603) 包含:
- 文件后缀校验 (仅允许 .js)
- 文件大小校验 (>5MB 拒绝, 但提示文字写的是 "2M" -- 已知问题 B5)
- 通过后调用 api.upload 上传

### 2.10 日志相关: logSearch / getTaskLog / logload / handleSizeChange / handleCurrentChange

**当前状态:** logSearch 未测试; getTaskLog / logload / 分页方法均未测试

`logSearch` (源码 L1038-L1047) 当前是 `alert('建设中...')`, 但注释中有完整的日志查询初始化逻辑.

`runAgain` (源码 L1029-L1036) 补数弹窗入口, 未测试.

---

## 3. 业务规则测试缺失

### 3.1 API 上报路径唯一性 (pathMap) 的完整性测试

**当前覆盖:** affirmInNode 中有一个用例测试了 "path 已被其他 node 占用" 的场景.

**缺失的关键场景:**

| 场景 | 说明 | 预期行为 |
|------|------|---------|
| 同一节点更新自己的 path | nodeId 匹配, 应允许保存 | pathMap 更新, 保存成功 |
| 新节点 (id 为空) 使用新路径 | pathMap 中不存在该 path | 使用 -99 作为占位 nodeId, 保存成功 |
| 编辑加载时 pathMap 重建 | edit(row) 中遍历 apiUp 节点 | pathMap 应包含所有 apiUp 节点的 path-->nodeId 映射 |
| 模板加载后 pathMap 重建 | modelShow 中清除并重建 | pathMap.clear() 后重新收集 |
| 保存成功后 pathMap 重建 | subForm 中 getIdRow 回读 | pathMap 使用服务端返回的真实 nodeId 替换 -99 |
| 多个任务使用不同 path | 互不冲突 | 全部保存成功 |
| 非 apiUp 类型的节点 | 不参与 pathMap 校验 | 不触发路径唯一性检查 |

### 3.2 不同输入节点类型的动态表单验证

源码中输入节点配置弹窗通过 `v-if="ShowInput_title!='API上报'"` 等条件控制字段显隐. 虽然验证规则是静态定义的, 但 Element UI 的 `v-if` 会使对应的表单项不参与验证.

**缺失的关键场景:**

| 输入类型 | 必填字段 | 隐藏字段 | 说明 |
|---------|---------|---------|------|
| 数据库查询 (db/dbQuery) | cron, dataSource, IncrementalField, scriptContent | protocol, authFlag, path | 最常用类型 |
| API 上报 (apiUp) | dataSource, path, protocol, authFlag, scriptContent | cron, IncrementalField | cron 隐藏但规则仍定义, 需确认不触发 |
| API 查询 (apiQuery) | cron, dataSource, path, scriptContent | IncrementalField, protocol, authFlag | -- |
| 自定义脚本 (jsScript) | scriptContent | cron(?), dataSource, IncrementalField, path | dataSource 隐藏 |

当前测试完全没有区分输入节点类型, 仅在 affirmInNode 中测试了 apiUp 的 path 唯一性.

### 3.3 admin 用户 vs 普通用户的权限差异

**当前覆盖:** createVm 默认设置 `cur_user.userType='admin'`, 没有任何非 admin 用户的测试.

**缺失的关键场景:**

| 场景 | admin | 非 admin | 当前测试 |
|------|-------|---------|---------|
| 客户选择字段可见性 | `v-if="cur_user.userType=='admin'"` 显示 | 隐藏 | 无 |
| tenantId 验证规则 | subFormDataRule.tenantId 生效 | 规则存在但字段不可见, 实际不触发 | 无 |
| 新增时 tenantId 默认值 | 取 cur_user.tenantId | 取 cur_user.tenantId (相同逻辑) | 无 |
| 数据源列表过滤 | initOptions 中按 tenantId 过滤 | 同上 | 仅验证了 API 被调用, 未验证参数 |

### 3.4 脚本非空校验的完整路径

**当前覆盖:** scriptNotNull 方法本身有 2 个用例; affirmInNode 有 1 个脚本为空的用例.

**缺失的关键场景:**

| 场景 | 说明 | 当前测试 |
|------|------|---------|
| affirmTransformNode 脚本为空 | MonAcoTransformNode.getVal() 返回空字符串 | 无 |
| affirmOutNode 脚本为空 | outMonAco.getVal() 返回空字符串 | 无 |
| scriptContent 为 null | scriptNotNull 检查 `=== ''`, null 不等于 '' | 无 (这可能是一个 bug: null 会通过校验) |
| scriptContent 为 undefined | 同上 | 无 |
| scriptContent 为纯空白 | `'   '` 不等于 `''`, 会通过校验 | 无 (潜在 bug) |

### 3.5 configValue 的 JSON 解析防御

**缺失的关键场景:**

| 场景 | 触发位置 | 预期行为 | 当前测试 |
|------|---------|---------|---------|
| configValue 为 null | changeOptionsInput 中 `JSON.parse(data.row.inNode.configValue)` | 应抛出异常或使用默认值 | 无 |
| configValue 为空字符串 | 同上 | JSON.parse('') 会抛异常 | 无 |
| configValue 为非法 JSON | 同上 | JSON.parse 抛异常 | 无 |
| configValue 为 `'{}'` | 正常空对象 | 应正常解析 | 有 (隐式覆盖) |

---

## 4. 数据完整性测试缺失

### 4.1 jobList <--> JSON 序列化/反序列化的往返一致性

这是 BCP 集成配置的核心数据流: 前端 jobList 对象 --> JSON.stringify --> API 提交 --> 服务端存储 --> API 读取 --> JSON.parse --> 前端 jobList 对象. 当前测试完全没有验证这个往返过程的一致性.

**缺失的测试点:**
- affirmInNode 将 inNode 序列化到 `jobList[i].inNode.configValue`, 再次 changeOptionsInput 时能否正确反序列化
- 含特殊字符 (引号、换行、中文) 的 scriptContent 序列化后是否完整
- 嵌套 JSON 值 (参数值本身是 JSON 字符串) 的双重序列化处理

### 4.2 configValue 解析异常处理

`edit(row)` 方法中 `this.tableData = JSON.parse(data.configValue)` -- 如果服务端返回的 configValue 不是合法的 JSON 数组, 这里会抛出异常导致编辑功能完全崩溃. 当前无任何异常处理测试.

**缺失的测试点:**
- configValue 为 `null` 时是否有兜底处理
- configValue 为 `"null"` (字符串) 时的行为
- configValue 为 `"[]"` 时是否返回空数组
- configValue 不是数组类型的 JSON 时的行为

### 4.3 模板加载后数据覆盖行为

`modelShow()` 中调用 `api.getTemplateContent` 后:
- 直接覆盖 `this.jobList = res.jobList` -- 用户之前手动添加的任务会丢失
- `this.tableData = res.configValue != null ? JSON.parse(res.configValue) : []` -- 需测试 null 分支

**缺失的测试点:**
- 模板加载是否完全替换而非合并 jobList
- 模板内容中 configValue 为 null 时 tableData 是否为空数组
- 模板加载后 pathMap 是否正确清除并重建
- 模板加载后 fileList/fileMap 是否正确重置

### 4.4 参数表保存格式

`subForm` 中 `obj.configValue = this.tableData` -- 直接将 tableData 数组赋值为 configValue. tableData 中的 `__sortId` 字段会一起被提交到服务端.

**缺失的测试点:**
- 提交时 configValue 是否包含 `__sortId` (是否应该在提交前剥离)
- tableData 中 key/value 为空字符串的行是否应该被过滤
- 参数表的顺序是否与用户拖拽后的顺序一致

### 4.5 补数参数传递完整性

`runTask` 调用 `api.runTask(this.reRun)`, 但 `runAgain` 中仅设置了 `taskId` 和 `configId`, 而 `runTime` 和 `runParams` 依赖用户在弹窗中输入.

**缺失的测试点:**
- runTask 提交时 reRun 对象是否包含完整的 taskId, configId, runTime, runParams
- runTime 为空时 API 调用行为
- runParams 为空时 API 调用行为

---

## 5. 具体补充建议

### P0 -- 核心 CRUD 流程 (建议新增 15 个用例)

| 编号 | 方法 | 场景描述 | 预期行为 |
|------|------|---------|---------|
| C01 | edit(0) | 新增模式: 调用 edit(0) | subFormData 所有字段重置为 null; jobList 和 tableData 清空; templateId=0, templateName='自定义'; tenantId=cur_user.tenantId 的字符串形式; dialogFormVisible=true |
| C02 | edit(row) | 编辑模式: 调用 edit({id:'123'}) 并 mock getIdRow 返回完整 JSON | subFormData 正确填充; jobList 从 data.jobList 加载; tableData 从 JSON.parse(data.configValue) 加载; pathMap 正确重建 |
| C03 | edit(row) | 编辑模式: 配置包含 pluginsList | fileList 和 fileMap 正确填充 |
| C04 | edit(row) | 编辑模式: configValue 为 null | tableData 应兜底为空数组或不抛异常 |
| C05 | subForm | 保存成功: mock submitForm 返回 {model: 'new-id'} | subFormData.id 更新为 'new-id'; api.getIdRow 被调用以回读; pathMap 重建 |
| C06 | subForm | 保存时表单验证失败 | api.submitForm 不被调用 |
| C07 | subForm | 保存成功后回读 getIdRow 失败 | 不影响保存结果, 仅 console.error |
| C08 | subForm | 提交对象结构验证 | obj 包含 subFormData 展开字段 + jobList + configValue(=tableData) + pluginsList |
| C09 | remove | 删除确认后 | api.singleDelete 被调用, 成功后 getData 被调用刷新列表 |
| C10 | remove | 删除取消 | api.singleDelete 不被调用 |
| C11 | getData | 正常查询 | api.getPage 被调用, 返回数据填充 datas.resData, loading 从 true 变为 false |
| C12 | getData | API 异常 | loading 应该被重置为 false (当前代码缺少 .catch, 验证此 bug) |
| C13 | modelShow | 模板加载成功 | jobList/tableData 被模板内容替换; pathMap 清除并重建; ShowMoule=false |
| C14 | modelShow | 模板 configValue 为 null | tableData 应为空数组 |
| C15 | modelShow | 模板包含 pluginsList | fileList/fileMap 正确填充 |

### P0 -- pathMap 完整性 (建议新增 5 个用例)

| 编号 | 场景描述 | 预期行为 |
|------|---------|---------|
| P01 | affirmInNode: apiUp 类型, 同一节点更新自己的 path (nodeId 匹配) | 保存成功, pathMap 更新 |
| P02 | affirmInNode: apiUp 类型, 新节点使用未注册的 path | pathMap 新增条目, nodeId 为 -99 |
| P03 | edit(row) 加载含 3 个 apiUp 任务的配置 | pathMap 包含 3 个条目 |
| P04 | subForm 保存成功后回读 | pathMap 使用服务端返回的真实 nodeId 替换 -99 |
| P05 | affirmInNode: 非 apiUp 类型 | 不触发 pathMap 校验, 直接保存 |

### P1 -- 批量设置完整流程 (建议新增 4 个用例)

| 编号 | 场景描述 | 预期行为 |
|------|---------|---------|
| B01 | batchSetParams: jobList 有 2 个任务, 输入类型分别为 db 和 apiUp | batchTableData 包含 2 条输入节点记录 + 对应的输出节点记录 |
| B02 | batchSetConfirm: 设置数据源后确认 | 所有匹配类型的任务节点 configValue 中 dataSource 被更新 |
| B03 | batchSetConfirm: configValue 的 JSON 往返一致性 | 解析 -> 修改 dataSource -> 重新序列化后, 其他字段 (cron, scriptContent 等) 不丢失 |
| B04 | batchSetParams: 多个任务使用相同输入类型 | Set 去重后 batchTableData 只有一条该类型记录 |

### P1 -- 文件导入 (建议新增 3 个用例)

| 编号 | 场景描述 | 预期行为 |
|------|---------|---------|
| I01 | importFile: 导入包含 jobList 和 configValue 的合法 JSON | jobList 和 tableData 被替换; _assignSortIds 被调用 |
| I02 | importFile: configValue 为 null | tableData 设为空数组 |
| I03 | importFile: JSON 格式错误 | 应有异常处理 (当前代码无 try-catch, 验证此 bug) |

### P1 -- 文件上传 (建议新增 4 个用例)

| 编号 | 场景描述 | 预期行为 |
|------|---------|---------|
| U01 | beforeUpload: .js 文件, < 5MB | 调用 api.upload, fileMap 更新 |
| U02 | beforeUpload: .txt 文件 | 返回 false, 提示"只能上传js文件" |
| U03 | beforeUpload: .js 文件, > 5MB | 返回 false, 提示"文件大小不得超过2M" (注意: 这里提示文字与实际校验不一致, 验证 bug B5) |
| U04 | exceedFile: 超过 5 个文件 | 显示警告通知 |

### P2 -- 用户类型差异 (建议新增 3 个用例)

| 编号 | 场景描述 | 预期行为 |
|------|---------|---------|
| A01 | edit(0) -- admin 用户 | tenantId 字段存在于 subFormData 中, 取 cur_user.tenantId |
| A02 | initOptions -- 非 admin 用户 | bcpDatasourceName 按当前用户的 tenantId 过滤 (验证 getFreelist 的 params 参数) |
| A03 | subForm -- 非 admin 用户 | tenantId 自动取 cur_user.tenantId, 不需要用户选择 |

### P2 -- 脚本校验边界 (建议新增 4 个用例)

| 编号 | 场景描述 | 预期行为 |
|------|---------|---------|
| S01 | scriptNotNull: scriptContent 为 null | 当前返回 true (null !== ''), 验证此潜在 bug |
| S02 | scriptNotNull: scriptContent 为 undefined | 当前返回 true, 验证此潜在 bug |
| S03 | scriptNotNull: scriptContent 为纯空白字符串 | 当前返回 true, 验证此潜在 bug |
| S04 | affirmTransformNode: 脚本为空 | 应返回 false 并提示错误, transformNode.configValue 不更新 |

### P2 -- 日志与补数 (建议新增 5 个用例)

| 编号 | 场景描述 | 预期行为 |
|------|---------|---------|
| L01 | runAgain: 打开补数弹窗 | reRun.taskId 和 configId 正确设置; logList 清空; rerun_falg=true |
| L02 | runTask: API 失败 | logLoading 关闭; 显示"补数请求失败"错误提示 |
| L03 | pollTaskLog: 达到最大重试次数 (5次) 且日志仍为空 | logLoading 关闭, 不再重试 |
| L04 | pollTaskLog: API 异常 + 重试 | 异常时也应根据 retryCount 决定是否重试 |
| L05 | getTaskLog: 正常日志查询 | api.getTaskLog 被调用; logList 和 totalCount 更新 |

### P3 -- 分页与日志查询 (建议新增 3 个用例)

| 编号 | 场景描述 | 预期行为 |
|------|---------|---------|
| G01 | handleSizeChange(50) | log.pageSize=50; getTaskLog 被调用 |
| G02 | handleCurrentChange(3) | log.currentPage=3; getTaskLog 被调用 |
| G03 | logSearch | 当前调用 alert('建设中...'), 验证该行为 |

---

## 6. 总结

### 6.1 当前测试套件的价值

现有的 59 个用例在方法级别提供了合理的覆盖, 特别是对工具方法、任务列表管理、节点配置确认等"叶子"方法. 测试策略 (直接调用方法, 使用 fake `this`) 在无法 shallowMount 的约束下是务实的选择.

### 6.2 关键差距

最大的差距在于 **四个核心 CRUD 方法完全未测试**: `edit`, `subForm`, `remove`, `getData`. 这四个方法合计约 180 行代码, 承载了集成配置页面最关键的业务逻辑:

1. `edit` -- 新增/编辑入口, 数据加载与初始化
2. `subForm` -- 保存提交, 数据组装与回读
3. `remove` -- 删除确认与刷新
4. `getData` -- 列表查询与分页

其次, `modelShow` (模板加载)、`batchSetConfirm` (批量设置确认)、`importFile` (文件导入) 这三个具有复杂数据转换逻辑的方法也完全未测试.

### 6.3 建议的优先级排序

| 优先级 | 补充用例数 | 覆盖目标 |
|--------|----------|---------|
| P0 | ~20 | edit/subForm/remove/getData + pathMap 完整性 |
| P1 | ~11 | batchSetConfirm/importFile/beforeUpload + 完整流程 |
| P2 | ~12 | 用户权限差异 + 脚本校验边界 + 日志补数异常 |
| P3 | ~3 | 分页 + 日志查询占位 |
| **合计** | **~46** | 配合现有 59 用例, 达到 ~105 用例 |

补充这些用例后, 预计业务场景覆盖评分可从 **5.5/10 提升至 8.5/10**.
