<template>
  <div id="app">
    <div class="header">
      
      <el-menu :default-active="$route.path" mode="horizontal" background-color="#545c64"
  text-color="#fff" active-text-color="#ffd04b" router>
        <el-menu-item index="/">
        <img class="logo" src="./assets/logo.png" alt="">
        <span class="logo-text">pagium</span>
        </el-menu-item>
        <el-menu-item index="/create" >编辑器</el-menu-item>
      </el-menu>
    </div>
    <div class="btn-group" :class="{['btn-group-show']:showBtn}">
        <el-dropdown @command="selectPage" size="medium" trigger="click">
          <span class="root-dropdown">
            根组件: {{$store.state.page || '无'}} <i class="el-icon-arrow-down el-icon--right"></i>
          </span>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item command="">无</el-dropdown-item>
            <el-dropdown-item v-for="page in Object.keys($store.state.pages)" :key="page" :command="page">{{page}}</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
        <el-popover
          placement="bottom"
          trigger="hover">
          <span class="save-path">输出路径：{{savePath}}</span>
            <el-button slot="reference" type="primary" size="small" @click="save" :loading="saving">生成</el-button>
        </el-popover>
        <el-button type="info" size="small" @click="preview" :loading="previewing">预览</el-button>
         <el-popover
          placement="bottom"
          trigger="hover">
          <span class="save-path">输出路径：{{jsonSavePath}}</span>
          <el-button slot="reference" size="small" @click="saveAsJSON" :loading="savingAsJSON">生成JSON</el-button>
        </el-popover>
        <el-button type="success" size="small" @click="openSaveAsTemplate">保存为模板</el-button>
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

      pages: [],

      //按钮加载状态
      saving: false,
      savingAsJSON: false,
      previewing: false,

      //savePath
      savePath: "",
      jsonSavePath: "",

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
    //获取所有根组件
    this.$http
      .get("/pages")
      .then(({ data }) => {
        this.$store.commit("fillPages", data.data);
      })
      .catch(err => {});

    //获取编辑器状态信息
    this.$store.dispatch("getLastestInput");

    //获取保存路径
    this.$http
      .get("/getSavePath")
      .then(({ data }) => {
        this.savePath = data.savePath;
        this.jsonSavePath = data.jsonSavePath;
      })
      .catch(err => {});
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
        .post("/save", {
          components: this.$store.getters.data,
          page: this.$store.state.page
        })
        .then(({ data }) => {
          if (data.code === 0) {
            this.saving = false;
            this.$message.success(`${data.data} 生成成功`);
          } else {
            throw new Error(data.data);
          }
        })
        .catch(err => {
          this.saving = false;
          this.$message.error("生成失败：" + err.message);
        });
    },
    preview() {
      this.previewing = true;
      this.$http
        .post("/preview", {
          components: this.$store.getters.data,
          page: this.$store.state.page
        })
        .then(({ data }) => {
          if (data.code === 0) {
            this.previewing = false;
            window.open("/preview", "_blank")
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
            data: {
              page: this.$store.state.page,
              components: this.$store.getters.data
            },
            isCover: !!isCover,
            allComsConfig: this.$store.getters.allComsConfig
          })
          .then(({ data }) => {
            this.saveAsTemplateDialog.commiting = false;
            if (data.code === 0) {
              this.saveAsTemplateDialog.show = false;
              this.$message.success("保存模板成功");
            } else if (data.code === 1) {
              this.$confirm("将覆盖原有模板，是否修改？", "提示", {
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
      this.$confirm("确定清空组件么", "提示", {
        type: "warning"
      })
        .then(_ => {
          this.$store.commit("clearData");
        })
        .catch(err => {});
    },
    saveAsJSON() {
      this.$http
        .post("/saveAsJSON", {
          components: this.$store.getters.data,
          page: this.$store.state.page
        })
        .then(({ data }) => {
          if (data.code === 0) {
            this.savingAsJSON = false;
            this.$message.success(`${data.data} 生成成功`);
          } else {
            throw new Error(data.data);
          }
        })
        .catch(err => {
          this.savingAsJSON = false;
          this.$message.success("生成JSON失败 " + err.message);
        });
    },
    selectPage(page) {
      this.$store.commit("fillPage", page);
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
  right: 30px;
  /* left: 300px; */
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
.save-path {
  font-size: 12px;
}
.root-dropdown {
  color: lightgrey;
  cursor: pointer;
  font-size: 12px;
}
.logo{
  width: 30px;
}
.logo-text{
  text-shadow:gray 2px 2px 2px;
  color:#eee;
}
</style>
