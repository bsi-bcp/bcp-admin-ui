# BCP IDE 集成配置页面优化方案

> 日期: 2026-04-03
> 状态: 待实施

## 需求汇总

### 已完成

- [x] **F01** 集成列表：导出/导出it/导出ot 折叠到"更多"下拉菜单
- [x] **F02** 集成列表：名称列加宽、状态列缩窄、客户列支持排序
- [x] **F03** SQL 白名单：添加 fw_tenant、md_integration_datasource、md_integration_example_data
- [x] **F04** 任务列表：隐藏转换节点"脚本转换"下拉框，只保留"配置"按钮
- [x] **F05** 任务列表：名称列加宽至 280px
- [x] **F06** 参数表格：拖拽排序（sortablejs 已安装）
- [x] **F07** 任务列表：拖拽排序替代上/下箭头

### 已完成（2026-04-02 ~ 2026-04-04）

- [x] **F08** 任务列表：名称前增加行号列（不可编辑，自动递增）
- [x] **F09** 任务列表：表头上方增加任务统计（总数 / 启用数 / 禁用数）
- [x] **F10** 任务列表：禁用任务整行增加淡灰色背景
- [x] **F11** 编辑对话框：顶部表单每行放两个字段（集成名称+客户、模板选择+集成节点）
- [x] **F12** 输入节点对话框：定时设置+数据源合并为一行，脚本区域放大
- [x] **F13** 输出节点对话框：同 F12，数据源+访问路径合并为一行
- [x] **F14** Cron 表达式：替换为友好的可视化 Cron 控件（vcrontab 组件 + 输入框旁触发按钮）
- [x] **F15** Monaco 编辑器：增加"格式化"按钮
- [x] **F16** Monaco 编辑器：增加"复制代码"按钮（与格式化放一起）
- [x] **F17** 参数表格：参数名称旁增加"获取参数"按钮，点击复制 `context.getParams().get("参数名")` 到剪贴板
- [x] **F18** 输入/输出节点对话框：数据源下拉框旁增加"管理数据源"链接，点击跳转到数据源配置编辑页面
- [x] **F19** 参数表格：删除参数时增加确认提示（"是否删除该参数？"）
- [x] **F20** 参数表格：表头"参数数据"改为"参数值"

### Bug

- [x] **B01** 数据源下拉框显示 ID 而非名称（admin 登录时）— 前端 `+ ''` 类型转换修复
- [ ] **B02** 404 错误：`/services/fwcore/datasource/fields/{id}` 后端未实现

---

## 详细方案

### F08 任务列表行号

**文件**: `index.vue` 任务列表 `<el-table>`

**方案**: 在名称列前添加 `type="index"` 列

```html
<el-table-column type="index" label="#" width="50" align="center" />
```

**复杂度**: 低

---

### F09 任务统计

**文件**: `index.vue` 任务列表表头上方

**方案**: 在"任务列表"标题旁显示统计信息

```html
<span class="task-stats">
  总数: {{ jobList.length }} | 
  启用: {{ jobList.filter(j => j.enable === 'true').length }} | 
  禁用: {{ jobList.filter(j => j.enable === 'false').length }}
</span>
```

**复杂度**: 低

---

### F10 禁用任务灰色背景

**文件**: `index.vue` 任务列表 `<el-table>`

**方案**: 使用 `:row-class-name` 属性

```html
<el-table :row-class-name="jobRowClassName" ...>
```

```javascript
jobRowClassName({ row }) {
  return row.enable === 'false' ? 'job-disabled-row' : ''
}
```

```scss
.job-disabled-row {
  background-color: #f5f5f5 !important;
  opacity: 0.6;
}
```

**复杂度**: 低

---

### F11 编辑对话框两列布局

**文件**: `index.vue` 第 27-59 行

**当前**: 每个 el-form-item 独占一行，每个输入框宽 400px，对话框宽 1120px

**方案**: 用 `el-row` + `el-col` 将表单字段排成两列

```html
<el-row :gutter="20">
  <el-col :span="12">
    <el-form-item label="集成名称" prop="name">...</el-form-item>
  </el-col>
  <el-col :span="12">
    <el-form-item label="客户" prop="tenantId">...</el-form-item>
  </el-col>
</el-row>
<el-row :gutter="20">
  <el-col :span="12">
    <el-form-item label="模板选择" prop="templateId">...</el-form-item>
  </el-col>
  <el-col :span="12">
    <el-form-item label="集成节点" prop="nodeId">...</el-form-item>
  </el-col>
</el-row>
```

**注意**: `.baseinfo` 宽度需要从 400px 改为 100%，让输入框自适应列宽

**复杂度**: 低

---

### F12 输入节点对话框布局优化

**文件**: `index.vue` 第 286-335 行

**当前**: 定时设置、数据源、访问路径各占一行，脚本区域默认 300px 高

**方案**:

```html
<el-row :gutter="20">
  <el-col :span="12">
    <el-form-item label="定时设置" prop="cron">
      <!-- cron 控件，见 F14 -->
    </el-form-item>
  </el-col>
  <el-col :span="12">
    <el-form-item label="数据源" prop="dataSource">
      <el-select ...>...</el-select>
    </el-form-item>
  </el-col>
</el-row>
<el-form-item label="访问路径" prop="path">...</el-form-item>
<el-form-item label="脚本" required>
  <MonAco ref="MonAco" :fields="currentFields" :height="450" />
</el-form-item>
```

**复杂度**: 中（需考虑不同输入类型条件显示）

---

### F13 输出节点对话框布局优化

**文件**: `index.vue` 第 354-381 行

**方案**: 与 F12 类似，数据源+访问路径合并一行

```html
<el-row :gutter="20">
  <el-col :span="12">
    <el-form-item label="数据源" prop="dataSource">...</el-form-item>
  </el-col>
  <el-col :span="12">
    <el-form-item label="访问路径" prop="path">...</el-form-item>
  </el-col>
</el-row>
<el-form-item label="脚本" required>
  <MonAco ref="outMonAco" :fields="currentFields" :height="450" />
</el-form-item>
```

**复杂度**: 低

---

### F14 Cron 可视化控件

**文件**: `index.vue` 输入节点对话框 cron 字段、新增 cron 组件

**当前**: 纯文本输入框 `<el-input v-model="inNode.cron" />`

**方案选型**:

| 方案 | 库 | 大小 | Vue 2 兼容 | 中文 |
|------|-----|------|-----------|------|
| A | vue-cron（推荐） | ~15KB | 是 | 是 |
| B | 自研弹窗选择器 | — | — | 完全可控 |
| C | cron-parser + 手写 UI | ~8KB | — | 可控 |

**推荐方案 A**: 使用 `vcrontab` 或类似 Vue 2 cron 组件，提供可视化的秒/分/时/日/月/周选择面板，用户可在图形界面和文本之间切换。

**交互设计**:
- 输入框旁增加"设置"图标按钮
- 点击弹出 Cron 可视化面板
- 面板内选择后自动填入文本框
- 保留手动输入能力

**复杂度**: 中

---

### F15 Monaco 格式化按钮

**文件**: `moudel/monaco.vue`

**当前**: 编辑器工具栏只有全屏/缩小按钮

**方案**: Monaco Editor 内置格式化 API

```javascript
formatCode() {
  if (this.monacoEditor) {
    this.monacoEditor.getAction('editor.action.formatDocument').run()
  }
}
```

**UI**: 在全屏按钮旁添加格式化图标

```html
<div>
  <i class="el-icon-magic-stick" title="格式化代码" @click="formatCode" />
  <i class="el-icon-document-copy" title="复制代码" @click="copyCode" />
  <i v-if="isMaximum" class="el-icon-rank" title="点击缩小" @click="minEditor" />
  <i v-else class="el-icon-full-screen" title="点击放大" @click="maxEditor" />
</div>
```

**注意**: Nashorn ES5 的 JavaScript 格式化依赖 Monaco 内置的 JS formatter，需确认 `monaco-editor-webpack-plugin` 已加载 `format` feature。

**复杂度**: 低

---

### F16 Monaco 复制代码按钮

**文件**: `moudel/monaco.vue`

**方案**: 与 F15 放在同一工具栏

```javascript
copyCode() {
  const code = this.monacoEditor.getValue()
  navigator.clipboard.writeText(code).then(() => {
    this.$message.success('已复制')
  })
}
```

**复杂度**: 低

---

### F17 参数名称旁增加"获取参数"按钮

**文件**: `index.vue` 参数表格（第 71-76 行）

**需求**: 每个参数名称后增加一个小按钮，点击后将该参数的 JS 获取代码复制到剪贴板。

**复制内容**: `context.getParams().get("参数名称")`

**方案**: 在参数名称列的 template 中添加复制按钮

```html
<el-table-column label="参数名称" align="center" width="350">
  <template slot-scope="scope">
    <el-input v-model="scope.row.key" style="width: calc(100% - 30px)" />
    <el-tooltip content="复制获取参数代码" placement="top">
      <i class="el-icon-document-copy" style="cursor:pointer;margin-left:5px;color:#409EFF"
         @click="copyParamCode(scope.row.key)" />
    </el-tooltip>
  </template>
</el-table-column>
```

```javascript
copyParamCode(key) {
  const code = `context.getParams().get("${key}")`
  navigator.clipboard.writeText(code).then(() => {
    this.$message.success('已复制: ' + code)
  })
}
```

**复杂度**: 低

---

### F18 数据源旁增加"管理数据源"入口

**文件**: `index.vue` 输入节点对话框（第 296-302 行）、输出节点对话框（第 360-365 行）

**需求**: 在数据源下拉框旁增加"管理数据源"链接/按钮，点击后跳转到数据源管理页面（左侧菜单"数据源管理"）

**方案**: 在 el-select 后添加链接按钮

```html
<el-form-item prop="dataSource" label="数据源">
  <el-select v-model="inNode.dataSource" placeholder="请选择" class="baseinfo">
    <el-option .../>
  </el-select>
  <el-button type="text" size="mini" @click="goToDatasource">管理数据源</el-button>
</el-form-item>
```

```javascript
goToDatasource() {
  const routeData = this.$router.resolve({ path: '/config-center/datasourceManagement' })
  window.open(routeData.href, '_blank')
}
```

**说明**: 用新标签页打开数据源管理，避免丢失当前编辑中的配置。需确认数据源管理的路由路径。

**复杂度**: 低

---

### B01 数据源显示 ID 而非名称

**文件**: `index.vue` 第 298-300 行、362-364 行

**根因分析**:

`bcpDatasourceName` 通过 freelist 接口加载，返回格式为 `{ "351": "数据源A", "352": "数据源B" }`（Map 结构，key=ID, value=名称）。

模板代码:
```html
<el-option v-for="(optItem,optindex) in bcpDatasourceName" 
           :label="optItem" :value="optindex" />
```

- `optItem` = 名称（正确显示为 label）
- `optindex` = ID（作为 value 绑定）

**问题**: 当 `inNode.dataSource` 的值类型与 `optindex` 不匹配时（如数字 `351` vs 字符串 `"351"`），el-select 找不到匹配的 option，直接显示原始值。

**修复方案**: 确保类型一致

```html
<el-option v-for="(optItem,optindex) in bcpDatasourceName" 
           :label="optItem" :value="optindex + ''" />
```

或在赋值时转为字符串:
```javascript
inNode.dataSource = String(configValue.dataSource)
```

**需验证**: 检查 admin 登录时 freelist 的 params 参数（tenantId）对返回数据的影响。admin 的 tenantId 可能为 0 或空，导致返回全量数据源列表，ID 格式可能不同。

**复杂度**: 低

---

### B02 datasource/fields 404

**根因**: 前端 `getDatasourceFields(datasourceId)` 调用 `GET /services/fwcore/datasource/fields/{id}`，后端无此端点。

**影响**: Monaco 代码提示中 `obj.` 的字段补全无法工作（降级为空列表，不影响基本编辑功能）。

**方案**: 需要在后端 `MdIntegrationDatasourceController` 新增端点，连接数据源获取表字段 metadata。涉及多种数据源类型（JDBC/API/SAP），改动较大。

**建议**: 作为独立任务单独规划，优先级较低。

**复杂度**: 高

---

## 实施优先级建议

### P0 - 快速修复（预计 30 分钟）
- B01 数据源显示 ID
- F08 任务行号
- F09 任务统计
- F10 禁用任务灰色

### P1 - 布局优化（预计 1 小时）
- F11 编辑对话框两列
- F12 输入节点对话框布局
- F13 输出节点对话框布局

### P2 - 编辑器增强（预计 30 分钟）
- F15 代码格式化
- F16 代码复制

### P3 - 需要引入新依赖（预计 2 小时）
- F14 Cron 可视化控件

### P4 - 后端开发（单独规划）
- B02 datasource/fields API

---

## 涉及文件

| 文件 | 改动项 |
|------|--------|
| `src/views/integrationConfig/index.vue` | F08-F14, B01 |
| `src/views/integrationConfig/moudel/monaco.vue` | F15, F16 |
| `src/styles/monaco.scss` | F15, F16 工具栏样式 |
| `package.json` | F14（cron 组件依赖） |
| `vue.config.js` | F15（确认 monaco format feature） |
