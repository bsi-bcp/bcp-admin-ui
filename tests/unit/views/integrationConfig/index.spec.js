/**
 * integrationConfig/index.vue -- method-level unit tests
 *
 * The component is too heavy (1815 lines, 11 dialogs, 3 Monaco editors) to
 * shallowMount. Instead we import the component definition object and call
 * its methods directly, providing a fake `this` context where needed.
 */

// ---------------------------------------------------------------------------
// Mocks (must come before any import that touches these modules)
// ---------------------------------------------------------------------------
jest.mock('@/api/IntegratedConfig', () => ({
  getPage: jest.fn(() => Promise.resolve({ model: [], currentPage: 1, pageSize: 10, totalCount: 0 })),
  submitForm: jest.fn(() => Promise.resolve({ model: '123' })),
  singleDelete: jest.fn(() => Promise.resolve({})),
  getIdRow: jest.fn(() => Promise.resolve({ model: '{}' })),
  exportExcel: jest.fn(() => Promise.resolve('blob-stub')),
  expForIot: jest.fn(() => Promise.resolve('blob-stub')),
  runTask: jest.fn(() => Promise.resolve({})),
  getTaskLog: jest.fn(() => Promise.resolve({ model: [], totalCount: 0 })),
  issueType: jest.fn(() => Promise.resolve({ model: 1 })),
  getSendStatus: jest.fn(() => Promise.resolve({ model: '下发成功' })),
  getTemplateContent: jest.fn(() => Promise.resolve({ jobList: [], configValue: null })),
  upload: jest.fn(() => Promise.resolve({})),
  getDatasourceFields: jest.fn(() => Promise.resolve({ model: [] }))
}))

jest.mock('@/api/select', () => ({
  getFreelist: jest.fn(() => Promise.resolve({ model: [] })),
  getProplist: jest.fn(() => Promise.resolve({ model: [] }))
}))

jest.mock('@/api/menu', () => ({
  getSourceTypeOptions: jest.fn(() => Promise.resolve({ model: [] }))
}))

jest.mock('@/utils/date', () => ({
  formatDate: jest.fn(() => '2026-04-04 00:00:00')
}))

jest.mock('sortablejs', () => ({ create: jest.fn(() => ({ destroy: jest.fn() })) }))

// Stub sub-components so the SFC can be parsed without errors
jest.mock('@/views/integrationConfig/moudel/multipleTable', () => ({ render: () => {} }))
jest.mock('@/views/integrationConfig/moudel/monaco', () => ({ render: () => {} }))
jest.mock('@/components/cron/cron', () => ({ render: () => {} }))

// Vuex mapGetters helper -- mock store so import does not throw
jest.mock('vuex', () => ({
  mapGetters: () => ({
    cur_user: () => ({ userType: 'admin', tenantId: '1' })
  })
}))

// element-ui Loading used directly by runTask
jest.mock('element-ui', () => ({
  Loading: {
    service: jest.fn(() => ({ text: '', close: jest.fn() }))
  }
}))

// ---------------------------------------------------------------------------
// Import after mocks
// ---------------------------------------------------------------------------
const Component = require('@/views/integrationConfig/index.vue').default
const api = require('@/api/IntegratedConfig')
const sel = require('@/api/select')
const menuApi = require('@/api/menu')
const { formatDate } = require('@/utils/date')
const { Loading } = require('element-ui')

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const methods = Component.methods

/** Build a minimal `this` (vm) context that satisfies most method needs. */
function createVm(overrides) {
  const dataFn = Component.data
    ? (typeof Component.data === 'function'
      ? Component.data.call({ $route: { path: '/integrationConfig' } })
      : Component.data)
    : {}

  const vm = {
    ...dataFn,
    cur_user: { userType: 'admin', tenantId: '1' },
    $route: { path: '/integrationConfig' },
    $message: Object.assign(jest.fn(), {
      success: jest.fn(),
      error: jest.fn(),
      warning: jest.fn()
    }),
    $confirm: jest.fn(() => Promise.resolve()),
    $loading: jest.fn(() => ({ close: jest.fn() })),
    $set: jest.fn((obj, key, val) => { obj[key] = val }),
    $nextTick: jest.fn(cb => cb && cb()),
    $refs: {},
    $router: { resolve: jest.fn(() => ({ href: '/datasource' })) },
    ...overrides
  }
  // bind all Component.methods to vm so internal calls work
  Object.keys(methods).forEach(name => {
    vm[name] = methods[name].bind(vm)
  })
  return vm
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
// Global stubs for jsdom-missing APIs
beforeAll(() => {
  if (!window.URL) window.URL = {}
  window.URL.createObjectURL = jest.fn(() => 'blob:mock')
})

describe('integrationConfig/index.vue — method logic', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  // =========================================================================
  // 1. Utility methods (7)
  // =========================================================================
  describe('formatContent', () => {
    it('formats a simple JSON object string', () => {
      const vm = createVm()
      const result = vm.formatContent('{"a":"1"}')
      expect(result).toContain('{')
      expect(result).toContain('}')
      expect(result).toContain('a')
    })

    it('formats a nested JSON object string', () => {
      const vm = createVm()
      const result = vm.formatContent('{"a":{"b":"2"}}')
      // nested braces should produce extra indentation
      expect(result.split('\n').length).toBeGreaterThan(3)
    })

    it('handles an empty object string', () => {
      const vm = createVm()
      const result = vm.formatContent('{}')
      expect(result).toContain('{')
      expect(result).toContain('}')
    })
  })

  describe('_assignSortIds', () => {
    it('assigns incremental __sortId to items without one', () => {
      const vm = createVm()
      const list = [{ name: 'a' }, { name: 'b' }]
      vm._assignSortIds(list)
      expect(list[0].__sortId).toBeDefined()
      expect(list[1].__sortId).toBeDefined()
      expect(list[1].__sortId).toBeGreaterThan(list[0].__sortId)
    })

    it('does nothing for null input', () => {
      const vm = createVm()
      expect(() => vm._assignSortIds(null)).not.toThrow()
    })

    it('does nothing for empty list', () => {
      const vm = createVm()
      const list = []
      vm._assignSortIds(list)
      expect(list.length).toBe(0)
    })

    it('preserves existing __sortId', () => {
      const vm = createVm()
      const list = [{ __sortId: 999 }]
      vm._assignSortIds(list)
      expect(list[0].__sortId).toBe(999)
    })
  })

  describe('jobRowClassName', () => {
    it('returns disabled class when enable is "false"', () => {
      const vm = createVm()
      expect(vm.jobRowClassName({ row: { enable: 'false' } })).toBe('job-disabled-row')
    })

    it('returns empty string when enable is "true"', () => {
      const vm = createVm()
      expect(vm.jobRowClassName({ row: { enable: 'true' } })).toBe('')
    })
  })

  describe('scriptNotNull', () => {
    it('returns false for empty scriptContent', () => {
      const vm = createVm()
      const result = vm.scriptNotNull({ scriptContent: '' })
      expect(result).toBe(false)
      expect(vm.$message).toHaveBeenCalled()
    })

    it('returns true for non-empty scriptContent', () => {
      const vm = createVm()
      expect(vm.scriptNotNull({ scriptContent: 'var x = 1;' })).toBe(true)
    })
  })

  // =========================================================================
  // 2. Export commands (2)
  // =========================================================================
  describe('handleExportCommand', () => {
    it('"export" command calls derive (which calls exportExcel)', () => {
      const vm = createVm()
      const row = { id: '1', name: 'test' }
      // derive internally calls api.exportExcel
      vm.handleExportCommand('export', row)
      expect(api.exportExcel).toHaveBeenCalledWith('1')
    })

    it('"it" command calls expForIot', () => {
      const vm = createVm()
      const row = { id: '1', name: 'test' }
      vm.handleExportCommand('it', row)
      expect(api.expForIot).toHaveBeenCalledWith({ type: 'it', id: '1' })
    })
  })

  // =========================================================================
  // 3. Parameter management (4)
  // =========================================================================
  describe('copyParamCode', () => {
    it('shows warning when key is empty', () => {
      const vm = createVm()
      vm.copyParamCode('')
      expect(vm.$message.warning).toHaveBeenCalledWith('请先输入参数名称')
    })

    it('calls clipboard when key is present', () => {
      const vm = createVm()
      const writeText = jest.fn(() => Promise.resolve())
      Object.defineProperty(navigator, 'clipboard', {
        value: { writeText },
        writable: true,
        configurable: true
      })
      vm.copyParamCode('myParam')
      expect(writeText).toHaveBeenCalledWith('context.getParams().get("myParam")')
    })
  })

  describe('addParam', () => {
    it('pushes a new row to tableData', () => {
      const vm = createVm()
      const before = vm.tableData.length
      vm.addParam()
      expect(vm.tableData.length).toBe(before + 1)
      const last = vm.tableData[vm.tableData.length - 1]
      expect(last.key).toBe('')
      expect(last.value).toBe('')
      expect(last.__sortId).toBeDefined()
    })
  })

  describe('delTableData', () => {
    it('splices the row at given index', () => {
      const vm = createVm()
      vm.tableData = [{ key: 'a' }, { key: 'b' }, { key: 'c' }]
      vm.delTableData({ $index: 1 })
      expect(vm.tableData.length).toBe(2)
      expect(vm.tableData[0].key).toBe('a')
      expect(vm.tableData[1].key).toBe('c')
    })
  })

  // =========================================================================
  // 4. Cron management (2)
  // =========================================================================
  describe('showCronDialog', () => {
    it('sets cronExpression from inNode.cron and opens dialog', () => {
      const vm = createVm()
      vm.inNode.cron = '0 0 * * *'
      vm.showCronDialog()
      expect(vm.cronExpression).toBe('0 0 * * *')
      expect(vm.cronDialogVisible).toBe(true)
    })
  })

  describe('cronConfirm', () => {
    it('writes cronExpression to inNode.cron and closes dialog', () => {
      const vm = createVm()
      vm.cronExpression = '0 30 8 * * ?'
      vm.cronConfirm()
      expect(vm.inNode.cron).toBe('0 30 8 * * ?')
      expect(vm.cronDialogVisible).toBe(false)
    })
  })

  // =========================================================================
  // 5. Initialization (3)
  // =========================================================================
  describe('initOptions', () => {
    it('calls 6 API endpoints', () => {
      const vm = createVm()
      vm.initOptions()
      expect(sel.getFreelist).toHaveBeenCalledTimes(3)
      expect(menuApi.getSourceTypeOptions).toHaveBeenCalledTimes(3)
    })
  })

  describe('initData', () => {
    it('with curFlag=false sets default date pattern', () => {
      const vm = createVm()
      vm.initData(false)
      expect(formatDate).toHaveBeenCalledTimes(2)
      // first call uses default pattern (00:00:00)
      expect(formatDate.mock.calls[0][1]).toBe('yyyy-MM-dd 00:00:00')
      expect(vm.log.runTime.length).toBe(2)
    })

    it('with curFlag=true sets current date pattern and pageSize=500', () => {
      const vm = createVm()
      vm.initData(true)
      expect(formatDate.mock.calls[0][1]).toBe('yyyy-MM-dd hh:mm:ss')
      expect(vm.log.pageSize).toBe(500)
      expect(vm.log.runTime.length).toBe(2)
    })
  })

  // =========================================================================
  // 6. Task management (10)
  // =========================================================================
  describe('addJob', () => {
    it('pushes a default job structure to jobList', () => {
      const vm = createVm()
      vm.jobList = []
      vm.addJob()
      expect(vm.jobList.length).toBe(1)
      const job = vm.jobList[0]
      expect(job.enable).toBe('true')
      expect(job.inNode.classify).toBe('in')
      expect(job.outNode.classify).toBe('out')
      expect(job.transformNode.classify).toBe('transform')
      expect(job.__sortId).toBeDefined()
    })
  })

  describe('addJobJson', () => {
    it('shows error when newJson is empty', () => {
      const vm = createVm()
      vm.jsonTask = { newJson: '' }
      vm.addJobJson()
      expect(vm.$message.error).toHaveBeenCalledWith('json串格式不能为空，请填写')
    })

    it('shows error for invalid JSON', () => {
      const vm = createVm()
      vm.jsonTask = { newJson: '{bad json' }
      vm.addJobJson()
      expect(vm.$message.error).toHaveBeenCalledWith('json串格式不正确,请检查')
    })

    it('shows error when required nodes are missing', () => {
      const vm = createVm()
      vm.jsonTask = { newJson: '{"inNode":{}}' }
      vm.addJobJson()
      expect(vm.$message.error).toHaveBeenCalledWith('json串格式不正确,请检查')
    })

    it('adds valid JSON to jobList and closes dialog', () => {
      const vm = createVm()
      vm.jobList = []
      const validJson = JSON.stringify({
        jobName: 'test',
        inNode: { type: 'db' },
        transformNode: { type: 'js' },
        outNode: { type: 'db' }
      })
      vm.jsonTask = { newJson: validJson }
      vm.addJobJson()
      expect(vm.jobList.length).toBe(1)
      expect(vm.jobList[0].jobName).toBe('test')
      expect(vm.jobList[0].__sortId).toBeDefined()
      expect(vm.new_flag).toBe(false)
    })
  })

  describe('deljobList', () => {
    it('splices the job after $confirm resolves', async() => {
      const vm = createVm()
      vm.jobList = [
        { jobName: 'a' },
        { jobName: 'b' },
        { jobName: 'c' }
      ]
      vm.$confirm = jest.fn(() => Promise.resolve())
      vm.deljobList({ $index: 1 })
      await Promise.resolve() // wait for microtask
      expect(vm.jobList.length).toBe(2)
      expect(vm.jobList[1].jobName).toBe('c')
    })
  })

  describe('copyJob', () => {
    it('deep-copies the row, renames, clears IDs, and appends to jobList', () => {
      const vm = createVm()
      vm.jobList = []
      const row = {
        jobName: 'original',
        id: '100',
        inNode: { id: '1', configValue: '{}' },
        outNode: { id: '2', configValue: '{}' },
        transformNode: { id: '3', configValue: '{}' }
      }
      vm.copyJob({ row })
      expect(vm.jobList.length).toBe(1)
      const copied = vm.jobList[0]
      expect(copied.jobName).toBe('original_COPY')
      expect(copied.id).toBe('')
      expect(copied.inNode.id).toBe('')
      expect(copied.outNode.id).toBe('')
      expect(copied.transformNode.id).toBe('')
      expect(copied.__sortId).toBeDefined()
    })
  })

  describe('copyJobJson', () => {
    it('deep-copies the row and renames with _COPY_J suffix', () => {
      const vm = createVm()
      // mock DOM methods used for clipboard
      const mockInput = {
        value: '',
        focus: jest.fn(),
        select: jest.fn(),
        blur: jest.fn()
      }
      document.createElement = jest.fn(() => mockInput)
      document.body.appendChild = jest.fn()
      document.body.removeChild = jest.fn()
      document.execCommand = jest.fn(() => true)

      const row = {
        jobName: 'task1',
        id: '10',
        inNode: { id: '1' },
        outNode: { id: '2' },
        transformNode: { id: '3' }
      }
      vm.copyJobJson({ row })
      const parsed = JSON.parse(mockInput.value)
      expect(parsed.jobName).toBe('task1_COPY_J')
      expect(parsed.id).toBe('')
      expect(vm.$message).toHaveBeenCalled()
    })
  })

  describe('enableAll', () => {
    it('"true" enables all jobs', () => {
      const vm = createVm()
      vm.jobList = [{ enable: 'false' }, { enable: 'false' }]
      vm.enableAll('true')
      vm.jobList.forEach(j => expect(j.enable).toBe('true'))
    })

    it('"false" disables all jobs', () => {
      const vm = createVm()
      vm.jobList = [{ enable: 'true' }, { enable: 'true' }]
      vm.enableAll('false')
      vm.jobList.forEach(j => expect(j.enable).toBe('false'))
    })
  })

  describe('moveUp / moveDown', () => {
    it('moveUp swaps item with the one above', () => {
      const vm = createVm()
      vm.jobList = [{ jobName: 'a' }, { jobName: 'b' }, { jobName: 'c' }]
      vm.moveUp(1, vm.jobList[1])
      expect(vm.jobList[0].jobName).toBe('b')
      expect(vm.jobList[1].jobName).toBe('a')
    })

    it('moveUp on first item shows alert', () => {
      const vm = createVm()
      vm.jobList = [{ jobName: 'a' }]
      const alertSpy = jest.spyOn(global, 'alert').mockImplementation(() => {})
      vm.moveUp(0, vm.jobList[0])
      expect(alertSpy).toHaveBeenCalledWith('已经是第一条，不可上移')
      alertSpy.mockRestore()
    })

    it('moveDown swaps item with the one below', () => {
      const vm = createVm()
      vm.jobList = [{ jobName: 'a' }, { jobName: 'b' }, { jobName: 'c' }]
      vm.moveDown(0, vm.jobList[0])
      expect(vm.jobList[0].jobName).toBe('b')
      expect(vm.jobList[1].jobName).toBe('a')
    })

    it('moveDown on last item shows alert', () => {
      const vm = createVm()
      vm.jobList = [{ jobName: 'a' }]
      const alertSpy = jest.spyOn(global, 'alert').mockImplementation(() => {})
      vm.moveDown(0, vm.jobList[0])
      expect(alertSpy).toHaveBeenCalledWith('已经是最后一条，不可下移')
      alertSpy.mockRestore()
    })
  })

  // =========================================================================
  // 7. Node configuration (8)
  // =========================================================================
  describe('changeOptionsInput', () => {
    it('parses configValue and sets showEditor=1', () => {
      jest.useFakeTimers()
      const vm = createVm()
      vm.optionsInput = [{ propkey: 'db', propvalue: '数据库查询' }]
      vm.exampleData = { in: 'var x;' }
      const data = {
        $index: 0,
        row: {
          jobName: 'job1',
          inNode: { type: 'db', configValue: '{"cron":"0 0 * * *"}' }
        }
      }
      vm.changeOptionsInput(data)
      expect(vm.currentRow).toBe(0)
      expect(vm.inNode.cron).toBe('0 0 * * *')
      // advance timer past the setTimeout(50)
      jest.advanceTimersByTime(100)
      expect(vm.showEditor).toBe(1)
      jest.useRealTimers()
    })
  })

  describe('changeOptionsTransform', () => {
    it('parses configValue and sets showEditor=2', () => {
      jest.useFakeTimers()
      const vm = createVm()
      vm.optionsTransform = [{ propkey: 'js', propvalue: '脚本转换' }]
      vm.exampleData = { transform: 'var t;' }
      const data = {
        $index: 0,
        row: {
          jobName: 'job1',
          transformNode: { type: 'js', configValue: '{"scriptContent":"code"}' }
        }
      }
      vm.changeOptionsTransform(data)
      expect(vm.currentRow).toBe(0)
      expect(vm.transformNode.scriptContent).toBe('code')
      jest.advanceTimersByTime(100)
      expect(vm.showEditor).toBe(2)
      jest.useRealTimers()
    })
  })

  describe('changeOptionsOutput', () => {
    it('parses configValue and sets showEditor=3', () => {
      jest.useFakeTimers()
      const vm = createVm()
      vm.optionsOutput = [{ propkey: 'db', propvalue: '数据库回写' }]
      vm.exampleData = { out: 'var o;' }
      const data = {
        $index: 0,
        row: {
          jobName: 'job1',
          outNode: { type: 'db', configValue: '{"dataSource":"ds1"}' }
        }
      }
      vm.changeOptionsOutput(data)
      expect(vm.currentRow).toBe(0)
      expect(vm.outNode.dataSource).toBe('ds1')
      jest.advanceTimersByTime(100)
      expect(vm.showEditor).toBe(3)
      jest.useRealTimers()
    })
  })

  describe('affirmInNode', () => {
    it('saves when validation passes', () => {
      const vm = createVm()
      vm.$refs.inNodeForm = { validate: jest.fn(cb => cb(true)), clearValidate: jest.fn() }
      vm.$refs.MonAco = { getVal: jest.fn(() => 'SELECT 1'), clearContent: jest.fn() }
      vm.jobList = [{ inNode: { type: 'db', configValue: '{}' } }]
      vm.currentRow = 0
      vm.inNode = { scriptContent: '', cron: '0 0 * * *' }
      vm.affirmInNode()
      const saved = JSON.parse(vm.jobList[0].inNode.configValue)
      expect(saved.scriptContent).toBe('SELECT 1')
      expect(vm.ShowInput_Database).toBe(false)
    })

    it('checks path uniqueness for apiUp type', () => {
      const vm = createVm()
      vm.$refs.inNodeForm = { validate: jest.fn(cb => cb(true)), clearValidate: jest.fn() }
      vm.$refs.MonAco = { getVal: jest.fn(() => 'code'), clearContent: jest.fn() }
      vm.jobList = [
        { inNode: { type: 'apiUp', id: 'node1', configValue: '{}' } }
      ]
      vm.currentRow = 0
      vm.inNode = { path: '/api/test', scriptContent: '' }
      // set path as already used by a different node
      vm.pathMap = new Map([['/api/test', 'node999']])
      vm.affirmInNode()
      expect(vm.$message.error).toHaveBeenCalled()
    })

    it('returns false when script is empty', () => {
      const vm = createVm()
      vm.$refs.inNodeForm = { validate: jest.fn(cb => cb(true)), clearValidate: jest.fn() }
      vm.$refs.MonAco = { getVal: jest.fn(() => ''), clearContent: jest.fn() }
      vm.jobList = [{ inNode: { type: 'db', configValue: '{}' } }]
      vm.currentRow = 0
      vm.inNode = { scriptContent: '' }
      const result = vm.affirmInNode()
      // scriptNotNull will trigger $message and the function returns false
      expect(vm.$message).toHaveBeenCalled()
    })
  })

  describe('affirmTransformNode', () => {
    it('saves transform config when script is non-empty', () => {
      const vm = createVm()
      vm.$refs.MonAcoTransformNode = { getVal: jest.fn(() => 'transform code'), clearContent: jest.fn() }
      vm.jobList = [{ transformNode: { configValue: '{}' } }]
      vm.currentRow = 0
      vm.transformNode = { scriptContent: '' }
      vm.affirmTransformNode()
      const saved = JSON.parse(vm.jobList[0].transformNode.configValue)
      expect(saved.scriptContent).toBe('transform code')
      expect(vm.switchNode).toBe(false)
    })
  })

  describe('affirmOutNode', () => {
    it('saves output config when validation passes', () => {
      const vm = createVm()
      vm.$refs.outNodeForm = { validate: jest.fn(cb => cb(true)) }
      vm.$refs.outMonAco = { getVal: jest.fn(() => 'INSERT INTO'), clearContent: jest.fn() }
      vm.jobList = [{ outNode: { configValue: '{}' } }]
      vm.currentRow = 0
      vm.outNode = { scriptContent: '' }
      vm.affirmOutNode()
      const saved = JSON.parse(vm.jobList[0].outNode.configValue)
      expect(saved.scriptContent).toBe('INSERT INTO')
      expect(vm.Showoutput_Transfer).toBe(false)
    })
  })

  describe('loadDatasourceFields', () => {
    it('returns empty array for null datasourceId', () => {
      const vm = createVm()
      vm.loadDatasourceFields(null)
      expect(vm.currentFields).toEqual([])
      expect(api.getDatasourceFields).not.toHaveBeenCalled()
    })

    it('returns empty array for undefined datasourceId', () => {
      const vm = createVm()
      vm.loadDatasourceFields(undefined)
      expect(vm.currentFields).toEqual([])
    })

    it('returns empty array for empty string datasourceId', () => {
      const vm = createVm()
      vm.loadDatasourceFields('')
      expect(vm.currentFields).toEqual([])
    })

    it('calls API for a valid datasourceId', () => {
      const vm = createVm()
      vm.loadDatasourceFields('ds1')
      expect(api.getDatasourceFields).toHaveBeenCalledWith('ds1')
    })
  })

  describe('setValue', () => {
    it('sets defaultOpts.value and calls monaco.setValue', () => {
      const vm = createVm()
      const monacoRef = {
        $data: { defaultOpts: { value: '' } },
        setValue: jest.fn()
      }
      const node = { scriptContent: 'var x = 1;' }
      vm.setValue(monacoRef, node)
      expect(monacoRef.$data.defaultOpts.value).toBe('var x = 1;')
      expect(monacoRef.setValue).toHaveBeenCalledWith('var x = 1;')
    })
  })

  // =========================================================================
  // 8. Issue & Run task (5)
  // =========================================================================
  describe('issue', () => {
    it('calls issueType then polls getSendStatus until success', function(done) {
      api.issueType.mockResolvedValueOnce({ model: 1 })
      api.getSendStatus.mockResolvedValueOnce({ model: '下发成功' })
      var closeFn = jest.fn()
      var vm = createVm()
      vm.$loading = jest.fn(function() { return { close: closeFn } })
      vm.getData = jest.fn()
      vm.issue('config1')
      // 等待 issueType resolve + 首次 2s 轮询 + getSendStatus resolve
      setTimeout(function() {
        expect(api.issueType).toHaveBeenCalledWith('config1')
        expect(api.getSendStatus).toHaveBeenCalledWith('config1')
        expect(closeFn).toHaveBeenCalled()
        expect(vm.$message).toHaveBeenCalledWith(
          expect.objectContaining({ type: 'success', message: '下发成功!' })
        )
        done()
      }, 2500)
    }, 10000)

    it('shows error when getSendStatus returns failure', function(done) {
      api.issueType.mockResolvedValueOnce({ model: 1 })
      api.getSendStatus.mockResolvedValueOnce({ model: '下发失败' })
      var closeFn = jest.fn()
      var vm = createVm()
      vm.$loading = jest.fn(function() { return { close: closeFn } })
      vm.getData = jest.fn()
      vm.issue('config1')
      setTimeout(function() {
        expect(closeFn).toHaveBeenCalled()
        expect(vm.$message).toHaveBeenCalledWith(
          expect.objectContaining({ type: 'error', message: '下发失败' })
        )
        done()
      }, 2500)
    }, 10000)
  })

  describe('runTask', () => {
    it('calls API and starts pollTaskLog on success', async() => {
      const closeFn = jest.fn()
      Loading.service.mockReturnValue({ text: '', close: closeFn })
      api.runTask.mockResolvedValueOnce({})
      api.getTaskLog.mockResolvedValueOnce({ model: [{ message: 'done' }], totalCount: 1 })

      const vm = createVm()
      vm.reRun = { taskId: 't1', configId: 'c1' }
      vm.runTask()
      await new Promise(r => setTimeout(r, 0))
      expect(api.runTask).toHaveBeenCalledWith(vm.reRun)
    })
  })

  describe('pollTaskLog', () => {
    it('closes loading when logs are returned', async() => {
      api.getTaskLog.mockResolvedValueOnce({
        model: [{ message: 'log entry' }],
        totalCount: 1
      })
      const closeFn = jest.fn()
      const vm = createVm()
      vm.logLoading = { close: closeFn, text: '' }
      vm.pollTaskLog(0)
      await new Promise(r => setTimeout(r, 0))
      expect(vm.logList.length).toBe(1)
      expect(closeFn).toHaveBeenCalled()
    })

    it('retries when logs are empty and retryCount < MAX', async() => {
      jest.useFakeTimers()
      api.getTaskLog.mockResolvedValueOnce({ model: [], totalCount: 0 })
      const closeFn = jest.fn()
      const vm = createVm()
      vm.logLoading = { close: closeFn, text: '' }
      vm.pollTaskLog(0)
      await Promise.resolve() // resolve the API call
      // timeout should have been set
      expect(vm.queryLogTask).toBeDefined()
      jest.useRealTimers()
    })
  })

  describe('clearLogPoll', () => {
    it('clears timeout and closes loading', () => {
      const vm = createVm()
      const closeFn = jest.fn()
      vm.queryLogTask = setTimeout(() => {}, 10000)
      vm.logLoading = { close: closeFn }
      vm.clearLogPoll()
      expect(vm.queryLogTask).toBeNull()
      expect(closeFn).toHaveBeenCalled()
    })
  })

  // =========================================================================
  // 9. Template selection (2)
  // =========================================================================
  describe('templateData', () => {
    it('type=1 stores data without triggering modelShow', () => {
      const vm = createVm()
      const val = { id: 't1', name: 'template1' }
      // mock modelShow to detect if called
      vm.modelShow = jest.fn()
      vm.templateData(val, 1)
      expect(vm.temData).toEqual(val)
      expect(vm.modelShow).not.toHaveBeenCalled()
    })

    it('type=2 stores data and triggers modelShow', () => {
      const vm = createVm()
      const val = { id: 't2', name: 'template2' }
      vm.modelShow = jest.fn()
      vm.templateData(val, 2)
      expect(vm.temData).toEqual(val)
      expect(vm.modelShow).toHaveBeenCalled()
    })
  })

  // =========================================================================
  // 10. Boundary conditions (2)
  // =========================================================================
  describe('boundary conditions', () => {
    it('enableAll on empty jobList does not throw', () => {
      const vm = createVm()
      vm.jobList = []
      expect(() => vm.enableAll('true')).not.toThrow()
      expect(() => vm.enableAll('false')).not.toThrow()
    })

    it('batchSetParams on empty jobList opens dialog and builds empty batchTableData', () => {
      const vm = createVm()
      vm.jobList = []
      vm.optionsInput = []
      vm.optionsOutput = []
      // ![] is false, so the early return is NOT triggered; forEach on [] is a no-op
      expect(() => vm.batchSetParams()).not.toThrow()
      expect(vm.batch_falg).toBe(true)
      expect(vm.batchTableData).toEqual([])
    })

    it('batchSetParams with jobList=null returns early before building batchTableData', () => {
      const vm = createVm()
      vm.jobList = null
      vm.batchTableData = [{ existing: true }]
      vm.batchSetParams()
      expect(vm.batch_falg).toBe(true)
      // batchTableData is NOT reset because the function returned early
      expect(vm.batchTableData).toEqual([{ existing: true }])
    })
  })

  // =========================================================================
  // 11. $confirm cancel path (Expert 2)
  // =========================================================================
  describe('deljobList — cancel path', () => {
    it('keeps jobList unchanged when $confirm is rejected', async() => {
      const vm = createVm()
      vm.jobList = [
        { jobName: 'a' },
        { jobName: 'b' },
        { jobName: 'c' }
      ]
      vm.$confirm = jest.fn(() => Promise.reject(new Error('cancel')))
      vm.deljobList({ $index: 1 })
      await Promise.resolve()
      expect(vm.jobList.length).toBe(3)
      expect(vm.jobList[1].jobName).toBe('b')
    })
  })

  // =========================================================================
  // 12. P0: Core CRUD (edit / subForm / remove / getData)
  // =========================================================================
  describe('edit — add mode (row===0)', () => {
    it('resets form fields, sets defaults, and opens dialog', () => {
      const vm = createVm()
      vm.dialogFormVisible = false
      vm.subFormData = { id: '99', name: 'old', nodeId: 'n1', templateId: 't1', tenantId: '2', templateName: 'tmpl' }
      vm.jobList = [{ jobName: 'leftover' }]
      vm.tableData = [{ key: 'x' }]
      // stub sortable initialisers (they use $refs that don't exist here)
      vm.initParamSortable = jest.fn()
      vm.initJobSortable = jest.fn()
      vm.clearValidate = jest.fn()
      vm.edit(0)
      // subFormData should be reset then set with defaults
      expect(vm.subFormData.templateName).toBe('自定义')
      expect(vm.subFormData.templateId).toBe(0)
      expect(vm.subFormData.tenantId).toBe('1') // cur_user.tenantId
      expect(vm.subFormData.id).toBeNull()
      expect(vm.jobList).toEqual([])
      expect(vm.tableData).toEqual([])
      expect(vm.dialogFormVisible).toBe(true)
    })
  })

  describe('edit — edit mode (row object)', () => {
    it('calls getIdRow, parses JSON, fills subFormData and rebuilds pathMap', async() => {
      const editData = {
        id: '42',
        name: 'TestConfig',
        nodeId: 'node1',
        templateId: 'tmpl1',
        templateName: 'Template1',
        tenantId: 5,
        configValue: '[]',
        jobList: [
          {
            jobName: 'job1',
            inNode: { type: 'apiUp', id: 'in1', configValue: '{"path":"/api/v1"}' },
            outNode: { type: 'db', id: 'out1', configValue: '{}' },
            transformNode: { type: 'js', id: 't1', configValue: '{}' }
          }
        ]
      }
      api.getIdRow.mockResolvedValueOnce({ model: JSON.stringify(editData) })

      const vm = createVm()
      vm.initParamSortable = jest.fn()
      vm.initJobSortable = jest.fn()
      vm.clearValidate = jest.fn()

      await vm.edit({ id: '42' })

      expect(api.getIdRow).toHaveBeenCalledWith('42')
      expect(vm.subFormData.id).toBe('42')
      expect(vm.subFormData.name).toBe('TestConfig')
      expect(vm.subFormData.tenantId).toBe('5')
      expect(vm.jobList.length).toBe(1)
      expect(vm.pathMap.get('/api/v1')).toBe('in1')
      expect(vm.dialogFormVisible).toBe(true)
    })

    it('edit mode with pluginsList populates fileList and fileMap', async() => {
      const editData = {
        id: '50',
        name: 'WithPlugins',
        nodeId: 'n2',
        templateId: 't2',
        templateName: 'T2',
        tenantId: 3,
        configValue: '[]',
        jobList: [],
        pluginsList: [
          { name: 'plugin.js', fileUrl: 'http://example.com/plugin.js' }
        ]
      }
      api.getIdRow.mockResolvedValueOnce({ model: JSON.stringify(editData) })

      const vm = createVm()
      vm.initParamSortable = jest.fn()
      vm.initJobSortable = jest.fn()
      vm.clearValidate = jest.fn()

      await vm.edit({ id: '50' })

      expect(vm.fileList.length).toBe(1)
      expect(vm.fileList[0].name).toBe('plugin.js')
      expect(vm.fileMap['plugin.js']).toBe('http://example.com/plugin.js')
    })
  })

  describe('subForm — save flow', () => {
    it('validate success: calls submitForm then getIdRow to rebuild pathMap', async() => {
      api.submitForm.mockResolvedValueOnce({ model: '123' })
      api.getIdRow.mockResolvedValueOnce({
        model: JSON.stringify({
          jobList: [
            {
              jobName: 'j1',
              inNode: { type: 'apiUp', id: 'in1', configValue: '{"path":"/v1"}' },
              outNode: { type: 'db', id: 'out1', configValue: '{}' },
              transformNode: { type: 'js', id: 't1', configValue: '{}' }
            }
          ]
        })
      })

      const vm = createVm()
      vm.subFormData = { id: null, name: 'test' }
      vm.jobList = []
      vm.tableData = []
      vm.$refs.configForm = {
        validate: jest.fn(cb => cb(true))
      }
      vm.$refs.pluginsUpload = { uploadFiles: [] }
      vm.getData = jest.fn()

      vm.subForm('configForm')
      await new Promise(r => setTimeout(r, 0))

      expect(api.submitForm).toHaveBeenCalled()
      expect(vm.subFormData.id).toBe('123')
      expect(vm.$message.success).toHaveBeenCalledWith('保存成功')
    })

    it('validate failure: does not call submitForm', () => {
      const vm = createVm()
      vm.$refs.configForm = {
        validate: jest.fn(cb => cb(false))
      }
      vm.$refs.pluginsUpload = { uploadFiles: [] }

      vm.subForm('configForm')

      expect(api.submitForm).not.toHaveBeenCalled()
    })
  })

  describe('remove', () => {
    it('confirmed deletion: calls singleDelete then refreshes list', async() => {
      api.singleDelete.mockResolvedValueOnce({})
      const vm = createVm()
      vm.$confirm = jest.fn(() => Promise.resolve())
      vm.getData = jest.fn()

      vm.remove({ id: '77' })
      await new Promise(r => setTimeout(r, 0))

      expect(api.singleDelete).toHaveBeenCalledWith('77')
      expect(vm.$message.success).toHaveBeenCalledWith(expect.objectContaining({ message: '删除成功' }))
    })

    it('cancelled deletion: does not call API', async() => {
      const vm = createVm()
      vm.$confirm = jest.fn(() => Promise.reject(new Error('cancel')))

      vm.remove({ id: '77' })
      await new Promise(r => setTimeout(r, 0))

      expect(api.singleDelete).not.toHaveBeenCalled()
    })
  })

  describe('getData', () => {
    it('calls getPage and populates resData', async() => {
      api.getPage.mockResolvedValueOnce({
        model: [{ id: '1', name: 'row1' }],
        currentPage: 1,
        pageSize: 10,
        totalCount: 1
      })
      const vm = createVm()
      vm.getData()
      await new Promise(r => setTimeout(r, 0))

      expect(api.getPage).toHaveBeenCalled()
      expect(vm.datas.resData.rows).toEqual([{ id: '1', name: 'row1' }])
      expect(vm.datas.resData.totalCount).toBe(1)
      expect(vm.datas.table.loading).toBe(false)
    })
  })

  // =========================================================================
  // 13. P0: pathMap completeness (affirmInNode)
  // =========================================================================
  describe('affirmInNode — pathMap scenarios', () => {
    it('same node updates its own path (nodeId matches, save succeeds)', () => {
      const vm = createVm()
      vm.$refs.inNodeForm = { validate: jest.fn(cb => cb(true)), clearValidate: jest.fn() }
      vm.$refs.MonAco = { getVal: jest.fn(() => 'SELECT 1'), clearContent: jest.fn() }
      vm.jobList = [{ inNode: { type: 'apiUp', id: 'node1', configValue: '{}' } }]
      vm.currentRow = 0
      vm.inNode = { path: '/api/test', scriptContent: '' }
      // path already registered by the SAME node
      vm.pathMap = new Map([['/api/test', 'node1']])
      vm.affirmInNode()
      // should NOT show error, save should succeed
      expect(vm.$message.error).not.toHaveBeenCalled()
      expect(vm.ShowInput_Database).toBe(false)
      // pathMap should still have the entry
      expect(vm.pathMap.get('/api/test')).toBe('node1')
    })

    it('new node uses placeholder -99 when path is fresh', () => {
      const vm = createVm()
      vm.$refs.inNodeForm = { validate: jest.fn(cb => cb(true)), clearValidate: jest.fn() }
      vm.$refs.MonAco = { getVal: jest.fn(() => 'SELECT 1'), clearContent: jest.fn() }
      vm.jobList = [{ inNode: { type: 'apiUp', id: undefined, configValue: '{}' } }]
      vm.currentRow = 0
      vm.inNode = { path: '/api/new', scriptContent: '' }
      vm.pathMap = new Map()
      vm.affirmInNode()
      // nodeId was undefined so pathMap.get returns undefined → set to -99
      expect(vm.pathMap.get('/api/new')).toBe(-99)
      expect(vm.$message.error).not.toHaveBeenCalled()
    })

    it('non-apiUp type does not trigger pathMap check', () => {
      const vm = createVm()
      vm.$refs.inNodeForm = { validate: jest.fn(cb => cb(true)), clearValidate: jest.fn() }
      vm.$refs.MonAco = { getVal: jest.fn(() => 'SELECT 1'), clearContent: jest.fn() }
      vm.jobList = [{ inNode: { type: 'db', id: 'node1', configValue: '{}' } }]
      vm.currentRow = 0
      vm.inNode = { path: '/api/test', scriptContent: '' }
      // even if pathMap has conflicting entry, it should be ignored for non-apiUp
      vm.pathMap = new Map([['/api/test', 'other-node']])
      vm.affirmInNode()
      expect(vm.$message.error).not.toHaveBeenCalled()
      expect(vm.ShowInput_Database).toBe(false)
    })
  })

  // =========================================================================
  // 14. P1: Template / Batch / Import
  // =========================================================================
  describe('modelShow', () => {
    it('loads template content and replaces jobList/tableData/pathMap', async() => {
      const templateRes = {
        jobList: [
          {
            jobName: 'tj1',
            inNode: { type: 'apiUp', id: 'tin1', configValue: '{"path":"/tmpl/v1"}' },
            outNode: { type: 'db', configValue: '{}' },
            transformNode: { type: 'js', configValue: '{}' }
          }
        ],
        configValue: '[{"key":"p1","value":"v1"}]'
      }
      api.getTemplateContent.mockResolvedValueOnce(templateRes)

      const vm = createVm()
      vm.temData = { id: 'tmpl1', name: 'Template1' }
      vm.modelShow()
      await new Promise(r => setTimeout(r, 0))

      expect(api.getTemplateContent).toHaveBeenCalledWith('tmpl1')
      expect(vm.subFormData.templateName).toBe('Template1')
      expect(vm.subFormData.templateId).toBe('tmpl1')
      expect(vm.jobList.length).toBe(1)
      expect(vm.tableData).toEqual([expect.objectContaining({ key: 'p1', value: 'v1' })])
      expect(vm.pathMap.get('/tmpl/v1')).toBe('tin1')
      expect(vm.ShowMoule).toBe(false)
    })

    it('handles configValue=null by setting tableData to empty array', async() => {
      api.getTemplateContent.mockResolvedValueOnce({
        jobList: [],
        configValue: null
      })
      const vm = createVm()
      vm.temData = { id: 'tmpl2', name: 'Empty' }
      vm.modelShow()
      await new Promise(r => setTimeout(r, 0))

      expect(vm.tableData).toEqual([])
    })
  })

  describe('batchSetConfirm', () => {
    it('updates dataSource in configValue for matching node types', () => {
      const vm = createVm()
      vm.jobList = [
        {
          inNode: { classify: 'in', type: 'db', configValue: '{"dataSource":"old_in"}' },
          outNode: { classify: 'out', type: 'db', configValue: '{"dataSource":"old_out"}' }
        }
      ]
      vm.batchTableData = [
        { nodeType: 'in', sourceType: 'db', dataSource: 'new_in_ds' },
        { nodeType: 'out', sourceType: 'db', dataSource: 'new_out_ds' }
      ]
      vm.batchSetConfirm()

      const inConf = JSON.parse(vm.jobList[0].inNode.configValue)
      const outConf = JSON.parse(vm.jobList[0].outNode.configValue)
      expect(inConf.dataSource).toBe('new_in_ds')
      expect(outConf.dataSource).toBe('new_out_ds')
      expect(vm.batch_falg).toBe(false)
      expect(vm.$message).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'success' })
      )
    })
  })

  describe('importFile', () => {
    it('parses JSON file and replaces jobList and tableData', () => {
      jest.useFakeTimers()
      const fileContent = JSON.stringify({
        jobList: [{ jobName: 'imported', inNode: {}, outNode: {}, transformNode: {} }],
        configValue: '[{"key":"ik","value":"iv"}]'
      })
      const mockReader = {
        readAsText: jest.fn(),
        result: fileContent,
        onload: null
      }
      const origFileReader = global.FileReader
      global.FileReader = jest.fn(() => mockReader)

      const closeFn = jest.fn()
      Loading.service.mockReturnValue({ close: closeFn })

      const vm = createVm()
      vm.$refs.impUpload = { clearFiles: jest.fn() }
      vm.importFile({ raw: new Blob([fileContent]) })

      // Trigger the onload callback
      mockReader.onload()

      expect(vm.jobList.length).toBe(1)
      expect(vm.jobList[0].jobName).toBe('imported')
      expect(vm.tableData).toEqual([expect.objectContaining({ key: 'ik', value: 'iv' })])
      expect(vm.import_flag).toBe(false)

      // advance past the setTimeout(1000)
      jest.advanceTimersByTime(1100)
      expect(closeFn).toHaveBeenCalled()

      global.FileReader = origFileReader
    })
  })

  describe('beforeUpload', () => {
    it('rejects non-.js files and returns false', () => {
      const vm = createVm()
      vm.$notify = { warning: jest.fn() }
      const file = { name: 'data.csv', size: 1024 }
      const result = vm.beforeUpload(file)
      expect(result).toBe(false)
    })

    it('rejects files larger than 5MB and returns false', () => {
      const vm = createVm()
      vm.$notify = { warning: jest.fn() }
      const file = { name: 'big.js', size: 6 * 1024 * 1024 }
      const result = vm.beforeUpload(file)
      expect(result).toBe(false)
    })
  })

  describe('getTaskLog', () => {
    it('calls API and sets logList and totalCount', async() => {
      api.getTaskLog.mockResolvedValueOnce({
        model: [{ message: 'entry1' }, { message: 'entry2' }],
        totalCount: 2
      })
      const vm = createVm()
      vm.getTaskLog()
      await new Promise(r => setTimeout(r, 0))

      expect(api.getTaskLog).toHaveBeenCalledWith(vm.log)
      expect(vm.logList.length).toBe(2)
      expect(vm.log.totalCount).toBe(2)
    })
  })

  describe('runAgain', () => {
    it('sets reRun fields and opens rerun dialog', () => {
      const vm = createVm()
      vm.subFormData.id = 'config99'
      const data = { row: { id: 'task55', jobName: 'myJob' } }
      vm.runAgain(data)

      expect(vm.reRun.taskId).toBe('task55')
      expect(vm.reRun.configId).toBe('config99')
      expect(vm.logList).toEqual([])
      expect(vm.log.taskId).toBe('task55')
      expect(vm.foot_job_name).toBe('myJob')
      expect(vm.rerun_falg).toBe(true)
    })
  })

  // =========================================================================
  // 15b. Additional P1 edge cases
  // =========================================================================
  describe('modelShow — with pluginsList', () => {
    it('populates fileList and fileMap from template plugins', async() => {
      api.getTemplateContent.mockResolvedValueOnce({
        jobList: [],
        configValue: null,
        pluginsList: [
          { name: 'helper.js', fileUrl: 'http://cdn/helper.js' },
          { name: 'util.js', fileUrl: 'http://cdn/util.js' }
        ]
      })
      const vm = createVm()
      vm.temData = { id: 'tmpl3', name: 'WithPlugins' }
      vm.modelShow()
      await new Promise(r => setTimeout(r, 0))

      expect(vm.fileList.length).toBe(2)
      expect(vm.fileList[0].name).toBe('helper.js')
      expect(vm.fileMap['util.js']).toBe('http://cdn/util.js')
    })
  })

  describe('pollTaskLog — max retries in success (empty logs) path', () => {
    it('closes loading when MAX_RETRIES reached with empty logs', async() => {
      api.getTaskLog.mockResolvedValueOnce({ model: [], totalCount: 0 })
      const closeFn = jest.fn()
      const vm = createVm()
      vm.logLoading = { close: closeFn, text: '' }

      vm.pollTaskLog(5) // retryCount === MAX_RETRIES
      await Promise.resolve()
      await Promise.resolve()

      expect(closeFn).toHaveBeenCalled()
    })
  })

  describe('subForm — pathMap rebuild after save', () => {
    it('rebuilds pathMap from getIdRow response with apiUp nodes', async() => {
      api.submitForm.mockResolvedValueOnce({ model: '200' })
      api.getIdRow.mockResolvedValueOnce({
        model: JSON.stringify({
          jobList: [
            {
              jobName: 'j1',
              inNode: { type: 'apiUp', id: 'in1', configValue: '{"path":"/rebuilt/v1"}' },
              outNode: { type: 'db', id: 'out1', configValue: '{}' },
              transformNode: { type: 'js', id: 't1', configValue: '{}' }
            },
            {
              jobName: 'j2',
              inNode: { type: 'db', id: 'in2', configValue: '{}' },
              outNode: { type: 'db', id: 'out2', configValue: '{}' },
              transformNode: { type: 'js', id: 't2', configValue: '{}' }
            }
          ]
        })
      })

      const vm = createVm()
      vm.subFormData = { id: null, name: 'rebuild-test' }
      vm.jobList = []
      vm.tableData = []
      vm.$refs.configForm = { validate: jest.fn(cb => cb(true)) }
      vm.$refs.pluginsUpload = { uploadFiles: [] }
      vm.getData = jest.fn()

      vm.subForm('configForm')
      // wait for submitForm + getIdRow chain
      await new Promise(r => setTimeout(r, 50))

      expect(vm.pathMap.get('/rebuilt/v1')).toBe('in1')
      // db type node should NOT be in pathMap
      expect(vm.pathMap.has('in2')).toBe(false)
    })
  })

  describe('batchSetParams — with populated jobList', () => {
    it('builds batchTableData with unique input and output types', () => {
      const vm = createVm()
      vm.optionsInput = [
        { propkey: 'db', propvalue: '数据库查询' },
        { propkey: 'apiUp', propvalue: 'API上报' }
      ]
      vm.optionsOutput = [
        { propkey: 'db', propvalue: '数据库回写' }
      ]
      vm.jobList = [
        { inNode: { type: 'db' }, outNode: { type: 'db' } },
        { inNode: { type: 'apiUp' }, outNode: { type: 'db' } },
        { inNode: { type: 'db' }, outNode: { type: 'db' } }
      ]
      vm.batchSetParams()

      expect(vm.batch_falg).toBe(true)
      // 2 unique input types + 1 unique output type = 3 rows
      expect(vm.batchTableData.length).toBe(3)
      expect(vm.batchTableData[0].nodeType).toBe('in')
      expect(vm.batchTableData[2].nodeType).toBe('out')
    })
  })

  // =========================================================================
  // 16. P1: Error branches
  // =========================================================================
  describe('issue — API error branch', () => {
    it('closes loading when issueType is rejected (e.g. 550 duplicate)', async() => {
      api.issueType.mockRejectedValueOnce(new Error('配置正在下发中，请勿重复操作'))
      var closeFn = jest.fn()
      var vm = createVm()
      vm.$loading = jest.fn(function() { return { close: closeFn } })
      vm.issue('config1')
      await new Promise(function(r) { setTimeout(r, 0) })

      expect(closeFn).toHaveBeenCalled()
    })
  })

  describe('runTask — API error branch', () => {
    it('closes loading and shows error on rejection', async() => {
      const closeFn = jest.fn()
      Loading.service.mockReturnValue({ text: '', close: closeFn })
      api.runTask.mockRejectedValueOnce(new Error('fail'))

      const vm = createVm()
      vm.reRun = { taskId: 't1', configId: 'c1' }
      vm.runTask()
      await new Promise(r => setTimeout(r, 0))

      expect(closeFn).toHaveBeenCalled()
      expect(vm.$message.error).toHaveBeenCalledWith('补数请求失败')
    })
  })

  describe('pollTaskLog — catch branch retries', () => {
    it('retries on API error when retryCount < MAX', async() => {
      jest.useFakeTimers()
      api.getTaskLog.mockRejectedValueOnce(new Error('timeout'))
      const closeFn = jest.fn()
      const vm = createVm()
      vm.logLoading = { close: closeFn, text: '' }

      vm.pollTaskLog(0)
      await Promise.resolve() // let the catch run
      await Promise.resolve() // extra tick for catch handler

      // should have set a retry timeout, not closed loading
      expect(vm.queryLogTask).toBeDefined()
      expect(closeFn).not.toHaveBeenCalled()
    })

    it('closes loading when MAX_RETRIES reached in catch', async() => {
      api.getTaskLog.mockRejectedValueOnce(new Error('timeout'))
      const closeFn = jest.fn()
      const vm = createVm()
      vm.logLoading = { close: closeFn, text: '' }

      vm.pollTaskLog(5) // retryCount === MAX_RETRIES
      await Promise.resolve()
      await Promise.resolve()

      expect(closeFn).toHaveBeenCalled()
    })
  })

  describe('handleSizeChange / handleCurrentChange', () => {
    it('handleSizeChange updates pageSize and calls getTaskLog', async() => {
      api.getTaskLog.mockResolvedValueOnce({ model: [], totalCount: 0 })
      const vm = createVm()
      vm.handleSizeChange(50)
      expect(vm.log.pageSize).toBe(50)
      await new Promise(r => setTimeout(r, 0))
      expect(api.getTaskLog).toHaveBeenCalled()
    })

    it('handleCurrentChange updates currentPage and calls getTaskLog', async() => {
      api.getTaskLog.mockResolvedValueOnce({ model: [], totalCount: 0 })
      const vm = createVm()
      vm.handleCurrentChange(3)
      expect(vm.log.currentPage).toBe(3)
      await new Promise(r => setTimeout(r, 0))
      expect(api.getTaskLog).toHaveBeenCalled()
    })
  })
})
