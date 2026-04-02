# Monaco Editor 自动补全（IntelliSense）问题分析与优化方案

> 日期：2026-04-02 | 状态：已分析，待实施

## 问题描述

integrationConfig 视图的任务管线中，输入节点/转换节点/输出节点的配置按钮点击后打开 JS 脚本编辑器（Monaco Editor 0.27.0），用户输入 `obj.` 后无法自动联想出对象的属性（如 `item001`、`item002`）。这严重影响集成脚本的编写效率。

---

## 根因分析

### 问题本质

Monaco Editor 的 JavaScript IntelliSense（自动补全/类型推断/hover 提示）**完全未启用**。不仅 `obj.` 的业务字段没有补全，连 JavaScript 标准 API（如 `console.log`、`Array.map`）都没有补全提示。

### 5 个根因

| # | 根因 | 严重程度 | 位置 |
|---|------|---------|------|
| **1** | **TypeScript Language Service Worker 未配置** | 致命 | vue.config.js / monaco.vue |
| **2** | **无 CompletionItemProvider 注册** | 致命 | monaco.vue |
| **3** | **无 extraLibs 类型定义** | 严重 | monaco.vue |
| **4** | **编辑器选项不完整** | 中等 | monaco.vue:35-41 |
| **5** | **后端字段信息未传递给编辑器** | 严重 | index.vue |

### 根因 1：Worker 未配置（最关键）

Monaco 的 JavaScript IntelliSense 底层依赖 TypeScript Language Service，运行在 Web Worker 中（`ts.worker.js`）。当前项目：

- **没有** `monaco-editor-webpack-plugin`（package.json devDependencies 中不存在）
- **没有** `self.MonacoEnvironment` 全局配置（全项目搜索无结果）
- **没有** `getWorkerUrl` 或 `getWorker` 回调

导致浏览器控制台可能出现：
```
Could not create web worker(s). Falling back to loading web worker code in main thread...
```

Worker 加载失败后，Monaco 降级到无 IntelliSense 模式，仅保留语法高亮。

### 根因 2：无 CompletionItemProvider

`obj` 是 BCP 脚本运行时注入的变量，其属性来自数据源的字段定义。Monaco 没有内置知识知道 `obj` 有哪些属性。需要通过以下方式之一告知：

- `monaco.languages.registerCompletionItemProvider()` — 注册自定义补全提供者
- `monaco.languages.typescript.javascriptDefaults.addExtraLib()` — 添加类型声明

当前两者都没有实现。

### 根因 3：无 extraLibs

未通过 `addExtraLib()` 声明 BCP 脚本运行时环境的类型信息（`obj`、`result`、`params`、`logger` 等全局变量）。

### 根因 4：编辑器选项不完整

当前 `monaco.vue` 的 `defaultOpts`：

```javascript
defaultOpts: {
    value: '',
    theme: 'vs-dark',
    roundedSelection: false,
    autoIndent: true,
    language: 'javascript'
}
```

缺少的关键选项：
- `suggest: { showKeywords, showProperties, ... }` — 控制补全内容类型
- `quickSuggestions: { other: true }` — 输入时自动触发建议
- `wordBasedSuggestions: true` — 基于当前文件词汇的补全
- `parameterHints: { enabled: true }` — 函数参数提示
- `automaticLayout: true` — 自动响应容器尺寸

### 根因 5：业务数据断层

数据流断裂点：

```
后端数据源 → 有字段列表 → ❌ 前端从未获取 → ❌ 从未传递给 Monaco → 无补全
```

当前 `integrationConfig/index.vue` 中：
- 有数据源选择（`inNode.dataSource`）
- 有数据源名称列表（`bcpDatasourceName`）
- **但没有**获取数据源字段列表的 API 调用
- **没有**将字段信息传递给 Monaco 组件的 props

### 附加问题：内存泄漏

`monaco.vue` 缺少 `beforeDestroy` 生命周期钩子，`monaco.editor.create()` 创建的实例没有 `dispose()`。每次打开/关闭对话框都会泄漏一个编辑器实例。

---

## 优化方案

### Phase 1: MVP — 让基础 IntelliSense 工作（1-2 天，纯前端）

**目标**：`console.` 能补全 `log`/`warn`/`error`，`var x = {a:1}; x.` 能补全 `a`。

#### 1a. 安装 monaco-editor-webpack-plugin

```bash
npm install --save-dev monaco-editor-webpack-plugin@4.2.0
```

> 版本说明：4.2.0 是最后兼容 webpack 4（Vue CLI 3.x）+ monaco-editor 0.27.x 的版本。不可使用 5.x+。

#### 1b. vue.config.js 添加 Plugin

```javascript
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin')

module.exports = {
  // ... 现有配置 ...
  configureWebpack: {
    // ... 现有 name/resolve/output ...
    plugins: [
      new MonacoWebpackPlugin({
        languages: ['javascript', 'typescript'],
        features: [
          'bracketMatching', 'clipboard', 'coreCommands', 'comment',
          'find', 'folding', 'hover', 'suggest', 'wordHighlighter',
          'indentation', 'parameterHints', 'smartSelect'
        ]
      })
    ]
  }
}
```

> `features` 白名单精简打包体积。完整 Monaco 约 4MB，精简后约 2MB。

#### 1c. monaco.vue 改造

**简化导入**（webpack plugin 自动处理按需加载和 Worker）：

```javascript
// 替换原来的 3 行按需导入
import * as monaco from 'monaco-editor'
```

**增强 defaultOpts**：

```javascript
defaultOpts: {
  value: '',
  theme: 'vs-dark',
  roundedSelection: false,
  autoIndent: true,
  language: 'javascript',
  // 新增
  minimap: { enabled: false },
  suggest: {
    showKeywords: true,
    showSnippets: true,
    showVariables: true,
    showFunctions: true,
    showProperties: true
  },
  quickSuggestions: {
    other: true,
    comments: false,
    strings: false
  },
  wordBasedSuggestions: true,
  parameterHints: { enabled: true },
  tabCompletion: 'on',
  acceptSuggestionOnEnter: 'on',
  automaticLayout: true
}
```

#### 1d. 修复已有 Bug

```javascript
// 修复 Object.assign 污染 defaultOpts
init() {
  if (this.monacoEditor) {
    this.monacoEditor.dispose()
  }
  this.$refs.container.innerHTML = ''
  this.editorOptions = Object.assign({}, this.defaultOpts, this.opts)  // {} 防止污染
  this.monacoEditor = monaco.editor.create(this.$refs.container, this.editorOptions)
  this.monacoEditor.onDidChangeModelContent(() => {
    this.$emit('change', this.monacoEditor.getValue())
  })
}

// 新增生命周期清理
beforeDestroy() {
  if (this._completionDisposable) {
    this._completionDisposable.dispose()
  }
  if (this._extraLibDisposable) {
    this._extraLibDisposable.dispose()
  }
  if (this.monacoEditor) {
    this.monacoEditor.dispose()
    this.monacoEditor = null
  }
}
```

#### MVP 验证

- 输入 `console.` → 弹出 `log`、`warn`、`error` 等标准 API ✓
- 输入 `var x = { name: 'test' }; x.` → 弹出 `name` ✓
- 输入已有变量名的前几个字母 → 词汇补全 ✓
- `npm run build:prod` 构建成功 ✓

---

### Phase 2: 业务字段补全 — CompletionItemProvider（1 天）

**目标**：`obj.` 能补全业务字段（先用静态数据验证）。

#### 2a. monaco.vue 增加 fields prop

```javascript
props: {
  opts: { type: Object, default: () => ({}) },
  fields: { type: Array, default: () => [] }  // [{ fieldName, fieldType, comment }]
},
watch: {
  fields() {
    this.registerCompletionProvider()
  }
}
```

#### 2b. 注册 CompletionItemProvider

```javascript
methods: {
  registerCompletionProvider() {
    if (this._completionDisposable) {
      this._completionDisposable.dispose()
    }
    const fields = this.fields
    if (!fields.length) return

    this._completionDisposable = monaco.languages.registerCompletionItemProvider('javascript', {
      triggerCharacters: ['.'],
      provideCompletionItems(model, position) {
        const line = model.getValueInRange({
          startLineNumber: position.lineNumber,
          startColumn: 1,
          endLineNumber: position.lineNumber,
          endColumn: position.column
        })
        const word = model.getWordUntilPosition(position)
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn
        }

        // 检测 obj. 模式
        if (/\bobj\.\s*$/.test(line)) {
          return {
            suggestions: fields.map(f => ({
              label: f.fieldName,
              kind: monaco.languages.CompletionItemKind.Property,
              documentation: f.comment || '',
              detail: f.fieldType || 'any',
              insertText: f.fieldName,
              range
            }))
          }
        }
        return { suggestions: [] }
      }
    })
  }
}
```

#### 2c. index.vue 传递测试数据

```html
<MonAco ref="MonAco" :fields="currentFields" />
```

```javascript
data() {
  return {
    currentFields: [
      { fieldName: 'item001', fieldType: 'string', comment: '商品编码' },
      { fieldName: 'item002', fieldType: 'number', comment: '数量' },
      { fieldName: 'item003', fieldType: 'string', comment: '供应商名称' }
    ]
  }
}
```

#### Phase 2 验证

- 输入 `obj.` → 弹出 `item001`、`item002`、`item003` ✓
- 输入 `obj.item` → 过滤显示匹配项 ✓
- 补全项显示字段备注 ✓

---

### Phase 3: 动态字段 — 后端 API 集成（2-3 天，需后端配合）

**目标**：根据实际数据源配置动态获取字段列表。

#### 3a. 后端新增接口

```
GET /services/fwcore/datasource/fields/{datasourceId}

响应：
{
  "model": [
    { "fieldName": "item001", "fieldType": "string", "comment": "商品编码" },
    { "fieldName": "item002", "fieldType": "number", "comment": "数量" }
  ]
}
```

#### 3b. 前端 API 层

`src/api/IntegratedConfig.js` 新增：

```javascript
export function getDatasourceFields(id) {
  return request({
    url: '/services/fwcore/datasource/fields/' + id,
    method: 'GET'
  })
}
```

#### 3c. index.vue 对话框打开时获取字段

在打开输入/转换/输出节点对话框时：

```javascript
async showInputNode(row) {
  // ... 现有逻辑 ...
  // 新增：获取字段列表
  if (this.inNode.dataSourceId) {
    try {
      const res = await api.getDatasourceFields(this.inNode.dataSourceId)
      this.currentFields = res.model || []
    } catch (e) {
      this.currentFields = []
    }
  }
}
```

#### 3d. 增强为 addExtraLib（可选，Worker 已工作后）

```javascript
updateTypeDefinitions(fields) {
  if (this._extraLibDisposable) {
    this._extraLibDisposable.dispose()
  }
  const typeDefs = fields.map(f => {
    const tsType = f.fieldType === 'number' ? 'number'
      : f.fieldType === 'boolean' ? 'boolean' : 'string'
    return `  /** ${f.comment || ''} */\n  ${f.fieldName}: ${tsType};`
  }).join('\n')

  this._extraLibDisposable = monaco.languages.typescript.javascriptDefaults.addExtraLib(
    `declare var obj: {\n${typeDefs}\n};`,
    'ts:bcp-context.d.ts'
  )
}
```

好处：自动获得 hover 类型提示、深层链式推断（如 `obj.item001.length`）。

---

### Phase 4: 增强体验（1 天）

#### 4a. BCP 运行时上下文变量声明

```javascript
const BCP_RUNTIME_DEFS = `
  /** 当前数据行对象，属性为数据源字段 */
  declare var obj: { [key: string]: any };
  /** 输出结果对象 */
  declare var result: { [key: string]: any };
  /** 任务参数 */
  declare var params: { [key: string]: string };
  /** 日志工具 */
  declare var logger: {
    info(msg: string): void;
    warn(msg: string): void;
    error(msg: string): void;
  };
`
monaco.languages.typescript.javascriptDefaults.addExtraLib(BCP_RUNTIME_DEFS, 'ts:bcp-runtime.d.ts')
```

#### 4b. 常用代码片段

```javascript
monaco.languages.registerCompletionItemProvider('javascript', {
  provideCompletionItems(model, position) {
    const range = /* ... */
    return {
      suggestions: [
        {
          label: 'for-each-field',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: 'for (var key in obj) {\n  var value = obj[key];\n  $0\n}',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: '遍历 obj 的所有字段',
          range
        }
      ]
    }
  }
})
```

---

## 实施路线图

```
Phase 1 — MVP（1-2 天，纯前端）
  ├── npm install monaco-editor-webpack-plugin@4.2.0
  ├── vue.config.js 添加 MonacoWebpackPlugin
  ├── monaco.vue 简化导入 + 增强选项 + 修复 bug
  └── 验证：console. 补全工作

Phase 2 — 业务字段补全（1 天，纯前端）
  ├── monaco.vue 增加 fields prop + CompletionItemProvider
  ├── index.vue 传递静态测试数据
  └── 验证：obj. 补全测试字段

Phase 3 — 动态字段（2-3 天，需后端配合）
  ├── 后端：新增数据源字段查询接口
  ├── 前端：API 调用 + 对话框打开时获取字段
  └── 验证：不同数据源对应不同字段补全

Phase 4 — 增强（1 天）
  ├── BCP 运行时上下文变量类型声明
  ├── 常用代码片段
  └── 编辑器 dispose 生命周期完善
```

---

## 风险与注意事项

| 风险 | 等级 | 措施 |
|------|------|------|
| **webpack plugin 版本兼容** | 高 | 必须用 4.2.0（webpack 4 + monaco 0.27.x），安装后立即验证 build |
| **打包体积增加** | 中 | features 白名单精简，预计增加 ~2MB（gzip ~600KB），splitChunks 自动分离 |
| **CompletionItemProvider 全局性** | 中 | 注册是语言级别非实例级别，必须保存 disposable 在组件销毁时 dispose |
| **Worker 跨域** | 低 | publicPath='/' 无跨域；若改为 CDN 需 Blob URL 中转 |
| **Node 14 构建** | 低 | 两个包均支持 Node 14 |
| **多编辑器实例字段冲突** | 低 | 同一时刻只有一个对话框打开（互斥），每次打开时 dispose 旧 provider |

---

## 关键文件

| 文件 | 改动 |
|------|------|
| `package.json` | +devDep: monaco-editor-webpack-plugin@4.2.0 |
| `vue.config.js` | +MonacoWebpackPlugin 配置 |
| `src/views/integrationConfig/moudel/monaco.vue` | 核心改造（导入/选项/Provider/dispose） |
| `src/views/integrationConfig/index.vue` | +fields prop 传递 + 获取字段数据 |
| `src/api/IntegratedConfig.js` | +getDatasourceFields API（Phase 3） |

---

## CompletionItemProvider vs addExtraLib 对比

| 维度 | CompletionItemProvider | addExtraLib |
|------|----------------------|-------------|
| 前置依赖 | 无需 Worker | 必须 Worker 正常 |
| 类型推断深度 | 仅一层属性 | 深层链式推断 |
| hover 提示 | 需额外实现 | 自动获得 |
| 实现复杂度 | 中等 | 较低（Worker 配好后）|
| 推荐策略 | Phase 2 先用（兜底） | Phase 3 切换（首选） |

**建议两者结合**：CompletionItemProvider 作为基础保障（不依赖 Worker），addExtraLib 作为增强（Worker 工作后提供更强大的类型推断）。
