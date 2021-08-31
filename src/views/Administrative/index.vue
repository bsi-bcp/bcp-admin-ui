<template lang="html">
  <div class="app-container">
    <mod-filter :datas="datas" @query="getData">
      <template slot="lastBtn">
        <el-button type="primary" size="mini" @click="edit(0)">新增</el-button>
      </template>
      <template slot="enable" slot-scope="scope">
  <span>{{ scope.value.enable ? "启用" : "禁用" }}</span>
</template>
      <template slot="oper" slot-scope="scope">
  <el-button size="mini" type="text" @click="disableType(scope.value)">{{
    scope.value.enable ? "禁用" : "启用"
  }}</el-button>
  <el-button size="mini" type="text" @click="edit(scope.value)">编辑</el-button>
  <el-button size="mini" type="text" @click="remove(scope.value)"
    >删除</el-button
  >
</template>
    </mod-filter>
    <!--新增/编辑界面-->
    <el-dialog width="50%" :title="subFormData.id?'编辑':'新增'" :visible.sync="dialogFormVisible">
      <el-form ref="subFormData" :model="subFormData" :rules="subFormDataRule" class="subFormData" label-width="100px">
        <el-form-item label="编码" prop="code">
          <el-input v-model="subFormData.code" maxlength="20" size="mini" auto-complete="off"/>
        </el-form-item>
        <el-form-item label="名称" prop="name">
          <el-input v-model="subFormData.name" maxlength="100" size="mini" auto-complete="off"/>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="subFormData.remark" maxlength="500" size="mini" auto-complete="off"/>
        </el-form-item>
        <el-form-item label="模板" prop="fileUrl">
          <el-upload class="upload-demo" 
          :limit="1"
          :http-request="handleUpload"
          action='undefined'
        :beforeUpload="beforeUpload"
          multiple>
            <i class="el-icon-upload"></i>
            <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
            <div class="el-upload__tip" slot="tip">只能上传js文件，且不超过1M</div>
          </el-upload>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button size="mini" @click="dialogFormVisible = false;showCronBox=false">取 消</el-button>
        <el-button size="mini" type="primary" @click="subForm('subFormData')">确 定</el-button>
      </div>
    </el-dialog>

    <!--分配界面-->
    <el-dialog width="50%" :title="'分配'" :visible.sync="allocationDialogFormVisible">
      <el-form ref="allocationSubFormData" :model="allocationSubFormData" :rules="allocationSubFormDataRule"
               class="allocationSubFormData" label-width="100px"
      >
        <el-form-item label="计划任务名称">
          <el-select v-model="allocationNames" multiple disabled size="mini" auto-complete="off">
            <el-option v-for="item in allocationNames" :key="item" :label="item" :value="item"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item v-show="false" label="items" prop="items">
          <el-input v-model="allocationSubFormData.items" size="mini" auto-complete="off"/>
        </el-form-item>
        <el-form-item label="租户" prop="sourceType">
          <el-select v-model="allocationSubFormData.tenantId" size="mini" @change="getComputers">
            <el-option v-for="(optItem,optindex) in tenants" :key="optindex" :label="optItem.name" :value="optItem.id"/>
          </el-select>
        </el-form-item>
        <el-form-item label="前置机" prop="sourceType">
          <el-select v-model="allocationSubFormData.computerId" size="mini">
            <el-option v-for="(optItem,optindex) in computers" :key="optindex" :label="optItem.name"
                       :value="optItem.id"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button size="mini" @click="allocationDialogFormVisible = false">取 消</el-button>
        <el-button size="mini" type="primary" @click="allocationSubForm('allocationSubFormData')">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import * as api from "@/api/addministrative";
import {
  upData,
  AddTemplate,
  GetTemplate,
  disableType,
  delType,
} from "@/api/Administrative";
export default {
  data() {
    return {
      planOptions: [],
      userCaseOptions: [],
      typeOptions: [],
      nameOptions: [],
      planCheckWay: 1,
      tenants: [],
      computers: [],
      dialogFormVisible: false,
      allocationDialogFormVisible: false,
      dialogRowTitle: null,
      selectionPropList: [],
      rowData: {
        id: null,
        name: null,
        code: null,
        plan: null,
        execService: null,
        cron: null,
        type: null,
        userCaseId: null,
        remark: null,
      },
      subFormData: {
        id: null,
        name: null,
        code: null,
        plan: null,
        execService: null,
        cron: null,
        type: "2",
        userCaseId: null,
        remark: null,
        fileUrl: null,
      },
      allocationSubFormData: {
        items: null,
        tenantId: null,
        computerId: null,
      },
      allocationNames: null,
      subFormDataRule: {
        name: [
          {
            required: true,
            message: "请填写名称",
          },
        ],
        code: [
          {
            required: true,
            message: "请填写编码",
          },
        ],
        plan: [
          {
            required: true,
            message: "请填写运行计划",
          },
        ],
        execService: [
          {
            required: true,
            message: "请填写绑定service",
          },
        ],
        cron: [
          {
            required: true,
            message: "请填写cron",
          },
        ],
        type: [
          {
            required: true,
            message: "请填写类型",
          },
        ],
        userCaseId: [
          {
            required: true,
            message: "请填写绑定用户场景",
          },
        ],
      },
      allocationSubFormDataRule: {
        tenantId: [
          {
            required: true,
            message: "请选择租户",
          },
        ],
        computerId: [
          {
            required: true,
            message: "请选择前置机",
          },
        ],
      },
      tableData: [],
      params: {
        currentPage: 1,
        pageSize: 10,
      },
      datas: {
        multipleSelection: [],
        params: {
          currentPage: 1,
          pageSize: 10,
        },
        table: {
          selection: true,
          loading: true,
        },
        resData: {
          rows: [],
          pageSize: 10,
          currentPage: 1,
          totalCount: 0,
        },
        filterList: [
           {
            type: 'input',
            prop: 'key',
            // 控制设置内部 复选框勾选的默认值
            // 控制该字段是否出现在表格里
             conditionshow: true,
            isHiddenSearchLabel: true,
            filedShow: false,
            // 控制搜索框的label显示与否
            label: '名称',
            placeholder: '关键词',
            optList: [],
            name: ''
          },
          {
            prop: "id",
            filedShow: true,
            label: "序号",
            placeholder: "序号",
            optList: [],
          },
          {
            type: "input",
            prop: "name",
      
            label: "名称",
            placeholder: "关键词",
            optList: [],
          },
          {
            prop: "code",
            conditionshow: false,
            filedShow: true,
            label: "编码",
            placeholder: "编码",
            optList: [],
          },
          {
            prop: "enable",
            conditionshow: false,
            filedShow: true,
            slot: true,
            label: "状态",
            placeholder: "状态",
            optList: [],
          },
          {
            type: "input",
            prop: "createTime",
            conditionshow: false,
            filedShow: true,
            label: "创建时间",
            placeholder: "创建时间",
            optList: [],
          },
          {
            prop: "lastUpdateTime",
            conditionshow: false,
            filedShow: true,
            label: "修改时间",
            placeholder: "修改时间",
            optList: [],
          },
          {
            prop: "oper",
            conditionshow: false,
            filedShow: true,
            isSearchHide: true,
            slot: true,
            label: "操作",
            placeholder: "操作",
            optList: [],
          },
        ],
      },
      showCronBox: false,
    };
  },
  async created() {},
  mounted() {},
  methods: {
    disableType(row) {
      console.log(row.enable);
      disableType(row.id).then((res) => {
        console.log(res);
        this.$message.success({
          message: "操作成功",
        });
        this.getData();
      });
    },
    beforeUpload(file) {
      if (file.size / (1024 * 1024) > 1) {
        return this.msgError("文件大小不能超过1M");
      }
      const formData = new FormData();
      formData.append("file", file);
      console.log("formData", formData);
      upData(formData).then((res) => {
        let fileUal = window._CONFIG["nginxUrl"] + res.model;
        this.subFormData.fileUrl = fileUal;
      });
    },
    handleUpload(file, fileList) {},
    inputByMenu() {
      this.subFormData.cron = null;
    },
    inputByCustom() {
      this.subFormData.cron = null;
    },
    // 删除
    remove(row) {
      this.$confirm("是否删除?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          delType(row.id).then((res) => {
            this.$message.success({
              message: "删除成功",
            });
            this.getData();
            // this.dialogFormVisible = false
          });
        })
        .catch(() => {});
    },
    allocation(row) {
      let items = [];
      let names = [];
      if (!row) {
        if (!this.datas.multipleSelection.length) {
          this.$message.info("请选择相关数据");
          return;
        }
        items = this.datas.multipleSelection.map((value) => {
          return value["id"];
        });
        names = this.datas.multipleSelection.map((value) => {
          return value["name"];
        });
      } else {
        items.push(row.id);
        names.push(row.name);
      }
      this.allocationNames = names;
      this.allocationDialogFormVisible = true;
      this.$set(this.allocationSubFormData, "items", items);
    },
    //新增的方法
    subForm(formData) {
      this.showCronBox = false;
      this.$refs[formData].validate((valid) => {
        if (valid) {
          let obj = {
            ...this.subFormData,
          };
          obj.showType = this.subFormData.id;
          console.log("obj", obj);
          AddTemplate(obj).then((res) => {
            this.$message.success("操作成功");
            this.getData(this.datas);
            this.dialogFormVisible = false;
          });
        } else {
          return false;
        }
      });
    },
    allocationSubForm(formData) {
      this.$refs[formData].validate((valid) => {
        if (valid) {
          api
            .submitAllocationForm(this[formData])
            .then((res) => {
              // console.log(this[formData])
              this.$message.success("分配成功");
              this.getData(this.datas);
              this.allocationDialogFormVisible = false;
            })
            .catch(() => {});
        } else {
          return false;
        }
      });
    },
    // 新增或编辑页面
    edit(row) {
      this.dialogFormVisible = true;
      if (!row) {
        this.$set(this, "subFormData", {
          name: null,
          code: null,
          plan: null,
          execService: null,
          cron: null,
          type: null,
          userCaseId: null,
          remark: null,
        });
        if (this.$refs["subFormData"]) {
          this.$refs["subFormData"].resetFields();
        }
        return;
      }
      this.$set(this.subFormData, "id", row.id);
      this.$set(this.subFormData, "name", row.name);
      this.$set(this.subFormData, "code", row.code);
      this.$set(this.subFormData, "plan", row.plan);
      this.$set(this.subFormData, "execService", row.execService);
      this.$set(this.subFormData, "cron", row.cron);
      this.$set(this.subFormData, "type", row.type);
      this.$set(this.subFormData, "userCaseId", row.userCaseId);
      this.$set(this.subFormData, "remark", row.remark);
    },
    getData(datas = this.datas) {
      this.$set(this, "datas", datas);
      this.$set(this, "params", datas.params);
      this.$set(this.datas.table, "loading", true);
      this.$set(this.params, "orgId", this.params.orgName);

      api
        .getPage({ ...this.params, key: this.datas.filterList[0].name })
        .then((res) => {
          this.$set(this.datas.resData, "rows", res.model);
          this.$set(this.datas.params, "currentPage", res.currentPage);
          this.$set(this.datas.params, "pageSize", res.pageSize);
          this.$set(this.datas.resData, "totalCount", res.totalCount);
          this.$set(this.datas.table, "loading", false);
        });
    },

    getComputers() {
      this.allocationSubFormData.computerId = null;
      const tenantId = this.allocationSubFormData.tenantId;
      api
        .getComputers(tenantId)
        .then((res) => {
          console.log(res.model);
          this.computers = res.model;
          if (this.computers.length === 1) {
            this.allocationSubFormData.computerId = this.computers[0].id;
          }
        })
        .catch((e) => {
          return false;
        });
    },
  },
};
</script>

<style lang="scss" scoped>
</style>
