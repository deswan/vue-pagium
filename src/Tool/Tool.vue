<template>
  <div class="toolbox">
      <hierarchy-tree 
      @on-node-row-click="nodeClick" 
      v-model="draggingNode" 
      :node="data_com" 
      :all-coms="allComs" 
      class="hierarchy" 
      @addCom="addCom" 
      @on-change="nodeChange"
      @on-del-btn-click="delCom(data_com,$event)"
      >
      </hierarchy-tree>      
    
      <hierarchy-tree 
      @on-node-row-click="nodeClick" 
      v-model="draggingNode" 
      :node="data_dialog" 
      :all-coms="allComs" 
      class="hierarchy" 
      @addCom="addCom" 
      @on-change="nodeChange"
      @on-del-btn-click="delCom(data_dialog,$event)"
      >
      </hierarchy-tree> 
  </div>
</template>

<script>
import Table from "../Components/Table/Table.vue";
import TableConfig from "../Components/Table/config";
import Dialog from "../Components/Dialog/Dialog.vue";
import DialogConfig from "../Components/Dialog/config";
import Hierarchy from "./Hierarchy";

import LayerItem from "./LayerItem.vue";
import LayerFolder from "./LayerFolder.vue";

import scheme2Default from "./scheme2Default.js";
const allComs = {
  Table,
  Dialog
};
const allComsConfig = {
  Table: TableConfig,
  Dialog: DialogConfig
};
export default {
  components: {
    LayerItem,
    LayerFolder,
    HierarchyTree: Hierarchy
  },
  data() {
    return {
      allComs,
      data_com: {},
      data_dialog: {},
      draggingNode: null
    };
  },
  created() {
    this.data_com = {
      name: "组件",
      subCom: this.$store.getters.components,
      isRoot: true
    };
    this.data_dialog = {
      name: "对话框",
      subCom: this.$store.state.dialogs,
      isRoot: true
    };
  },
  watch: {
    "$store.state.components"(v) {
      console.log("this.$store.state.components", v);
    }
  },
  methods: {
    nodeChange(e) {
      this.$store.commit("nodeChange", e);
    },
    nodeClick(e) {
      this.$store.commit("activateComponent", {
        comObj: e
      });
    },
    delCom(root, node) {
      this.$store.commit("delComponent", { list: root, node });
    },
    addCom({ com, node }) {
      this.$store.commit("addComponent", {
        node,
        comObj: {
          type: com.name,
          nestable: allComsConfig[com.name].nestable,
          props: { ...scheme2Default(allComsConfig[com.name].props) },
          com,
          subCom: null
        }
      });
    }
  }
};
</script>

<style scoped>
.toolbox {
  position: fixed;
  width: 200px;
  background: #eeeeee;
  left: 0;
  top: 60px;
  padding: 20px 0 0;
  height: 100%;
  user-select: none;
  text-align: left;
  z-index: 999;
}

.add-btn {
  margin-left: 10px;
}
.hierarchy {
}
</style>
