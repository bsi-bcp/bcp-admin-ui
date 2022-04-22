<template lang="html">
  <div ref="contain" class="app-container">
    <el-row>
      <el-col :span="6">
        <div class="tree-div">
          <div class="tree-title">
            <div style="padding:20px;">
              <span style="font-size:15px;"><b>组织结构树</b></span>
            </div>
          </div>
          <el-button icon="el-icon-plus" type="text" class="indigo" size="medium" @click="showAddDialog" style="padding-left:5px;">新增</el-button>
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
        <div style="border: 1px solid #DCDCDC;height:370px;border-radius: 3px;">
          <div class="tree-title" style="margin-bottom:20px">
            <div style="padding:20px;">
              <span style="font-size:15px;color:#000"><b>组织结构管理</b></span>
            </div>
          </div>
          <div>
            <el-form ref="editForm" :model="editForm" :rules="subFormDataRule" label-width="90px" class="rest-validate-form">
              <el-form-item label="名称" prop="name">
                <el-input v-model="editForm.name" maxlength="50" style="width:50%" />
              </el-form-item>
              <el-form-item label="编码" prop="code">
                <el-input v-model="editForm.code" maxlength="20" :disabled="true" style="width:50%" />
              </el-form-item>
              <!-- <el-form-item label="叶子节点" prop="isLeaf">
                <el-input :disabled="true" v-model="editForm.isLeaf ? '是':'否'" style="width:50%"></el-input>
              </el-form-item> -->
              <el-form-item label="排序等级" prop="orderNo">
                <el-input-number v-model="editForm.orderNo" :min="1" :max="20" label="排序等级" />
              </el-form-item>
              <el-form-item label="状态" prop="enable">
                <el-radio-group v-model="editForm.enable">
                  <el-radio :label="true">启用</el-radio>
                  <el-radio :label="false">禁用</el-radio>
                </el-radio-group>
                <!--<sxf-proplist v-model="editForm.enable" :code="propListSel.code" :group="propListSel.group" ></sxf-proplist>-->
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
        <el-form-item label="所选父级" prop="parentId">
          <el-input v-model="clickTree.parentName" :disabled="true" style="width:50%" />
        </el-form-item>
        <el-form-item label="排序等级" prop="orderNo">
          <el-input-number v-model="addForm.orderNo" :min="1" :max="999" label="描述文字" />
        </el-form-item>
        <el-form-item label="状态" prop="enable">
          <el-radio-group v-model="editForm.enable">
            <el-radio :label="true">启用</el-radio>
            <el-radio :label="false">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="addForm.remark" maxlength="1000" auto-complete="off" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取消</el-button>
        <el-button type="primary" @click="createdData('addForm')">保存</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import * as api from '@/api/organization'

export default {
  data() {
    return {
      propListSel: {
        code: 'enable',
        group: '2'
      },
      treeData: [],
      checkedTree: [], // 选中的树节点id数组
      dialogFormVisible: false,
      editForm: {
        id: '',
        parentId: '',
        name: '',
        code: '',
        isLeaf: '',
        orderNo: '',
        remark: '',
        enable: ''
      },
      addForm: {
        parentId: 0,
        name: '',
        orderNo: '',
        enable: true,
        remark: ''
      },
      clickTree: { // 记录所点击组织树
        id: null,
        parentName: null
      },
      subFormDataRule: {
        name: [{
          required: true,
          message: '请输入名称'
        }],
        orderNo: [{
          required: true,
          message: '请选择类型'
        }],
        code: [{
          required: true,
          message: '请输入编码'
        }],
        enable: [{
          required: true,
          message: '请选择类型'
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
  },
  mounted() {},
  methods: {
    getData() {
      api.orgTree(null).then(res => {
        this.addIcon(res.model)
        this.treeData = res.model
        // this.treeData = this.tranTree("id", "parentId", res.model, 0);
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
    showAddDialog() {
      if (!this.clickTree.id) {
        this.$message.warning('请先选择选择父组织')
        return
      }
      this.dialogFormVisible = true
    },
    resetData() { // 重置数据
      if (this.$refs['addForm']) {
        this.$refs['addForm'].resetFields()
      }
      this.clickTree = { id: null, parentName: null }
    },
    createdData(formData) {
      if (this.clickTree.id) {
        this.addForm.parentId = this.clickTree.id
      }
      this.$refs[formData].validate((valid) => {
        if (valid) {
          api.updateOrganization(this.addForm)
            .then(res => {
              this.dialogFormVisible = false
              this.$message.success('保存成功')
              this.getData()
            }).catch(e => {})
        } else {
          return false
        }
      })
    },
    updateData() {
      delete this.editForm.children
      api.updateOrganization(this.editForm)
        .then(res => {
          this.$message.success('修改成功')
          this.$refs['editForm'].resetFields()
          this.getData()
        })
        .catch(e => {})
    },
    del() {
      if (this.editForm.id === '') {
        this.$message.info('请选择需要删除的组织')
        return
      }
      // 当删除的节点为父节点时
      if (!this.editForm.isLeaf) {
        this.$message.info('请先删除该节点下的子节点')
        return
      }

      this.$confirm('是否删除已选中的组织?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          api.delOrganization(this.editForm.id)
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
    },
    isLeaf(data, node) {
    },
  }
}
</script>

<style lang="scss" scoped>
  .tree-div {
    //background: #EEEEEE;
    border-radius: 3px;
    border: 1px solid #DCDCDC;
    margin-right: 20px;
    height: 800px;
    overflow-y: scroll;
  }
  .tree-title {
    width:100%;
    height:50px;
    background:#EEEEEE;
  }

  .contain .left::-webkit-scrollbar {
    /* 隐藏滚轮 */
    display: none
  }
  el-tree{
    overflow-y: scroll;
  }

</style>
