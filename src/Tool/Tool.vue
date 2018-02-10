<template>
  <div class="toolbox">
      <el-popover placement="right-end" trigger="click">
        <el-button slot="reference" type="primary">添加组件</el-button>
        <div class="com-lib">
            <div @click="addCom(com)" class="com-lib-item" v-for="(com,key) in allComs" :key="key">{{com.name}}</div>
        </div>
      </el-popover>
      <ul>
          <template v-for="comObj in $store.state.components">
              <layer-folder v-if="comObj.subCom && comObj.subCom.length" :key="comObj.id" :com-obj="comObj"></layer-folder>
              <layer-item v-else :key="comObj.id" :com-obj="comObj"></layer-item>
          </template>
      </ul>
      
      <div v-if="$store.state.dialogs.length">
       <div style="margin-top:20px">对话框</div>
       <ul>
            <layer-item :key="comObj.id" :com-obj="comObj" v-for="comObj in $store.state.dialogs"></layer-item>
      </ul>
      </div>
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
  Table,
  Dialog
};
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
    addCom(com) {
      this.$store.commit("addComponent", {
        id: +new Date(),
        name: com.name,
        type: com.name,
        props: config2Default(allComsConfig[COM.name]),
        com,
        subCom: null
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
.com-lib {
  width: 150px;
}
.com-lib-item {
  display: inline-block;
  width: 75px;
  height: 75px;
  line-height: 75px;
  text-align: center;
  border-radius: 10px;
}
.com-lib-item:hover {
  background-color: whitesmoke;
}
</style>
