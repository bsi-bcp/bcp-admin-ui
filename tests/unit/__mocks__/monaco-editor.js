/**
 * Manual mock for monaco-editor.
 * Monaco has no CJS main entry, so Jest cannot resolve it without this mapping.
 * Configured via jest.config.js moduleNameMapper.
 */

const mockEditor = {
  getValue: jest.fn(() => ''),
  setValue: jest.fn(),
  getAction: jest.fn(() => ({ run: jest.fn() })),
  layout: jest.fn(),
  dispose: jest.fn(),
  onDidChangeModelContent: jest.fn(() => ({ dispose: jest.fn() })),
  getDomNode: jest.fn(() => ({ style: {} }))
}

module.exports = {
  editor: {
    create: jest.fn(() => mockEditor),
    defineTheme: jest.fn()
  },
  languages: {
    registerCompletionItemProvider: jest.fn(() => ({ dispose: jest.fn() })),
    CompletionItemKind: {
      Property: 9,
      Snippet: 27
    },
    CompletionItemInsertTextRule: {
      InsertAsSnippet: 4
    },
    typescript: {
      javascriptDefaults: {
        setCompilerOptions: jest.fn(),
        addExtraLib: jest.fn(() => ({ dispose: jest.fn() })),
        setDiagnosticsOptions: jest.fn()
      },
      ScriptTarget: { ES5: 0 }
    }
  },
  CompletionItemKind: { Property: 9 },
  Range: jest.fn()
}
