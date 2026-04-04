/**
 * Unit tests for AcMonaco component
 * src/views/integrationConfig/moudel/monaco.vue
 *
 * Strategy: method-extraction testing (no mount) with mocked monaco-editor.
 * We construct a fake `this` context and call component methods via `.call()`.
 *
 * The `monaco-editor` mock is provided by tests/unit/__mocks__/monaco-editor.js
 * via jest.config.js moduleNameMapper.
 */

import Component from '@/views/integrationConfig/moudel/monaco.vue'
import * as monaco from 'monaco-editor'

// Per-test mock editor instance (overrides default mock return values as needed)
const mockEditor = {
  getValue: jest.fn(() => 'test code'),
  setValue: jest.fn(),
  getAction: jest.fn(() => ({ run: jest.fn() })),
  layout: jest.fn(),
  dispose: jest.fn(),
  onDidChangeModelContent: jest.fn(() => ({ dispose: jest.fn() })),
  getDomNode: jest.fn(() => ({ style: {} }))
}

/**
 * Build a fake `this` context for calling component methods via `.call()`.
 */
function createVm(overrides = {}) {
  const containerEl = document.createElement('div')
  const mEditorEl = document.createElement('div')
  // jsdom clientWidth/clientHeight default to 0; override for maxEditor test
  Object.defineProperty(mEditorEl, 'clientWidth', { value: 800 })
  Object.defineProperty(mEditorEl, 'clientHeight', { value: 600 })
  mEditorEl.classList = document.createElement('div').classList

  return {
    monacoEditor: mockEditor,
    defaultOpts: { ...Component.data().defaultOpts },
    isMaximum: false,
    originSize: { width: '', height: '' },
    completionDisposable: null,
    extraLibDisposable: null,
    fields: [],
    $refs: { container: containerEl, mEditor: mEditorEl },
    $emit: jest.fn(),
    $message: jest.fn(),
    ...overrides
  }
}

beforeEach(() => {
  jest.clearAllMocks()
  // Restore per-test mock editor defaults
  mockEditor.getValue.mockReturnValue('test code')
})

// ---------------------------------------------------------------------------
// 1. Component export verification
// ---------------------------------------------------------------------------
describe('AcMonaco - Component export', () => {
  it('has name "AcMonaco"', () => {
    expect(Component.name).toBe('AcMonaco')
  })

  it('declares props: opts, height, fields', () => {
    const props = Component.props
    expect(props).toHaveProperty('opts')
    expect(props.opts.type).toBe(Object)

    expect(props).toHaveProperty('height')
    expect(props.height.type).toBe(Number)
    expect(props.height.default).toBe(300)

    expect(props).toHaveProperty('fields')
    expect(props.fields.type).toBe(Array)
  })
})

// ---------------------------------------------------------------------------
// 2. Data defaults
// ---------------------------------------------------------------------------
describe('AcMonaco - Data defaults', () => {
  const data = Component.data()

  it('defaultOpts.theme is "vs-dark"', () => {
    expect(data.defaultOpts.theme).toBe('vs-dark')
  })

  it('defaultOpts.language is "javascript"', () => {
    expect(data.defaultOpts.language).toBe('javascript')
  })

  it('isMaximum is false', () => {
    expect(data.isMaximum).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// 3. Methods
// ---------------------------------------------------------------------------
describe('AcMonaco - Methods', () => {
  // -- clearContent ---------------------------------------------------------
  it('clearContent() calls monacoEditor.setValue with empty string', () => {
    const vm = createVm()
    Component.methods.clearContent.call(vm)
    expect(mockEditor.setValue).toHaveBeenCalledWith('')
  })

  // -- setValue --------------------------------------------------------------
  it('setValue("hello") calls monacoEditor.setValue("hello")', () => {
    const vm = createVm()
    Component.methods.setValue.call(vm, 'hello')
    expect(mockEditor.setValue).toHaveBeenCalledWith('hello')
  })

  it('setValue(undefined) calls monacoEditor.setValue with empty string', () => {
    const vm = createVm()
    Component.methods.setValue.call(vm, undefined)
    expect(mockEditor.setValue).toHaveBeenCalledWith('')
  })

  // -- getVal ---------------------------------------------------------------
  it('getVal() returns monacoEditor.getValue()', () => {
    const vm = createVm()
    const val = Component.methods.getVal.call(vm)
    expect(mockEditor.getValue).toHaveBeenCalled()
    expect(val).toBe('test code')
  })

  it('getVal() returns empty string when monacoEditor is null', () => {
    const vm = createVm({ monacoEditor: null })
    const val = Component.methods.getVal.call(vm)
    expect(val).toBe('')
  })

  // -- formatCode -----------------------------------------------------------
  it('formatCode() calls getAction("editor.action.formatDocument").run()', () => {
    const runFn = jest.fn()
    mockEditor.getAction.mockReturnValueOnce({ run: runFn })
    const vm = createVm()
    Component.methods.formatCode.call(vm)
    expect(mockEditor.getAction).toHaveBeenCalledWith('editor.action.formatDocument')
    expect(runFn).toHaveBeenCalled()
  })

  it('formatCode() does not throw when monacoEditor is null', () => {
    const vm = createVm({ monacoEditor: null })
    expect(() => {
      Component.methods.formatCode.call(vm)
    }).not.toThrow()
  })

  // -- copyCode -------------------------------------------------------------
  it('copyCode() calls navigator.clipboard.writeText with editor value', () => {
    const writeTextMock = jest.fn(() => Promise.resolve())
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: writeTextMock },
      writable: true,
      configurable: true
    })
    const vm = createVm()
    Component.methods.copyCode.call(vm)
    expect(writeTextMock).toHaveBeenCalledWith('test code')
  })

  it('copyCode() does not call clipboard when editor value is empty', () => {
    const writeTextMock = jest.fn(() => Promise.resolve())
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: writeTextMock },
      writable: true,
      configurable: true
    })
    mockEditor.getValue.mockReturnValueOnce('')
    const vm = createVm()
    Component.methods.copyCode.call(vm)
    expect(writeTextMock).not.toHaveBeenCalled()
  })

  // -- maxEditor ------------------------------------------------------------
  it('maxEditor() sets isMaximum to true', () => {
    const vm = createVm()
    Component.methods.maxEditor.call(vm)
    expect(vm.isMaximum).toBe(true)
  })

  // -- minEditor ------------------------------------------------------------
  it('minEditor() sets isMaximum to false', () => {
    const vm = createVm({ isMaximum: true })
    Component.methods.minEditor.call(vm)
    expect(vm.isMaximum).toBe(false)
  })

  // -- registerCompletionProvider -------------------------------------------
  it('registerCompletionProvider() does not register when fields is empty', () => {
    const vm = createVm({ fields: [] })
    Component.methods.registerCompletionProvider.call(vm)
    expect(monaco.languages.registerCompletionItemProvider).not.toHaveBeenCalled()
  })

  it('registerCompletionProvider() registers provider when fields have values', () => {
    const vm = createVm({
      fields: [
        { fieldName: 'item001', fieldType: 'string', comment: 'Item 1' }
      ]
    })
    Component.methods.registerCompletionProvider.call(vm)
    expect(monaco.languages.registerCompletionItemProvider).toHaveBeenCalledWith(
      'javascript',
      expect.objectContaining({
        triggerCharacters: ['.'],
        provideCompletionItems: expect.any(Function)
      })
    )
    expect(vm.completionDisposable).not.toBeNull()
  })

  // -- updateTypeDefinitions ------------------------------------------------
  it('updateTypeDefinitions() calls addExtraLib when fields have values', () => {
    const vm = createVm({
      fields: [
        { fieldName: 'amount', fieldType: 'number', comment: 'Amount' },
        { fieldName: 'name', fieldType: 'string', comment: 'Name' }
      ]
    })
    Component.methods.updateTypeDefinitions.call(vm)
    expect(monaco.languages.typescript.javascriptDefaults.addExtraLib).toHaveBeenCalledWith(
      expect.stringContaining('amount: number'),
      'ts:bcp-fields.d.ts'
    )
    expect(vm.extraLibDisposable).not.toBeNull()
  })

  it('updateTypeDefinitions() does nothing when fields is empty', () => {
    const vm = createVm({ fields: [] })
    Component.methods.updateTypeDefinitions.call(vm)
    expect(monaco.languages.typescript.javascriptDefaults.addExtraLib).not.toHaveBeenCalled()
  })
})
