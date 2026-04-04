import { mount, shallowMount } from '@vue/test-utils'
import MultipleTable from '@/views/integrationConfig/moudel/multipleTable.vue'
import * as api from '@/api/addministrative'

jest.mock('@/api/addministrative', () => ({
  getPageAuth: jest.fn(() => Promise.resolve([]))
}))

const STUBS = {
  'el-table': { template: '<div><slot /></div>' },
  'el-table-column': { template: '<div />' },
  'el-radio': { template: '<div />' }
}

// Prevent mounted() from calling the real getList during setup
// so each test starts with a clean state.
const createWrapper = () => {
  const spy = jest.spyOn(MultipleTable.methods, 'getList').mockImplementation(() => {})
  const wrapper = shallowMount(MultipleTable, { stubs: STUBS })
  spy.mockRestore()
  return wrapper
}

describe('multipleTable.vue', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('default data values', () => {
    it('tableData is an empty array', () => {
      const wrapper = createWrapper()
      expect(wrapper.vm.tableData).toEqual([])
    })

    it('radioId is an empty string', () => {
      const wrapper = createWrapper()
      expect(wrapper.vm.radioId).toBe('')
    })

    it('setData defaults to currentPage=1 and pageSize=10', () => {
      const wrapper = createWrapper()
      expect(wrapper.vm.setData).toEqual({ currentPage: 1, pageSize: 10 })
    })
  })

  describe('methods', () => {
    it('rowClick sets radioId to row.name', () => {
      const wrapper = createWrapper()
      wrapper.vm.rowClick({ id: '5', name: 'Template X' })
      expect(wrapper.vm.radioId).toBe('Template X')
    })

    it('handleSelectionChange emits templateData with (val, 1)', () => {
      const wrapper = createWrapper()
      const row = { id: 1, name: 'Template A' }
      wrapper.vm.handleSelectionChange(row)
      expect(wrapper.emitted().templateData).toBeTruthy()
      expect(wrapper.emitted().templateData[0]).toEqual([row, 1])
    })

    it('handleSelection emits templateData with (val, 2)', () => {
      const wrapper = createWrapper()
      const row = { id: 2, name: 'Template B' }
      wrapper.vm.handleSelection(row)
      expect(wrapper.emitted().templateData).toBeTruthy()
      expect(wrapper.emitted().templateData[0]).toEqual([row, 2])
    })

    it('handleSizeChange updates pageSize, resets currentPage to 1, and calls getList', () => {
      const wrapper = createWrapper()
      const spy = jest.spyOn(wrapper.vm, 'getList').mockImplementation(() => {})
      wrapper.vm.setData.currentPage = 5
      wrapper.vm.handleSizeChange(20)
      expect(wrapper.vm.setData.pageSize).toBe(20)
      expect(wrapper.vm.setData.currentPage).toBe(1)
      expect(spy).toHaveBeenCalledTimes(1)
      spy.mockRestore()
    })

    it('handleCurrentChange updates currentPage and calls getList', () => {
      const wrapper = createWrapper()
      const spy = jest.spyOn(wrapper.vm, 'getList').mockImplementation(() => {})
      wrapper.vm.handleCurrentChange(3)
      expect(wrapper.vm.setData.currentPage).toBe(3)
      expect(spy).toHaveBeenCalledTimes(1)
      spy.mockRestore()
    })

    it('getList calls api.getPageAuth and sets tableData from response', async() => {
      const mockData = [{ id: 10, name: 'Mock Template' }]
      api.getPageAuth.mockResolvedValueOnce(mockData)

      // Mount with real parent hierarchy so $parent.$parent.cur_user resolves
      const MiddleComponent = {
        template: '<multiple-table />',
        components: { MultipleTable }
      }
      const GrandParent = {
        template: '<middle-component />',
        components: { MiddleComponent },
        data() {
          return { cur_user: { tenantId: 'tenant-test' }}
        }
      }

      const wrapper = mount(GrandParent, {
        stubs: {
          'el-table': { template: '<div><slot /></div>' },
          'el-table-column': { template: '<div />' },
          'el-radio': { template: '<div />' }
        }
      })

      // mounted() already called getList once with the default mock (empty array)
      // Wait for that to finish, then clear and set new mock
      await new Promise(resolve => setTimeout(resolve, 0))
      const mountedCallCount = api.getPageAuth.mock.calls.length
      expect(mountedCallCount).toBe(1)

      api.getPageAuth.mockResolvedValueOnce(mockData)

      // Find the MultipleTable instance and call getList again
      const target = wrapper.find(MultipleTable).vm
      target.getList()

      await new Promise(resolve => setTimeout(resolve, 0))

      // The second call should have the expected args
      expect(api.getPageAuth).toHaveBeenCalledTimes(2)
      expect(api.getPageAuth.mock.calls[1]).toEqual([{ tenantId: 'tenant-test' }])
      expect(target.tableData).toEqual(mockData)
    })
  })
})
