<template>
  <div ref="mEditor" class="the-code-editor-container">
    <div class="editor-toolbar">
      <i class="el-icon-magic-stick" title="格式化代码" @click="formatCode" />
      <i class="el-icon-document-copy" title="复制代码" @click="copyCode" />
      <i v-if="isMaximum" class="el-icon-rank" title="点击缩小" @click="minEditor" />
      <i v-else class="el-icon-full-screen" title="点击放大" @click="maxEditor" />
    </div>
    <div ref="container" class="my-editor" />
  </div>
</template>

<script>
import * as monaco from 'monaco-editor'

// BCP Nashorn 脚本运行时的全局变量类型声明
var BCP_RUNTIME_DEFS = [
  '/** 当前数据行对象，属性为数据源字段（如 obj.item001） */',
  'declare var obj: { [key: string]: any };',
  '/** 输出结果对象，在转换节点中使用 */',
  'declare var result: { [key: string]: any };',
  '/** 任务参数 */',
  'declare var params: { [key: string]: string };',
  '/** 日志工具 */',
  'declare var logger: {',
  '  info(msg: string): void;',
  '  warn(msg: string): void;',
  '  error(msg: string): void;',
  '};',
  '/** Java Nashorn 的 print 函数 */',
  'declare function print(...args: any[]): void;'
].join('\n')

// 全局只注册一次运行时类型声明
var runtimeLibRegistered = false
function registerRuntimeLib() {
  if (runtimeLibRegistered) return
  try {
    monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: true,
      noSyntaxValidation: false
    })
    monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
      target: monaco.languages.typescript.ScriptTarget.ES5,
      allowNonTsExtensions: true,
      allowJs: true
    })
    monaco.languages.typescript.javascriptDefaults.addExtraLib(
      BCP_RUNTIME_DEFS,
      'ts:bcp-runtime.d.ts'
    )
    runtimeLibRegistered = true
  } catch (e) {
    console.warn('[Monaco] 运行时类型注册失败:', e.message)
  }
}

// 全局只注册一次代码片段
var snippetsRegistered = false
function registerSnippets() {
  if (snippetsRegistered) return
  monaco.languages.registerCompletionItemProvider('javascript', {
    provideCompletionItems: function(model, position) {
      var word = model.getWordUntilPosition(position)
      var range = {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: word.startColumn,
        endColumn: word.endColumn
      }
      return {
        suggestions: [
          {
            label: 'for-obj-fields',
            kind: monaco.languages.CompletionItemKind.Snippet,
            documentation: '遍历 obj 的所有字段',
            insertText: 'for (var key in obj) {\n  var value = obj[key];\n  ${0}\n}',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            range: range
          },
          {
            label: 'if-null-check',
            kind: monaco.languages.CompletionItemKind.Snippet,
            documentation: '空值检查',
            insertText: 'if (obj.${1:field} !== null && obj.${1:field} !== undefined) {\n  ${0}\n}',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            range: range
          },
          {
            label: 'result-set',
            kind: monaco.languages.CompletionItemKind.Snippet,
            documentation: '设置 result 输出字段',
            insertText: 'result.${1:fieldName} = obj.${2:sourceField};',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            range: range
          },
          {
            label: 'logger-info',
            kind: monaco.languages.CompletionItemKind.Snippet,
            documentation: '输出日志',
            insertText: "logger.info('${1:message}');",
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            range: range
          },
          {
            label: 'try-catch',
            kind: monaco.languages.CompletionItemKind.Snippet,
            documentation: 'try-catch 异常捕获',
            insertText: 'try {\n  ${0}\n} catch (e) {\n  logger.error(e.message);\n}',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            range: range
          }
        ]
      }
    }
  })
  snippetsRegistered = true
}

export default {
  name: 'AcMonaco',
  props: {
    opts: {
      type: Object,
      default() {
        return {}
      }
    },
    height: {
      type: Number,
      default: 300
    },
    fields: {
      type: Array,
      default() {
        return []
      }
    }
  },
  data() {
    return {
      defaultOpts: {
        value: '',
        theme: 'vs-dark',
        roundedSelection: false,
        autoIndent: true,
        language: 'javascript',
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
      },
      isMaximum: false,
      originSize: {
        width: '',
        height: ''
      },
      monacoEditor: null
    }
  },
  watch: {
    opts: {
      handler() {
        this.init()
      },
      deep: true
    },
    fields() {
      this.registerCompletionProvider()
      this.updateTypeDefinitions()
    }
  },
  created() {
    // 非响应式属性（避免 Vue reserved key 限制）
    this.completionDisposable = null
    this.extraLibDisposable = null
  },
  mounted() {
    this.init()
  },
  beforeDestroy() {
    if (this.completionDisposable) {
      this.completionDisposable.dispose()
      this.completionDisposable = null
    }
    if (this.extraLibDisposable) {
      this.extraLibDisposable.dispose()
      this.extraLibDisposable = null
    }
    if (this.monacoEditor) {
      this.monacoEditor.dispose()
      this.monacoEditor = null
    }
  },
  methods: {
    clearContent() {
      if (this.monacoEditor) {
        this.monacoEditor.setValue('')
      }
    },
    setValue(data) {
      if (this.monacoEditor) {
        data = data === undefined ? '' : data
        this.monacoEditor.setValue(data)
      }
    },
    init() {
      // 销毁之前的编辑器实例
      if (this.monacoEditor) {
        this.monacoEditor.dispose()
        this.monacoEditor = null
      }
      this.$refs.container.innerHTML = ''

      // 全局注册 BCP 运行时类型和代码片段（仅首次）
      registerRuntimeLib()
      registerSnippets()

      const editorOptions = Object.assign({}, this.defaultOpts, this.opts)
      this.monacoEditor = monaco.editor.create(this.$refs.container, editorOptions)
      this.monacoEditor.onDidChangeModelContent(() => {
        this.$emit('change', this.monacoEditor.getValue())
      })

      // 注册补全提供者
      if (this.fields && this.fields.length) {
        this.registerCompletionProvider()
        this.updateTypeDefinitions()
      }
    },
    getVal() {
      return this.monacoEditor ? this.monacoEditor.getValue() : ''
    },
    // 注册 obj. 属性补全
    registerCompletionProvider() {
      if (this.completionDisposable) {
        this.completionDisposable.dispose()
      }
      const fields = this.fields
      if (!fields || !fields.length) return

      this.completionDisposable = monaco.languages.registerCompletionItemProvider('javascript', {
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
              suggestions: fields.map(function(f) {
                return {
                  label: f.fieldName,
                  kind: monaco.languages.CompletionItemKind.Property,
                  documentation: f.comment || '',
                  detail: f.fieldType || 'any',
                  insertText: f.fieldName,
                  range: range
                }
              })
            }
          }
          return { suggestions: [] }
        }
      })
    },
    // 通过 addExtraLib 声明 obj 类型（提供 hover 提示和深层推断）
    updateTypeDefinitions() {
      if (this.extraLibDisposable) {
        this.extraLibDisposable.dispose()
        this.extraLibDisposable = null
      }
      const fields = this.fields
      if (!fields || !fields.length) return

      try {
        const typeDefs = fields.map(function(f) {
          const tsType = f.fieldType === 'number' ? 'number'
            : f.fieldType === 'boolean' ? 'boolean'
              : 'string'
          return '  /** ' + (f.comment || f.fieldName) + ' */\n  ' + f.fieldName + ': ' + tsType + ';'
        }).join('\n')

        const libContent = 'declare var obj: {\n' + typeDefs + '\n  [key: string]: any;\n};\n'
        this.extraLibDisposable = monaco.languages.typescript.javascriptDefaults.addExtraLib(
          libContent,
          'ts:bcp-fields.d.ts'
        )
      } catch (e) {
        // TypeScript language service 可能未完全加载，降级到仅 CompletionItemProvider
        console.warn('[Monaco] addExtraLib failed, falling back to CompletionItemProvider only:', e.message)
      }
    },
    formatCode() {
      if (!this.monacoEditor) return
      this.monacoEditor.getAction('editor.action.formatDocument').run()
    },
    copyCode() {
      if (!this.monacoEditor) return
      const code = this.monacoEditor.getValue()
      if (!code) return
      navigator.clipboard.writeText(code).then(() => {
        this.$message({ message: '已复制', type: 'success', duration: 1500 })
      })
    },
    maxEditor() {
      this.isMaximum = true
      const dom = this.$refs.mEditor
      this.originSize = {
        width: dom.clientWidth,
        height: dom.clientHeight
      }
      dom.classList.add('editor-fullscreen')
      this.monacoEditor.layout({
        height: window.screen.height,
        width: document.body.clientWidth
      })
    },
    minEditor() {
      this.isMaximum = false
      const dom = this.$refs.mEditor
      dom.classList.remove('editor-fullscreen')
      this.monacoEditor.layout({
        height: this.originSize.height,
        width: this.originSize.width
      })
    }
  }
}
</script>
