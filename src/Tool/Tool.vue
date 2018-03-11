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
import Dialog from "../Components/Dialog/Dialog.vue";
import Hierarchy from "./Hierarchy";

const allComs = {
  Table,
  Dialog
};
export default {
  components: {
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
    addCom({ comVm, node }) {
      this.$store.commit("addComponent", { node, comVm });
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
</style>
