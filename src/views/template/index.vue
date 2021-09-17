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
  <el-button size="mini" type="text" @click="edit(scope.value)">编辑</el-button>
  <el-button size="mini" type="text" @click="disableType(scope.value)">
    {{scope.value.enable ? "禁用" : "启用"}}
  </el-button>
  <!-- <el-button size="mini" type="text" @click="remove(scope.value)">删除</el-button> -->
  <el-button size="mini" type="text" @click="download(scope.value)">下载</el-button>
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
        <el-form-item label="模板" prop="fileUrl" v-if="!subFormData.id">
          <el-upload 
            :on-exceed="exceedFile"
            :file-list="fileList"
            :limit="1"
            :http-request="handleUpload"
            action='undefined'
            :beforeUpload="beforeUpload">
              <el-button size="small" type="primary">点击上传</el-button>
          </el-upload>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button size="mini" @click="dialogFormVisible = false;showCronBox=false">取 消</el-button>
        <el-button size="mini" type="primary" @click="subForm('subFormData')" v-prevent-repeat-click>确 定</el-button>
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
      fileList:[],
      typeOptions: [],
      nameOptions: [],
      dialogFormVisible: false,
      dialogRowTitle: null,
      subFormData: {
        id: null,
        name: null,
        code: null,
        remark: null,
        fileUrl: null,
      },
      subFormDataRule: {
        name: [
          {
            required: true,
            message: "请填写名称",
            trigger: 'blur'
          },
        ],
        code: [
          {
            required: true,
            message: "请填写编码",
            trigger: 'blur'
          },
        ],
        type: [
          {
            required: true,
            message: "请填写类型",
            trigger: 'blur'
          },
        ]
      },
      params: {
        currentPage: 1,
        pageSize: 10,
      },
      datas: {
        // multipleSelection: [],
        nosubmit: false,//true设置按钮消失 
        noresetForm:false,
        params: {
          currentPage: 1,
          pageSize: 10,
        },
        table: {
          orderNo: true,
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
            prop: 'name',
            // 控制设置内部 复选框勾选的默认值
            conditionshow: true,
            // 控制该字段是否出现在表格里
            filedShow: true,
            // 控制搜索框的label显示与否
            isHiddenSearchLabel: true,
            label: '名称',
            placeholder: '关键词'
          },
          {
            prop: "code",
            conditionshow: false,
            filedShow: true,
            label: "编码",
            placeholder: "编码"
          },
          {
            prop: "enable",
            filedShow: true,
            slot: true,
            label: "状态",
            placeholder: "状态"
          },
          {
            type: "input",
            prop: "createTime",
            filedShow: true,
            label: "创建时间",
            placeholder: "创建时间"
          },
          {
            prop: "lastUpdateTime",
            filedShow: true,
            label: "修改时间",
            placeholder: "修改时间"
          },
          {
            prop: "oper",
            conditionshow: false,
            filedShow: true,
            isSearchHide: true,
            slot: true,
            label: "操作",
            placeholder: "操作",
            optList: []
          },
        ],
      },
      showCronBox: false,
    };
  },
  async created() {},
  mounted() {},
  methods: {
    exceedFile(files, fileList) {
      this.$notify.warning({
        title: '警告',
        message: `只能选择1个文件，当前共选择了 ${files.length + fileList.length} 个`
      });
    },
    disableType(row) {
      let obj = {
        enable:row.enable,
        id:row.id
      }
      disableType(obj).then((res) => {
        this.$message.success({
          message: "操作成功",
        });
        this.getData();
      });
    },
    beforeUpload(file) {
      if (file.size / (1024 * 1024) > 5) {
          this.$notify.warning({
            title: '警告',
            message: `文件大小不得超过5M`
          });
      }else{
        const formData = new FormData();
        formData.append("file", file);
        upData(formData).then((res) => {
          this.subFormData.fileUrl = res.model;
        });
      }
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
    download(row) {
      location.href = `${process.env.VUE_APP_BASE_API}/services/fwcore/template/down/${row.id}`
    },
    //新增的方法
    subForm(formData) {
      this.showCronBox = false;
      this.$refs[formData].validate((valid) => {
        if (valid) {
          let obj = {
            ...this.subFormData,
          };
        obj.showType=  obj.id? true:false
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
    // 新增或编辑页面
    edit(row) {
      this.dialogFormVisible = true
      this.fileList = []
      //如果是新增
      if (row===0) {
        //清空属性值
        Object.keys(this.subFormData).forEach((key) => (this.subFormData[key] = null));
        return
      }
      //如果是更新
      this.subFormData = {
        ...row
      }
      //解构赋值id丢失，所以在这里单独设置一下id，原因待查找
      // this.subFormData.id = row.id
    },
    getData(datas = this.datas) {
      this.$set(this, "datas", datas);
      this.$set(this, "params", datas.params);
      this.$set(this.datas.table, "loading", true);
      this.$set(this.params, "orgId", this.params.orgName);
 
      api.getPage({ key:this.params.name}).then((res) => {
          this.$set(this.datas.resData, "rows", res.model);
          this.$set(this.datas.params, "currentPage", res.currentPage);
          this.$set(this.datas.params, "pageSize", res.pageSize);
          this.$set(this.datas.resData, "totalCount", res.totalCount);
          this.$set(this.datas.table, "loading", false);
        });
    }
  }
};
</script>

<style lang="scss" scoped>
</style>
