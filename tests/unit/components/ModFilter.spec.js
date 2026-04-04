/**
 * ModFilter/index.vue -- method-level unit tests
 *
 * ModFilter is the universal CRUD data-table component used by most views.
 * It wraps Element UI <el-table> + <el-pagination> + filter form.
 * Because it depends heavily on Element UI and slot rendering, we test at
 * the method / computed level rather than attempting a full shallowMount.
 */

// ---------------------------------------------------------------------------
// Mocks (must come before any import that touches these modules)
// ---------------------------------------------------------------------------
jest.mock('@/utils', () => ({
  getReqModel: jest.fn((datas) => datas.params)
}))

// ---------------------------------------------------------------------------
// Import after mocks
// ---------------------------------------------------------------------------
const Component = require('@/components/ModFilter/index.vue').default
const { getReqModel } = require('@/utils')

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const methods = Component.methods

/** Build a minimal datas prop that satisfies ModFilter */
function createDatas(overrides) {
  return {
    noFilter: false,
    noPage: false,
    nosubmit: false,
    noresetForm: false,
    noInit: true, // prevent created() from calling onSubmit
    filterList: [
      {
        prop: 'name',
        label: 'Name',
        type: 'input',
        name: null,
        conditionshow: true,
        filedShow: true,
        placeholder: 'Enter name'
      },
      {
        prop: 'status',
        label: 'Status',
        type: 'select',
        status: null,
        conditionshow: true,
        filedShow: true,
        placeholder: 'Select status',
        optList: [
          { label: 'Active', value: '1' },
          { label: 'Inactive', value: '0' }
        ]
      }
    ],
    params: {
      currentPage: 1,
      pageSize: 10,
      sortField: null,
      sortOrder: null
    },
    resData: {
      rows: [],
      totalCount: 0,
      currentPage: 1,
      pageSize: 10
    },
    multipleSelection: [],
    table: {
      loading: false,
      selection: false,
      orderNo: false
    },
    ...overrides
  }
}

/** Build a minimal `this` (vm) context for method calls */
function createVm(datasOverrides) {
  const datas = createDatas(datasOverrides)
  const vm = {
    datas,
    census: '',
    pickerOptions2: {},
    searchCon: [],
    showFiled: [],
    $emit: jest.fn(),
    $set: jest.fn((obj, key, val) => { obj[key] = val }),
    $refs: {
      datas: {
        model: datas
      }
    },
    $store: {
      dispatch: jest.fn(() => Promise.resolve({ data: [] }))
    }
  }
  // Bind all methods to vm so internal calls work
  Object.keys(methods).forEach(name => {
    vm[name] = methods[name].bind(vm)
  })
  return vm
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe('ModFilter/index.vue', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  // =========================================================================
  // 1. Component definition
  // =========================================================================
  describe('component definition', () => {
    it('has the correct props definition', () => {
      expect(Component.props).toBeDefined()
      expect(Component.props.datas).toBeDefined()
      expect(Component.props.datas.type).toBe(Object)
    })

    it('props.datas default returns empty object', () => {
      const defaultFn = Component.props.datas.default
      expect(typeof defaultFn).toBe('function')
      const result = defaultFn()
      expect(result).toEqual({})
    })

    it('data() returns correct initial state', () => {
      const data = Component.data()
      expect(data.census).toBe('')
      expect(data.searchCon).toEqual([])
      expect(data.showFiled).toEqual([])
      expect(data.pickerOptions2).toBeDefined()
      expect(data.pickerOptions2.shortcuts).toHaveLength(3)
    })
  })

  // =========================================================================
  // 2. Computed properties
  // =========================================================================
  describe('computed properties', () => {
    it('listRowSize returns 6 when no daterange filter', () => {
      const vm = createVm()
      const result = Component.computed.listRowSize.call(vm)
      expect(result).toBe(6)
    })

    it('listRowSize returns 8 when daterange filter exists at index > 0', () => {
      const vm = createVm({
        filterList: [
          { prop: 'name', label: 'Name', type: 'input', name: null, conditionshow: true, filedShow: true },
          { prop: 'dates', label: 'Date', type: 'daterange', dateProp: 'dateRange', dateRange: [], conditionshow: true, filedShow: true, props: ['startDate', 'endDate'] }
        ]
      })
      const result = Component.computed.listRowSize.call(vm)
      expect(result).toBe(8)
    })

    it('filterConditions groups visible filters into rows of 4 (when listRowSize=6)', () => {
      const filters = []
      for (let i = 0; i < 6; i++) {
        filters.push({
          prop: `f${i}`, label: `F${i}`, type: 'input', [`f${i}`]: null,
          conditionshow: true, filedShow: true
        })
      }
      const vm = createVm({ filterList: filters })
      // We need listRowSize to be available; bind the computed
      vm.listRowSize = Component.computed.listRowSize.call(vm)
      const pages = Component.computed.filterConditions.call(vm)
      // 6 items at 4 per row = 2 rows
      expect(pages).toHaveLength(2)
      expect(pages[0]).toHaveLength(4)
      expect(pages[1]).toHaveLength(2)
    })

    it('filterConditions excludes items where conditionshow is false', () => {
      const vm = createVm({
        filterList: [
          { prop: 'a', label: 'A', type: 'input', a: null, conditionshow: true, filedShow: true },
          { prop: 'b', label: 'B', type: 'input', b: null, conditionshow: false, filedShow: true },
          { prop: 'c', label: 'C', type: 'input', c: null, conditionshow: true, filedShow: true }
        ]
      })
      vm.listRowSize = 6
      const pages = Component.computed.filterConditions.call(vm)
      const allItems = pages.flat()
      expect(allItems).toHaveLength(2)
      expect(allItems.map(i => i.prop)).toEqual(['a', 'c'])
    })

    it('searchDisplay filters out items with isSearchHide', () => {
      const vm = createVm({
        filterList: [
          { prop: 'a', label: 'A', isSearchHide: false },
          { prop: 'b', label: 'B', isSearchHide: true },
          { prop: 'c', label: 'C' }
        ]
      })
      const result = Component.computed.searchDisplay.call(vm)
      expect(result).toHaveLength(2)
      expect(result.map(i => i.prop)).toEqual(['a', 'c'])
    })

    it('tableField returns only filedShow items without just restriction', () => {
      const vm = createVm({
        filterList: [
          { prop: 'a', filedShow: true },
          { prop: 'b', filedShow: false },
          { prop: 'c', filedShow: true, just: { field: true } },
          { prop: 'd', filedShow: true, just: {} } // just without field -> excluded
        ]
      })
      const result = Component.computed.tableField.call(vm)
      expect(result.map(i => i.prop)).toEqual(['a', 'c'])
    })
  })

  // =========================================================================
  // 3. onSubmit (search)
  // =========================================================================
  describe('onSubmit', () => {
    it('emits query event with datas and request model', () => {
      const vm = createVm()
      vm.onSubmit()
      expect(vm.$emit).toHaveBeenCalledWith('query', vm.datas, vm.datas.params)
      expect(getReqModel).toHaveBeenCalledWith(vm.datas)
    })
  })

  // =========================================================================
  // 4. resetForm
  // =========================================================================
  describe('resetForm', () => {
    it('clears filter values via $set', () => {
      const vm = createVm()
      // Set some filter values
      vm.datas.filterList[0].name = 'test-value'
      vm.datas.filterList[1].status = '1'

      vm.resetForm('datas')

      // $set should have been called for each filter item with prop
      expect(vm.$set).toHaveBeenCalled()
      // Verify $set was called to null out the prop values
      const setCalls = vm.$set.mock.calls
      const propResets = setCalls.filter(c => c[2] === null)
      expect(propResets.length).toBeGreaterThanOrEqual(2)
    })

    it('clears daterange values to empty array', () => {
      const vm = createVm({
        filterList: [
          {
            prop: 'dates',
            label: 'Date Range',
            type: 'daterange',
            dateProp: 'dateRange',
            dateRange: ['2026-01-01', '2026-03-31'],
            conditionshow: true,
            filedShow: true,
            props: ['startDate', 'endDate']
          }
        ]
      })
      // Update $refs model to match
      vm.$refs.datas.model = vm.datas

      vm.resetForm('datas')

      // $set should be called to clear dateRange to []
      const setCalls = vm.$set.mock.calls
      const dateResets = setCalls.filter(c => Array.isArray(c[2]) && c[2].length === 0)
      expect(dateResets.length).toBeGreaterThanOrEqual(1)
    })
  })

  // =========================================================================
  // 5. Pagination — handleSizeChange
  // =========================================================================
  describe('handleSizeChange', () => {
    it('updates pageSize and emits query', () => {
      const vm = createVm()
      vm.handleSizeChange(20)

      expect(vm.datas.params.pageSize).toBe(20)
      expect(vm.$emit).toHaveBeenCalledWith('query', vm.datas, vm.datas.params)
      expect(getReqModel).toHaveBeenCalledWith(vm.datas)
    })
  })

  // =========================================================================
  // 6. Pagination — handleCurrentChange
  // =========================================================================
  describe('handleCurrentChange', () => {
    it('updates currentPage and emits query', () => {
      const vm = createVm()
      vm.handleCurrentChange(3)

      expect(vm.datas.params.currentPage).toBe(3)
      expect(vm.$emit).toHaveBeenCalledWith('query', vm.datas, vm.datas.params)
      expect(getReqModel).toHaveBeenCalledWith(vm.datas)
    })
  })

  // =========================================================================
  // 7. Selection — handleSelectionChange
  // =========================================================================
  describe('handleSelectionChange', () => {
    it('updates multipleSelection on datas', () => {
      const vm = createVm()
      const selected = [{ id: 1 }, { id: 2 }]

      vm.handleSelectionChange(selected)

      expect(vm.datas.multipleSelection).toBe(selected)
    })

    it('handles empty selection', () => {
      const vm = createVm()
      vm.datas.multipleSelection = [{ id: 1 }]

      vm.handleSelectionChange([])

      expect(vm.datas.multipleSelection).toEqual([])
    })
  })

  // =========================================================================
  // 8. Row/Cell click events
  // =========================================================================
  describe('rowClick', () => {
    it('emits rowClick event with row data', () => {
      const vm = createVm()
      const row = { id: 1, name: 'Test' }

      vm.rowClick(row, {}, {})

      expect(vm.$emit).toHaveBeenCalledWith('rowClick', row)
    })
  })

  describe('cellClick', () => {
    it('emits cellClick event with row and column', () => {
      const vm = createVm()
      const row = { id: 1 }
      const column = { property: 'name' }

      vm.cellClick(row, column, {}, {})

      expect(vm.$emit).toHaveBeenCalledWith('cellClick', row, column)
    })
  })

  // =========================================================================
  // 9. Sort — sortHandler
  // =========================================================================
  describe('sortHandler', () => {
    it('sets sortField and sortOrder for ascending', () => {
      const vm = createVm()

      vm.sortHandler({ column: {}, prop: 'name', order: 'ascending' })

      expect(vm.datas.params.sortField).toBe('name')
      expect(vm.datas.params.sortOrder).toBe('asc')
      expect(vm.$emit).toHaveBeenCalledWith('query', vm.datas, vm.datas.params)
    })

    it('sets sortField and sortOrder for descending', () => {
      const vm = createVm()

      vm.sortHandler({ column: {}, prop: 'created', order: 'descending' })

      expect(vm.datas.params.sortField).toBe('created')
      expect(vm.datas.params.sortOrder).toBe('desc')
      expect(vm.$emit).toHaveBeenCalledWith('query', vm.datas, vm.datas.params)
    })

    it('clears sort when order is null (cancel sort)', () => {
      const vm = createVm()
      vm.datas.params.sortField = 'name'
      vm.datas.params.sortOrder = 'asc'

      vm.sortHandler({ column: {}, prop: 'name', order: null })

      expect(vm.datas.params.sortField).toBeNull()
      expect(vm.datas.params.sortOrder).toBeNull()
      expect(vm.$emit).toHaveBeenCalledWith('query', vm.datas, vm.datas.params)
    })
  })

  // =========================================================================
  // 10. changeSearchCondition
  // =========================================================================
  describe('changeSearchCondition', () => {
    it('updates conditionshow for matching filter item', () => {
      const vm = createVm()

      vm.changeSearchCondition(false, { target: { value: 'name' } })

      const item = vm.datas.filterList.find(f => f.prop === 'name')
      expect(item.conditionshow).toBe(false)
    })

    it('does not affect other filter items', () => {
      const vm = createVm()

      vm.changeSearchCondition(false, { target: { value: 'name' } })

      const statusItem = vm.datas.filterList.find(f => f.prop === 'status')
      expect(statusItem.conditionshow).toBe(true)
    })
  })

  // =========================================================================
  // 11. changeTableFiled
  // =========================================================================
  describe('changeTableFiled', () => {
    it('updates filedShow for matching filter item', () => {
      const vm = createVm()

      vm.changeTableFiled(false, { target: { value: 'status' } })

      const item = vm.datas.filterList.find(f => f.prop === 'status')
      expect(item.filedShow).toBe(false)
    })
  })

  // =========================================================================
  // 12. changeDaterange
  // =========================================================================
  describe('changeDaterange', () => {
    it('does nothing when date value is truthy', () => {
      const vm = createVm({
        filterList: [
          {
            prop: 'dates', label: 'Date', type: 'daterange',
            dateProp: 'dateRange', dateRange: ['2026-01-01', '2026-03-31'],
            conditionshow: true, filedShow: true,
            props: ['startDate', 'endDate']
          }
        ]
      })

      vm.changeDaterange(['2026-01-01', '2026-03-31'])

      expect(vm.$set).not.toHaveBeenCalled()
    })

    it('clears daterange props when date is null', () => {
      const vm = createVm({
        filterList: [
          {
            prop: 'dates', label: 'Date', type: 'daterange',
            dateProp: 'dateRange', dateRange: ['2026-01-01', '2026-03-31'],
            conditionshow: true, filedShow: true,
            props: ['startDate', 'endDate']
          }
        ]
      })

      vm.changeDaterange(null)

      // $set should be called to null out both props
      expect(vm.$set).toHaveBeenCalledTimes(2)
      expect(vm.$set).toHaveBeenCalledWith(
        vm.datas.filterList[0], 'startDate', null
      )
      expect(vm.$set).toHaveBeenCalledWith(
        vm.datas.filterList[0], 'endDate', null
      )
    })
  })

  // =========================================================================
  // 13. headerClick
  // =========================================================================
  describe('headerClick', () => {
    it('toggles show property on matching filter item', () => {
      const vm = createVm()
      vm.datas.filterList[0].show = false

      vm.headerClick({ property: 'name' }, {})

      expect(vm.datas.filterList[0].show).toBe(true)
    })

    it('does nothing when column has no matching filter', () => {
      const vm = createVm()
      // should not throw
      vm.headerClick({ property: 'nonexistent' }, {})
    })
  })

  // =========================================================================
  // 14. buildArg
  // =========================================================================
  describe('buildArg', () => {
    it('returns the first argument as-is', () => {
      const vm = createVm()
      expect(vm.buildArg('hello', 'world')).toBe('hello')
      expect(vm.buildArg(42, 'x')).toBe(42)
      expect(vm.buildArg(null, 'a')).toBeNull()
    })
  })

  // =========================================================================
  // 15. pickerOptions2 shortcuts
  // =========================================================================
  describe('pickerOptions2 shortcuts', () => {
    it('has three date-range shortcuts', () => {
      const data = Component.data()
      const shortcuts = data.pickerOptions2.shortcuts
      expect(shortcuts).toHaveLength(3)
      expect(shortcuts[0].text).toBe('最近一周')
      expect(shortcuts[1].text).toBe('最近一个月')
      expect(shortcuts[2].text).toBe('最近三个月')
    })

    it('shortcuts emit correct date ranges', () => {
      const data = Component.data()
      const shortcuts = data.pickerOptions2.shortcuts
      const now = Date.now()

      shortcuts.forEach(shortcut => {
        const emitted = []
        const mockPicker = { $emit: jest.fn((ev, val) => emitted.push(val)) }
        shortcut.onClick(mockPicker)
        expect(mockPicker.$emit).toHaveBeenCalledWith('pick', expect.any(Array))
        const [start, end] = emitted[0]
        expect(start).toBeInstanceOf(Date)
        expect(end).toBeInstanceOf(Date)
        expect(end.getTime()).toBeGreaterThanOrEqual(start.getTime())
      })
    })
  })
})
