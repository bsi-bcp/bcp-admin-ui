<template lang="html">
  <div class="app-container">
    <el-row>
      <el-col :span="6">
        <div class="tree-div">
          <div class="tree-title">
            <div style="padding:20px;">
              <span style="font-size:15px;color:#000"><b>菜单管理</b></span>
            </div>
          </div>
          <el-button icon="el-icon-plus" type="text" class="indigo" size="medium" style="padding-left:5px;" @click="showAddDialog">新增</el-button>
          <el-button icon="el-icon-delete" type="text" class="indigo" size="medium" @click="del">删除</el-button>
          <el-tree
            ref="tree"
            :props="{children: 'children',label:'name'}"
            :expand-on-click-node="false"
            :data="treeData"
            :indent="8"
            class="filter-tree"
            node-key="id"
            default-expand-all
            highlight-current
            @node-click="handleNodeClick"
          >
            <span slot-scope="{ node, data }">
              <i :class="data.icon" />
              <span style="padding-left: 4px;">{{ node.label }}</span>
            </span>
          </el-tree>
        </div>
      </el-col>
      <el-col :span="15">
        <div class="tree-div">
          <div class="tree-title" style="margin-bottom:20px">
            <div style="padding:20px;">
              <span style="font-size:15px;color:#000"><b>菜单结构管理</b></span>
            </div>
          </div>
          <div>
            <el-form ref="editForm" :model="editForm" :rules="subFormDataRule" label-width="90px" class="rest-validate-form">
              <el-form-item label="名称" prop="name">
                <el-input v-model="editForm.name" maxlength="50" style="width:50%" />
              </el-form-item>
              <el-form-item label="编码" prop="code">
                <el-input v-model="editForm.code" maxlength="20" style="width:50%" />
              </el-form-item>
              <!-- <el-form-item label="上级菜单" prop="parentId">
                <el-input v-model="editForm.parentId | filterParentName" style="width:50%" />
              </el-form-item> -->
              <el-form-item label="资源类型" prop="sourceType">
                <!-- <el-input v-model="editForm.sourceType" style="width:50%" /> -->
                <el-select v-model="editForm.sourceType" style="width:50%">
                  <el-option v-for="(optItem,optindex) in sourceTypeOptions" :key="optindex" :label="optItem.propvalue" :value="optItem.propkey" />
                </el-select>
              </el-form-item>
              <el-form-item v-if="editForm.sourceType === 'menu'" label="菜单类型" prop="type">
                <!-- <el-input v-model="editForm.type" style="width:50%" /> -->
                <el-select v-model="editForm.type" style="width:50%">
                  <el-option v-for="(optItem,optindex) in typeOptions" :key="optindex" :label="optItem.propvalue" :value="optItem.propkey" />
                </el-select>
              </el-form-item>
              <el-form-item v-if="editForm.sourceType === 'menu'" label="菜单路径" prop="url">
                <el-input v-model="editForm.url" maxlength="200" style="width:50%" />
              </el-form-item>
              <!-- <el-form-item label="叶子节点" prop="isLeaf">
                <el-input :disabled="true" v-model="editForm.isLeaf ? '是':'否'"

style="width:50%"></el-input>
              </el-form-item> -->
              <el-form-item label="排序等级" prop="orderNo">
                <el-input-number
                  v-model="editForm.orderNo"
                  :min="1"
                  :max="999"
                  label="排序等级"
                />
              </el-form-item>
              <el-form-item label="状态" prop="enable">
                <el-radio-group v-model="editForm.enable">
                  <el-radio :label="true">启用</el-radio>
                  <el-radio :label="false">禁用</el-radio>
                </el-radio-group>
              </el-form-item>
              <el-form-item label="备注" prop="remark">
                <el-input v-model="editForm.remark" maxlength="1000" style="width:50%" />
              </el-form-item>
              <el-button type="primary" style="float:right;margin-right:20px;" :disabled="editForm.id === ''" @click="updateData">修改</el-button>
            </el-form>
          </div>
        </div>
      </el-col>
    </el-row>

    <el-dialog :title="'新增'" :visible.sync="dialogFormVisible" width="50%">
      <el-form ref="addForm" :model="addForm" :rules="subFormDataRule" class="addForm" label-width="100px">
        <el-form-item label="名称" prop="name">
          <el-input v-model="addForm.name" maxlength="50" style="width:50%" />
        </el-form-item>
        <el-form-item label="编码" prop="code">
          <el-input v-model="addForm.code" maxlength="20" style="width:50%" />
        </el-form-item>
        <el-form-item label="资源类型" prop="sourceType">
          <!-- <el-input v-model="addForm.sourceType" style="width:50%" /> -->
          <el-select v-model="addForm.sourceType" style="width:50%">
            <el-option v-for="(optItem,optindex) in sourceTypeOptions" :key="optindex" :label="optItem.propvalue" :value="optItem.propkey" />
          </el-select>
        </el-form-item>
        <el-form-item v-if="addForm.sourceType==='menu'" label="菜单类型" prop="type">
          <!-- <el-input v-model="addForm.type" style="width:50%" /> -->
          <el-select v-model="addForm.type" style="width:50%">
            <el-option v-for="(optItem,optindex) in typeOptions" :key="optindex" :label="optItem.propvalue" :value="optItem.propkey" />
          </el-select>
        </el-form-item>
        <el-form-item v-if="addForm.sourceType==='menu'" label="菜单路径" prop="url">
          <el-input v-model="addForm.url" maxlength="200" style="width:50%" />
        </el-form-item>
        <el-form-item label="所选父级" prop="parentId">
          <el-input v-model="clickTree.parentName" :disabled="true" style="width:50%" />
        </el-form-item>
        <el-form-item label="排序等级" prop="orderNo">
          <el-input-number
            v-model="addForm.orderNo"
            :min="1"
            :max="999"
            label="描述文字"
          />
        </el-form-item>
        <el-form-item label="状态" prop="enable">
          <el-radio-group v-model="addForm.enable">
            <el-radio :label="true">启用</el-radio>
            <el-radio :label="false">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="addForm.remark" maxlength="1000" auto-complete="off" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="createdData">保存</el-button>
        <el-button @click="dialogFormVisible = false">取消</el-button>
      </div>
    </el-dialog>
    <!-- <el-dialog :title="菜单管理" :visible.sync="menuModalVisible" width="50%">
      <el-form ref="addForm" :model="addForm" :rules="subFormDataRule" class="addForm"

label-width="100px">
        <el-tree
            style="background:#EEEEEE"
            ref="tree"
            :props="{children: 'children',label:'name'}"
            :expand-on-click-node="false"
            :data="treeData"
            :indent="8"
            class="filter-tree"
            node-key="id"
            default-expand-all
            highlight-current
            @node-click="handleNodeClick"
          >
            <span slot-scope="{ node, data }">
              <i :class="data.icon" />
              <span style="padding-left: 4px;">{{ node.label }}</span>
            </span>
          </el-tree>
      </el-form>
    </el-dialog> -->
  </div>
</template>

<script>
import * as api from '@/api/menu'

export default {
  filters: {
    filterParentName(index) {
      alert(index)
      // api.detailMenu()
    }
  },
  data() {
    return {
      sourceTypeOptions: [], // 资源类型
      typeOptions: [], // 菜单类型
      treeData: [],
      checkedTree: [], // 选中的树节点id数组
      dialogFormVisible: false,
      menuModalVisible: false,
      options: [{
        value: 65,
        label: '组织管理'
      }],
      parentOptions: {
        parentId: '',
        parentName: ''
      },
      editForm: {
        id: '',
        parentId: '',
        url: '',
        name: '',
        sourceType: '',
        type: '',
        code: '',
        isLeaf: '',
        orderNo: '',
        remark: '',
        enable: ''
      },
      addForm: {
        parentId: 0,
        name: '',
        code: null,
        url: '',
        sourceType: '',
        type: '',
        orderNo: '',
        enable: true,
        remark: ''
      },
      clickTree: { // 记录所点击组织树
        id: null,
        parentName: null,
        sourceType: null
      },
      subFormDataRule: {
        name: [{
          required: true,
          message: '请输入名称'
        },
        { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }],
        url: [{
          required: true,
          message: '请输入菜单路径'
        },
        { min: 0, max: 200, message: '长度在 0 到 200 个字符', trigger: 'blur' }],
        orderNo: [{
          required: true,
          message: '请选择类型'
        }],
        code: [{
          required: true,
          message: '请输入菜单编码'
        }],
        enable: [{
          required: true,
          message: '请选择类型'
        }],
        sourceType: [{
          required: true,
          message: '请选择资源类型'
        }],
        type: [{
          required: true,
          message: '请选择菜单类型'
        }]
      }
    }
  },
  watch: {
    dialogFormVisible: { // 监视Dialoag打开状态
      handler(oldData, newData) {
        if (newData) {
          this.resetData()
        }
      }
    }
  },
  created() {
    this.getData()
    this.getSourceTypeOptions()
  },
  mounted() {},
  methods: {
    getSourceTypeOptions() {
      api.getSourceTypeOptions('sourceType').then(res => {
        this.sourceTypeOptions = res.model
      }).catch(e => {
        return false
      })
      api.getSourceTypeOptions('menuType').then(res => {
        this.typeOptions = res.model
      }).catch(e => {
        return false
      })
    },
    getData() {
      api.getMenuTree(null).then(res => {
        this.addIcon(res.model)
        this.treeData = res.model
        // this.treeData = this.tranTree("id", "parentId", res.model, 0);
      })
        .catch(e => {
          return false
        })
    },
    addIcon(data) {
      if (data.length) {
        for (var i = 0; i < data.length; i++) {
          if (data[i].children) {
            data[i]['icon'] = 'el-icon-folder-opened'
            this.addIcon(data[i].children)
          } else {
            data[i]['icon'] = 'el-icon-tickets'
          }
        }
      }
    },
    showAddDialog() {
      if (this.clickTree.sourceType === 'button') {
        this.$message.warning('按钮下不能新增菜单')
        return
      }
      this.addForm.name = null
      this.addForm.code = null
      this.addForm.sourceType = null
      this.addForm.type = null
      this.addForm.url = null
      this.addForm.orderNo = null
      this.addForm.remark = null
      this.addForm.enable = true
      this.addForm.parentId = this.clickTree.id
      this.dialogFormVisible = true
    },
    resetData() { // 重置数据
      if (this.$refs['addForm']) {
        this.$refs['addForm'].resetFields()
      }
      this.clickTree = { id: null, parentName: null }
    },
    createdData() {
      if (this.clickTree.sourceType === 'button') {
        this.$message.warning('按钮下不能新增菜单')
        return
      }
      if (this.clickTree.id) {
        this.addForm.parentId = this.clickTree.id
      }
      this.$refs['addForm'].validate((valid) => {
        if (valid) {
          api.updateMenu(this.addForm).then(res => {
            this.dialogFormVisible = false
            this.$message.success('保存成功')
            this.getData()
          }).catch(e => {})
        } else {
          console.log('error submit!!')
          return false
        }
      })
    },
    updateData() {
      delete this.editForm.children
      this.$refs['editForm'].validate((valid) => {
        if (valid) {
          api.updateMenu(this.editForm)
            .then(res => {
              this.$message.success('修改成功')
              this.$refs['editForm'].resetFields()
              this.getData()
            }).catch(e => {})
        } else {
          console.log('error submit!!')
          return false
        }
      })
    },
    del() {
      if (this.editForm.id === '') {
        this.$message.info('请选择需要删除的菜单')
        return
      }
      // 当删除的节点为父节点时
      if (!this.editForm.isLeaf) {
        this.$message.info('请先删除该节点下的子节点')
        return
      }

      this.$confirm('是否删除已选中的菜单?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          api.delMenu(this.editForm.id)
            .then(res => {
              this.$message.success({
                message: '删除成功'
              })
              this.getData()
            })
            .catch(e => {
              this.$message.error({
                message: '删除失败'
              })
            })
        })
    },
    // 树叉点击选中触发
    handleNodeClick(data) {
      this.editForm = data
      this.clickTree.id = data.id
      this.clickTree.parentName = data.name
      this.clickTree.sourceType = data.sourceType
    },
    isLeaf(data, node) {
    }
  }
}
</script>

<style lang="scss" scoped>
  .tree-div {
    // background: #EEEEEE;
    border-radius: 3px;
    border: 1px solid rgba(3, 3, 3, 0.1);
    margin-right: 20px;
    height: 800px;
    overflow-y: scroll;
    // margin-bottom: 100px;
  }
  .tree-title {
    width:100%;
    height:50px;
    background:#EEEEEE;
  }
  </style>
