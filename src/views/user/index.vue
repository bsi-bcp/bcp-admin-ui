<template>
  <div ref="contain" class="app-container org-page">
    <div ref="left" class="left">
      <div style="padding:20px;">
        <span style="font-size:15px;color:#000"><b>组织结构树</b></span>
      </div>
      <el-input
        v-model="filterText"
        placeholder="输入关键字进行搜索"
        size="mini"
        style="margin-right:10px; margin-bottom:15px"
      />

      <el-tree
        ref="tree"
        style="background:#fff"
        :props="{children: 'children',label:'name'}"
        :expand-on-click-node="false"
        :data="treeData"
        :indent="8"
        class="filter-tree"
        node-key="id"
        default-expand-all
        highlight-current
        :filter-node-method="filterNode"
        @node-click="handleNodeClick"
      >
        <span slot-scope="{ node, data }">
          <i :class="data.icon" />
          <span style="padding-left: 4px;">{{ node.label }}</span>
        </span>
      </el-tree>
    </div>
    <div class="right">
      <div class="content">
        <mod-filter :datas="datas" @query="getData">
          <template slot="lastBtn">
            <el-button type="primary" size="mini" @click="edit(0)">新增</el-button>
            <el-button type="primary" size="mini" @click="remove(0)">删除</el-button>
            <!--<el-button size="mini" type="primary" @click="syncFromTemp()">同步</el-button>-->
            <!--<el-button size="mini" type="primary" @click="locked(0)">锁定</el-button>
            <el-button size="mini" type="primary" @click="unLocked(0)">解锁</el-button>
            <el-button size="mini" type="primary" @click="resetPsd(0)">重置密码</el-button>-->
            <el-dropdown trigger="click" size="mini" style="padding-left:10px;" @command="handleCommand">
              <el-button type="primary" size="mini">
                更多<i class="el-icon-arrow-down el-icon--right" />
              </el-button>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item command="locked">锁定</el-dropdown-item>
                <el-dropdown-item command="unLocked">解锁</el-dropdown-item>
                <el-dropdown-item command="resetPsd">重置密码</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </template>
          <template slot="enable" slot-scope="scope">
            <span>{{ scope.value.enable?'启用':'禁用' }}</span>
          </template>
          <template slot="userType" slot-scope="scope">
            <span>{{ scope.value.userType|getName(userTypeList) }}</span>
          </template>
          <template slot="status" slot-scope="scope">
            <span>{{ scope.value.status|getName(userStateList) }}</span>
          </template>
          <template slot="sex" slot-scope="scope">
            <span>{{ scope.value.sex==='0'?'男':'女' }}</span>
          </template>
          <template slot="orgId" slot-scope="scope">
            <span>{{ scope.value.orgName }}</span>
          </template>
          <template slot="oper" slot-scope="scope">
            <!-- <el-button size="mini" type="text" @click="openRow(scope.value)">行表</el-button> -->
            <el-button size="mini" type="text" @click="edit(scope.value)">编辑</el-button>
            <el-button v-if="scope.value.status==='normal'" size="mini" type="text" @click="locked(scope.value)">锁定</el-button>
            <el-button v-else size="mini" type="text" @click="unLocked(scope.value)">解锁</el-button>
            <el-button size="mini" type="text" @click="resetPsd(scope.value)">重置密码</el-button>
            <!--  <el-button size="mini" type="text" @click="remove(scope.value)">删除</el-button> -->
          </template>
        </mod-filter>
        <!--新增/编辑界面-->
        <el-dialog width="50%" :title="subFormData.id?'编辑':'新增'" :visible.sync="dialogFormVisible">
          <el-form ref="subFormData" :model="subFormData" :rules="subFormDataRule" class="subFormData" label-width="100px">
            <div style="width:50%; float:left">
              <el-form-item label="名称" prop="name">
                <el-input v-model="subFormData.name" maxlength="50" size="mini" auto-complete="off" />
              </el-form-item>
              <el-form-item label="登录名" prop="uname">
                <el-input v-model="subFormData.uname" maxlength="20" size="mini" auto-complete="off" />
              </el-form-item>
              <el-form-item label="性别" prop="sex">
                <el-radio-group v-model="subFormData.sex">
                  <el-radio :label="'0'">男</el-radio>
                  <el-radio :label="'1'">女</el-radio>
                </el-radio-group>
              </el-form-item>
              <!--<el-form-item label="类型" prop="userType">
                <el-select v-model="subFormData.userType" size="mini">
                  <el-option v-for="(item,index) in userTypeList" :key="index" :label="item.label" :value="item.value" />
                </el-select>
              </el-form-item>-->
              <el-form-item label="所属组织" prop="orgId">
                <!--<el-select v-model="subFormData.orgId" :disabled="cur_user.userType==='admin'" size="mini">-->
                <el-select v-model="subFormData.orgId" size="mini">
                  <el-option v-for="(item,index) in orgArr" :key="index" :label="item.name" :value="item.id" />
                </el-select>
              </el-form-item>
              <el-form-item label="授权角色" prop="fwUserRoles">
                <el-select v-model="subFormData.fwUserRoles" multiple collapse-tags size="mini">
                  <el-option v-for="(item,index) in roleArr" :key="index" :label="item.name" :value="item.id" />
                </el-select>
              </el-form-item>
            </div>
            <div style="width:50%; float:left">

              <!-- <el-form-item label="租户" prop="orgClassId">
                <el-select v-model="subFormData.menuArr" size="mini">
                  <el-option v-for="(item,index) in menuList" :label="item.label" :value="item.value" :key="index"></el-option>
                </el-select>
              </el-form-item> -->
              <!-- <el-form-item label="菜单权限" prop="menuArr">
                <el-select v-model="subFormData.menuArr" multiple size="mini">
                  <el-option v-for="(item,index) in menuList" :label="item.label" :value="item.value" :key="index"></el-option>
                </el-select>
              </el-form-item> -->
              <el-form-item label="手机号" prop="phoneNo">
                <el-input v-model="subFormData.phoneNo" maxlength="20" size="mini" auto-complete="off" />
              </el-form-item>
              <el-form-item label="邮箱" prop="email">
                <el-input v-model="subFormData.email" maxlength="100" size="mini" auto-complete="off" />
              </el-form-item>
              <el-form-item label="备注" prop="remark">
                <el-input v-model="subFormData.remark" maxlength="1000" size="mini" auto-complete="off" />
              </el-form-item>
              <el-form-item label="是否有效" prop="enable">
                <el-radio-group v-model="subFormData.enable">
                  <el-radio :label="true">启用</el-radio>
                  <el-radio :label="false">禁用</el-radio>
                </el-radio-group>
              </el-form-item>
              <!-- <el-form-item label="状态" prop="status">
                <el-radio-group v-model="subFormData.status">
                  <el-radio :label="'normal'">正常</el-radio>
                  <el-radio :label="'locked'">锁定</el-radio>
                  <el-radio :label="'freezed'">冻结</el-radio>
                </el-radio-group>
              </el-form-item> -->
            </div>

          </el-form>
          <div slot="footer" class="dialog-footer">
            <el-button size="mini" @click="dialogFormVisible = false">取 消</el-button>
            <el-button size="mini" type="primary" @click="subForm('subFormData')">确 定</el-button>
          </div>
        </el-dialog>
      </div>
    </div>
  </div>
</template>

<script>
import * as api from '@/api/user'
import * as apiOrg from '@/api/organization'
import * as apiRole from '@/api/role'
import * as propApi from '@/api/dictionary'
import { mapGetters } from 'vuex'

export default {

  filters: {
    getName(value, list) {
      var isItem = ''
      list.map(item => {
        if (item.value === value) {
          isItem = item
        }
      })
      if (isItem) return isItem.label
    }
  },
  data() {
    return {
      curIndex: null,
      orgId: '',
      filterText: '',
      treeData: [],
      userStateList: [],
      // defaultProps: {
      //   children: 'children',
      //   label: 'label'
      // },
      dialogRowVisible: false,
      dialogFormVisible: false,
      dialogPropListFormVisible: false,
      dialogRowTitle: null,
      selectionPropList: [],
      userTypeList: [{
        label: '管理员',
        value: 'admin'
      }, {
        label: '普通用户',
        value: 'normal'
      }, {
        label: '业务管理员',
        value: 'admin-b'
      }],
      menuList: [],
      rowData: {
        id: null,
        name: null,
        code: null,
        remark: null,
        enable: null
      },
      roleArr: [],
      orgArr: [],
      subFormData: {
        // id: null,
        // name: null,
        // uname: null,
        // status: 'normal',
        // sex: '0',
        // remark: null,
        // enable: null,
      },
      subPropListFormData: {
        // id: null,
        // propId: null,
        // propkey: null,
        // propvalue: null,
        // orderNo: null,
        // group: null,
        // remark: null,
        // enable: null
      },
      subFormDataRule: {
        'name': [{
          required: true,
          message: '请填写姓名',
          trigger: 'blur'
        }],
        'uname': [{
          required: true,
          message: '请填写登录名',
          trigger: 'blur'
        }],
        'userType': [{
          required: true,
          message: '请选择用户类型',
          trigger: 'blur'
        }],
        'sex': [{
          required: true,
          message: '请选择性别',
          trigger: 'blur'
        }],
        'orgId': [{
          required: true,
          message: '请选择所属组织',
          trigger: 'blur'
        }],
        'phoneNo': [{
          required: true,
          message: '请输入正确的手机号',
          trigger: 'blur'
        },
        {
          pattern: /^1[3|4|5|7|8|9][0-9]\d{8}$/,
          message: '请输入正确的手机号',
          trigger: 'blur'
        }],
        'fwUserRoles': [{
          required: true,
          message: '请选择授权角色',
          trigger: 'blur'
        }],
        'enable': [{
          required: true,
          message: '请选择状态'
        }]
      },
      subPropListFormDataRule: {
        'propId': [{
          required: true,
          message: '请选择配置主表'
        }],
        'propkey': [{
          required: true,
          message: '请输入唯一标识'
        }],
        'propvalue': [{
          required: true,
          message: '请输入内容'
        }],
        'orderNo': [{
          required: true,
          message: '请输入排序'
        }],
        'enable': [{
          required: true,
          message: '请选择状态'
        }]
      },
      tableData: [],
      rowTableData: [],
      params: {
        currentPage: 1,
        pageSize: 10
      },
      datas: {
        multipleSelection: [],
        params: {
          currentPage: 1,
          pageSize: 10
        },
        table: {
          selection: true,
          loading: true,
          orderNo: true
        },
        resData: {
          rows: [],
          pageSize: 10,
          currentPage: 1,
          totalCount: 0
        },
        filterList: [
          {
            type: 'input',
            prop: 'name',
            conditionshow: true,
            filedShow: true,
            label: '名称',
            placeholder: '名称',
            optList: []
          },
          {
            type: 'input',
            prop: 'uname',
            conditionshow: true,
            filedShow: true,
            label: '登录名',
            placeholder: '登录名',
            optList: []
          },
          // {
          //   type: 'input',
          //   prop: 'password',
          //   conditionshow: false,
          //   filedShow: true,
          //   label: '密码',
          //   placeholder: '密码',
          //   optList: []
          // },
          {
            type: 'select',
            prop: 'userType',
            conditionshow: true,
            filedShow: true,
            slot: true,
            label: '类型',
            placeholder: '类型',
            optList: [{ label: '管理员', value: 'admin' }, { label: '普通用户', value: 'normal' }, { label: '业务管理员', value: 'admin-b' }]
          },
          {
            type: 'select',
            prop: 'status',
            conditionshow: true,
            filedShow: true,
            slot: true,
            label: '状态',
            placeholder: '状态',
            optList: []
          },
          {
            type: 'input',
            prop: 'phoneNo',
            conditionshow: false,
            filedShow: true,
            label: '手机号码',
            placeholder: '手机号码',
            optList: []
          },
          {
            type: 'input',
            prop: 'email',
            conditionshow: false,
            filedShow: false,
            label: '邮箱',
            placeholder: '邮箱',
            optList: []
          },
          {
            type: 'select',
            prop: 'sex',
            conditionshow: false,
            filedShow: false,
            slot: true,
            label: '性别',
            placeholder: '性别',
            optList: [{ label: '男', value: '0' }, { label: '女', value: '1' }]
          },
          {
            type: 'select',
            prop: 'orgId',
            conditionshow: false,
            filedShow: true,
            slot: true,
            label: '所属组织',
            placeholder: '所属组织',
            optList: []
          },
          // {
          //   type: 'input',
          //   prop: 'orgClassId',
          //   conditionshow: false,
          //   filedShow: false,
          //   label: '租户',
          //   placeholder: '租户',
          //   optList: []
          // },
          {
            type: 'input',
            prop: 'remark',
            conditionshow: false,
            filedShow: true,
            label: '备注',
            placeholder: '备注',
            optList: []
          },
          {
            type: 'select',
            prop: 'enable',
            conditionshow: true,
            filedShow: true,
            slot: true,
            label: '是否有效',
            placeholder: '是否有效',
            optList: [{ label: '启用', value: 1 }, { label: '禁用', value: 0 }]
          },
          {
            type: 'input',
            prop: 'orgClassName',
            conditionshow: false,
            filedShow: true,
            label: '所属租户',
            placeholder: '所属租户',
            optList: []
          },
          {
            type: 'input',
            prop: 'oper',
            minWidth: '200px',
            conditionshow: false,
            filedShow: true,
            isSearchHide: true,
            slot: true,
            label: '操作',
            placeholder: '操作',
            optList: []
          }
        ]
      }
    }
  },
  computed: {
    ...mapGetters([
      'cur_user'
    ])
  },
  watch: {
    filterText(val) {
      this.$refs.tree.filter(val)
    },
    orgId(val) {
      if (val) {
        this.orgId = val
        this.getData()
      }
    }
  },
  created() {
    this.getTreeData()
    this.getOrgArr()
    this.getRoleArr()
    this.getUserStateList()
    this.curIndex = this.findIndex(this.datas.filterList)
  },
  mounted() {
    this.clientHeight = `${document.documentElement.clientHeight}`
    this.changeFixed()
  },
  methods: {
    handleCommand(command) {
      if (command === 'locked') {
        this.locked(0)
      } else if (command === 'unLocked') {
        this.unLocked(0)
      } else if (command === 'resetPsd') {
        this.resetPsd(0)
      }
    },
    // 从中间表同步用户
    syncFromTemp() {
      api.syncUser().then(res => {
        this.$message(res.msg)
      })
    },
    findIndex(arr) {
      for (let i = 0; i < arr.length; i++) {
        if (arr[i].prop === 'orgId') {
          return i
        }
      }
    },
    // 获取角色信息
    getRoleArr() {
      apiRole.getPage().then(res => {
        this.roleArr = res.model
      })
    },
    // 获取组织数据
    getOrgArr() {
      api.getOrgList().then(res => {
        this.orgArr = res.model
        const arr = JSON.parse(JSON.stringify(this.orgArr))
        arr.forEach((item, key) => {
          item.label = item.name
          item.value = item.id
        })
        this.$set(this.datas.filterList[this.curIndex], 'optList', arr)
      })
    },
    // 获取组织树数据
    getTreeData() {
      apiOrg.orgTree(null).then(res => {
        this.addIcon(res.model)
        this.treeData = res.model
        // 默认展开第一个节点
        this.$nextTick(() => {
          this.$refs.tree.setCurrentKey(this.treeData[0].id)
        })
      })
        .catch(e => {
          console.log(e)
          return false
        })
    },
    addIcon(data) {
      if (data.length) {
        for (var i = 0; i < data.length; i++) {
          if (data[i].children) {
            data[i]['icon'] = 'el-icon-menu'
            this.addIcon(data[i].children)
          } else {
            data[i]['icon'] = 'el-icon-document'
          }
        }
      }
    },
    // 树节点过滤
    filterNode(value, data) {
      if (!value) return true
      return data.name.indexOf(value) !== -1
    },
    // 点击树节点
    handleNodeClick(data) {
      this.orgId = data.id
    },
    // 行表表格选择
    changePropListSelect(val) {
      this.selectionPropList = val
    },
    // 删除行表数据
    removePropList(row) {
      let items = []
      if (!row) {
        if (!this.selectionPropList.length) {
          this.$message.info('请选择相关数据')
          return
        }
        items = this.selectionPropList.map((value) => {
          return value['id']
        })
      } else {
        items.push(row.id)
      }
      this.$confirm('是否删除?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          api.batchDeletePropList({
            'items': items
          }).then(res => {
            this.$message.success({
              message: '删除成功'
            })
            this.openRow({ id: this.rowData.id })
          })
        })
        .catch(() => {
          this.$message.error({
            message: '删除失败'
          })
        })
    },
    // 删除
    remove(row) {
      let items = []
      if (!row) {
        if (!this.datas.multipleSelection.length) {
          this.$message.info('请选择相关数据')
          return
        }
        // items = _.map(this.datas.multipleSelection, 'id')
        items = this.datas.multipleSelection.map((value) => {
          return value['id']
        })
      } else {
        items.push(row.id)
      }
      this.$confirm('是否删除?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          api.batchDelete({
            'items': items
          }).then(res => {
            this.$message.success({
              message: '删除成功'
            })
            this.getData()
            this.dialogFormVisible = false
          })
        })
        .catch(() => {})
    },
    // 提交
    subForm(formData) {
      this.$refs[formData].validate((valid) => {
        if (valid) {
          if (!this.subFormData.id) {
            this.subFormData.userType = 'normal'
            api.submitFormAdd(this.subFormData).then(res => {
              this.$message.success('保存成功')
              this.getData(this.datas)
              this.dialogFormVisible = false
            }).catch(() => {})
          } else {
            api.submitFormEdit(this.subFormData).then(res => {
              this.$message.success('保存成功')
              this.getData(this.datas)
              this.dialogFormVisible = false
            }).catch(() => {
              this.$message({
                type: 'error',
                message: '修改失败'
              })
            })
          }
        } else {
          console.log('error submit!!')
          return false
        }
      })
    },
    // 新增或编辑页面
    edit(row) {
      this.dialogFormVisible = true
      if (!row) {
        this.$set(this, 'subFormData', {
          'status': 'normal',
          'sex': '0',
          'enable': true,
          'orgId': this.orgId
        })
        return
      } else {
        // this.$set(this, 'subFormData', formList)
        this.subFormData = JSON.parse(JSON.stringify(row))
        apiRole.getRolesByUserId(row.id).then(res => {
          row.fwRoles = res.model
          var roleIdArr
          roleIdArr = row.fwRoles.map(value => {
            return value.id
          })
          this.$set(this.subFormData, 'fwUserRoles', roleIdArr)
        })
      }
    },

    //  锁定
    locked(row) {
      let items = []
      if (!row) {
        if (!this.datas.multipleSelection.length) {
          this.$message.info('请选择相关数据')
          return
        }
        items = this.datas.multipleSelection.map((value) => {
          return value['id']
        })
      } else {
        items.push(row.id)
      }
      this.$confirm('是否锁定选择的用户?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          api.batchLocked({
            'items': items
          }).then(res => {
            this.$message.success({
              message: '锁定成功'
            })
            this.getData()
            this.dialogFormVisible = false
          })
        })
        .catch(() => {
          this.$message.error({
            message: '操作失败'
          })
        })
    },

    // 解锁
    unLocked(row) {
      let items = []
      if (!row) {
        if (!this.datas.multipleSelection.length) {
          this.$message.info('请选择相关数据')
          return
        }
        items = this.datas.multipleSelection.map((value) => {
          return value['id']
        })
      } else {
        items.push(row.id)
      }
      this.$confirm('是否解锁选择的用户?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          api.batchUnLocked({
            'items': items
          }).then(res => {
            this.$message.success({
              message: '解锁成功'
            })
            this.getData()
            this.dialogFormVisible = false
          })
        })
        .catch(() => {
          this.$message.error({
            message: '操作失败'
          })
        })
    },

    // 重置密码
    resetPsd(row) {
      let items = []
      if (!row) {
        if (!this.datas.multipleSelection.length) {
          this.$message.info('请选择相关数据')
          return
        }
        items = this.datas.multipleSelection.map((value) => {
          return value['id']
        })
      } else {
        items.push(row.id)
      }
      this.$confirm('是否重置为初始密码?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          api.batchResetPsd({
            'items': items
          }).then(res => {
            this.$message.success({
              message: '重置密码成功'
            })
            this.getData()
            this.dialogFormVisible = false
          })
        })
        .catch(() => {
          this.$message.error({
            message: '操作失败'
          })
        })
    },

    getData(datas = this.datas) {
      this.$set(this, 'datas', datas)
      this.$set(this, 'params', datas.params)
      this.$set(this.datas.table, 'loading', true)
      this.$set(this.params, 'orgId', this.orgId)
      api.getUserList(this.params).then(res => {
        this.$set(this.datas.resData, 'rows', res.model)
        this.$set(this.datas.params, 'currentPage', res.currentPage)
        this.$set(this.datas.params, 'pageSize', res.pageSize)
        this.$set(this.datas.resData, 'totalCount', res.totalCount)
        this.$set(this.datas.table, 'loading', false)
      })
    },
    changeFixed(clientHeight) {
      //  动态修改样式
      this.$refs.left.style.height = this.clientHeight - 80 + 'px'
      this.$refs.contain.style.height = this.clientHeight - 50 + 'px'
    },
    getUserStateList() {
      return propApi.getPropListByPropCode({ code: 'userState' }).then(res => {
        const list = []
        this.$set(this, 'userStateList', [])
        res.model.forEach(function(item, index) {
          list.push({
            label: item.propvalue,
            value: item.propkey
          })
        })
        var itemIndex = null
        this.datas.filterList.map((value, index) => {
          if (value.prop === 'status') {
            itemIndex = index
          }
        })
        this.userStateList = list
        this.datas.filterList[itemIndex].optList = list
      })
    }
  }
}
</script>

<style lang="scss" scoped>
    .left {
      float: left;
      width: 16%;
      height: 100%;
      margin-top:30px;
      padding-right: 10px;
      border-right: 1px solid rgb(211, 208, 208);
      overflow-y: auto;
    }
    .right {
      float: right;
      width: 84%;
      height: 100%;
      padding:10px;
      .content {
        width: 100%;
      }
    }
  .contain .left::-webkit-scrollbar {
    /* 隐藏滚轮 */
    display: none
  }
  .el-dropdown-menu__item{
    font-size: 14px;
  }

</style>
