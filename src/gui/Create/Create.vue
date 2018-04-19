<template>
  <div>
    <setting-board></setting-board>
    
    <div class="main">
      <el-button class="save-btn" @click="save" type="primary" :loading="saving">保存</el-button>
      <el-button class="save-btn" @click="preview" :loading="previewing">预览</el-button>
      <el-button class="save-btn" @click="openSaveAsTemplate">生成模板</el-button>
      <el-button class="save-btn" @click="clear">清空</el-button>
      
      <draw-board></draw-board>
    </div>
    <el-dialog title="模板信息" :visible.sync="saveAsTemplateDialog.show" @close="closeSaveAsTemplate">
      <el-form :model="saveAsTemplateDialog.form" ref="saveAsTemplate">
        <el-form-item label="模板名称" prop="name" :rules="{required:true,message:'请输入模板名称'}">
          <el-input v-model="saveAsTemplateDialog.form.name"></el-input>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="saveAsTemplateDialog.form.remark"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="saveAsTemplateDialog.show = false">取 消</el-button>
        <el-button type="primary" @click="saveAsTemplate" :loading="saveAsTemplateDialog.commiting">确 定</el-button>
      </div>
    </el-dialog>
    <my-tool></my-tool>
  </div>
</template>

<script>
import SettingBoard from "./SettingBoard/SettingBoard.vue";
import DrawBoard from "./DrawBoard/DrawBoard.vue";
import Tool from "./Tool/Tool.vue";
export default {
  components: {
    SettingBoard,
    DrawBoard,
    myTool: Tool
  },
  data() {
    return {
      saving: false,
      previewing: false,
      saveAsTemplateDialog: {
        show: false,
        commiting: false,
        form: {
          name: "",
          remark: ""
        }
      }
    };
  },
  methods: {
    save() {
      this.saving = true;
      this.$store
        .dispatch("save", { vm: this })
        .then(({ data }) => {
          this.saving = false;
          this.$message.success("保存成功 "+data.data);
        })
        .catch(err => {
          this.saving = false;
          this.$message.error("保存失败：" + err.message);
        });
    },
    preview() {
      this.previewing = true;
      this.$store
        .dispatch("preview", { vm: this })
        .then(({ data }) => {
          this.previewing = false;
          window.open("/preview", "_blank");
        })
        .catch(err => {
          this.previewing = false;
          this.$message.error("预览失败：" + err.message);
        });
    },
    openSaveAsTemplate() {
      if (this.$route.params.templateId) {
        this.$http
          .get("/template", {
            params: {
              id: this.$route.params.templateId
            }
          })
          .then(({ data }) => {
            this.saveAsTemplateDialog.form.name = data.data.name;
          })
          .catch(err => {});
      }
      this.saveAsTemplateDialog.show = true;
    },
    saveAsTemplate() {
      const request = isCover => {
        this.$http
          .post("/saveAsTemplate", {
            name: this.saveAsTemplateDialog.form.name,
            remark: this.saveAsTemplateDialog.form.remark,
            data: this.$store.getters.data,
            isCover: !!isCover
          })
          .then(({ data }) => {
            if (data.code === 0) {
              this.saveAsTemplateDialog.commiting = false;
              this.saveAsTemplateDialog.show = false;
              this.$message.success("保存模板成功");
            } else if (data.code === 1) {
              this.$confirm("将覆盖原有模板，是否允许？")
                .then(_ => {
                  this.saveAsTemplateDialog.commiting = false;
                  request(true);
                })
                .catch(_ => {
                  this.saveAsTemplateDialog.commiting = false;
                });
            }
          })
          .catch(err => {
            this.saveAsTemplateDialog.commiting = false;
            this.$message.error("保存模板失败：" + err.message);
          });
      };

      this.$refs.saveAsTemplate
        .validate()
        .then(() => {
          this.saveAsTemplateDialog.commiting = true;
          request();
        })
        .catch(() => {});
    },
    closeSaveAsTemplate() {
      this.$refs.saveAsTemplate.resetFields();
      this.saveAsTemplateDialog.commiting = false;
    },
    clear() {
      this.$store.commit("clearData");
    }
  }
};
</script>

<style scoped>

</style>
