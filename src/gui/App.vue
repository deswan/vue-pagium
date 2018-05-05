<template>
  <div id="app">
    <div class="header">
      <el-menu :default-active="$route.path" mode="horizontal" background-color="#545c64"
  text-color="#fff" active-text-color="#ffd04b" router>
        <el-menu-item index="/">模板</el-menu-item>
        <el-menu-item index="/create" >编辑页面</el-menu-item>
        <el-menu-item index="/doc" >关于</el-menu-item>
      </el-menu>
    </div>
    <div class="btn-group" :class="{['btn-group-show']:showBtn}">
        <el-button type="primary" size="small" @click="save" :loading="saving">保存</el-button>
        <el-button type="info" size="small" @click="preview" :loading="previewing">预览</el-button>
        <el-button size="small" @click="saveAsJSON" :loading="savingAsJSON">生成JSON</el-button>
        <el-button type="success" size="small" @click="openSaveAsTemplate">生成模板</el-button>
        <el-button type="danger" size="small" @click="clear">清空</el-button>
    </div>
    <router-view></router-view>
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
        <el-button type="primary" @click="saveAsTemplate" :loading="saveAsTemplateDialog.commiting">保 存</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      defaultActive: "/",
      showBtn: false,

      //按钮加载状态
      saving: false,
      savingAsJSON: false,
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
  created() {
    this.$store.dispatch("getLastestInput");
  },
  mounted() {
    if (this.$route.name === "create") {
      this.showBtn = true;
    }
  },
  methods: {
    save() {
      this.saving = true;
      this.$http
        .post("/save", this.$store.getters.data)
        .then(({ data }) => {
          if (data.code === 0) {
            this.saving = false;
            this.$message.success("保存成功 " + data.data);
          } else {
            throw new Error(data.data);
          }
        })
        .catch(err => {
          this.saving = false;
          this.$message.error("保存失败：" + err.message);
        });
    },
    preview() {
      this.previewing = true;
      this.$http
        .post("/preview", this.$store.getters.data)
        .then(({ data }) => {
          if (data.code === 0) {
            this.previewing = false;
            window.open("/preview", "_blank");
          } else {
            throw new Error(data.data);
          }
        })
        .catch(err => {
          this.previewing = false;
          this.$message.error("预览失败：" + err.message);
        });
    },
    openSaveAsTemplate() {
      if (this.$store.state.curTemplate) {
        this.saveAsTemplateDialog.form.name = this.$store.state.curTemplate.name;
        this.saveAsTemplateDialog.form.remark = this.$store.state.curTemplate.remark;
      }
      this.saveAsTemplateDialog.show = true;
    },
    saveAsTemplate() {
      const request = isCover => {
        this.saveAsTemplateDialog.commiting = true;
        this.$http
          .post("/saveAsTemplate", {
            name: this.saveAsTemplateDialog.form.name,
            remark: this.saveAsTemplateDialog.form.remark,
            data: this.$store.getters.data,
            isCover: !!isCover,
            allComsConfig: this.$store.getters.allComsConfig
          })
          .then(({ data }) => {
            this.saveAsTemplateDialog.commiting = false;
            if (data.code === 0) {
              this.saveAsTemplateDialog.show = false;
              this.$message.success("保存模板成功");
            } else if (data.code === 1) {
              this.$confirm("将覆盖原有模板，是否允许？", "提示", {
                type: "info"
              })
                .then(_ => {
                  request(true);
                })
                .catch(_ => {});
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
          request();
        })
        .catch(() => {});
    },
    closeSaveAsTemplate() {
      this.$refs.saveAsTemplate.resetFields();
      this.saveAsTemplateDialog.commiting = false;
    },
    clear() {
      this.$confirm("确定清空此页面么", "提示", {
        type: "warning"
      })
        .then(_ => {
          this.$store.commit("clearData");
        })
        .catch(err => {});
    },
    saveAsJSON() {
      this.$http
        .post("/saveAsJSON", this.$store.getters.data)
        .then(({ data }) => {
          if (data.code === 0) {
            this.savingAsJSON = false;
            this.$message.success("保存成功 " + data.data);
          } else {
            throw new Error(data.data);
          }
        })
        .catch(err => {
          this.savingAsJSON = false;
          this.$message.success("保存失败 " + data.data);
        });
    }
  },
  watch: {
    $route(newValue, oldValue) {
      if (newValue.name === "create") {
        this.showBtn = true;
      } else {
        this.showBtn = false;
      }
    }
  }
};
</script>

<style>
#app {
  font-family: Consolas, Menlo;
}
body {
  margin: 0;
  background: #f3f3f3;
}
ul {
  margin: 0;
  padding: 0;
}
.header {
  width: 100%;
}
.btn-group {
  position: fixed;
  z-index: 999;
  top: 6px;
  right: 20px;
  background: dimgray;
  padding: 8px 30px;
  border-radius: 2px;
  transition: all 0.2s ease;
  opacity: 0;
}
.btn-group-show {
  transition-duration: 0.5s;
  opacity: 1;
}
</style>
