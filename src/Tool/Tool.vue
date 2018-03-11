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
      type="components"
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
      type="dialogs"
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
      subCom: this.$store.getters.dialogs,
      isRoot: true
    };
  },
  methods: {
    nodeChange(e) {
      this.$store.commit("nodeChange", e);
    },
    nodeClick(comObj) {
      this.$store.commit("activateComponent", { comObj });
    },
    delCom(root, node) {
      this.$store.commit("delComponent", { list: root, node });
    },
    addCom({ com, node }) {
      let config = allComsConfig[com.name];
      this.$store.commit("addComponent", {
        node,
        comObj: {
          pg:0,
          type: com.name,
          nestable: config.nestable,
          isDialog: config.isDialog,
          props: { ...scheme2Default(config.props) },
          com,
          subCom: []
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
