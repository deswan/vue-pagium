<template>
  <div id="app">
    <div class="header">
      <el-menu :default-active="$route.path" mode="horizontal" background-color="#545c64"
  text-color="#fff" active-text-color="#ffd04b" router>
        <el-menu-item index="/">模板</el-menu-item>
        <el-menu-item index="/create" >编辑页面</el-menu-item>
      </el-menu>
    </div>
    <router-view></router-view>
  </div>
</template>

<script>
export default {
  data(){
    return {
      defaultActive:'/'
    }
  },
  methods: {
    
  }
};
</script>

<style>
#app {
  font-family: Helvetica, sans-serif;
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
.main {
  box-sizing: border-box;
  position: absolute;
  top: 60px;
  left: 200px;
  right: 460px;
  height: calc(100vh - 60px);
  background-color: whitesmoke;
  overflow: auto;
}
.save-btn {
  float: right;
}
</style>
