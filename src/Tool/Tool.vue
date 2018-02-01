<template>
  <div class="toolbox">
      <el-popover placement="right-end" trigger="click">
        <el-button slot="reference" type="primary">添加组件</el-button>
        <div class="com-lib">
            <div @click="addCom(com,name)" class="com-lib-item" v-for="(com,name) in allComs" :key="name">{{name}}</div>
        </div>
      </el-popover>
      <ul>
          <template v-for="(com,idx) in $store.state.components">
              <layer-folder v-if="com.subCOM && com.subCOM.length" :key="idx" :com="com"></layer-folder>
              <layer-item v-else :key="idx" :com="com"></layer-item>
          </template>
      </ul>
       <ul>
            <layer-item :key="idx" :com="com" v-for="(com,idx) in $store.state.dialogs"></layer-item>
      </ul>
  </div>
</template>

<script>
import Table from "../Components/Table/Table.vue";
import TableConfig from "../Components/Table/config";
import Dialog from "../Components/Dialog/Dialog.vue";
import DialogConfig from "../Components/Dialog/config";

import LayerItem from "./LayerItem.vue";
import LayerFolder from "./LayerFolder.vue";

import config2Default from "./config2Default.js";
const allComs = {
    Table,Dialog
}
const allComsConfig = {
  Table:TableConfig, Dialog:DialogConfig
}
export default {
  components: {
    LayerItem,
    LayerFolder
  },
  data() {
    return {
        allComs
    };
  },
  methods: {
    addCom(COM,name) {
      this.$store.commit("addCOM", {
        _id: +new Date(),
        name,
        props: config2Default(allComsConfig[COM.name]),
        COM,
        subCOM: null
      });
    }
  }
};
</script>

<style scoped>
.toolbox {
  position: fixed;
  width: 100px;
  background: whitesmoke;
  left: 0;
  top: 60px;
  padding-top: 20px;
  height: 100%;
}
.com-lib{
    width: 150px;
}
.com-lib-item{
    display: inline-block;
    width: 75px;
    height: 75px;
    line-height: 75px;
    text-align: center;
    border-radius: 10px;
}
.com-lib-item:hover{
    background-color: whitesmoke;
}
</style>
