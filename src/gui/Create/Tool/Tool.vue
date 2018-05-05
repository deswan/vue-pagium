<template>
  <div class="toolbox">
      <hierarchy-tree 
      @on-node-row-click="nodeClick" 
      v-model="draggingNode" 
      :node="data_com" 
      class="hierarchy" 
      @addCom="addCom" 
      @on-change="nodeChange"
      @on-del-btn-click="delCom"
      type="components"
      >
      </hierarchy-tree>      

      <hierarchy-tree  
      :style="{marginTop:'14px'}"
      @on-node-row-click="nodeClick"  
      v-model="draggingNode" 
      :node="data_dialog" 
      isDialog
      class="hierarchy" 
      @addCom="addCom" 
      @on-change="nodeChange"
      @on-del-btn-click="delCom"
      type="dialogs"
      >
      </hierarchy-tree> 
  </div>
</template>

<script>
import Hierarchy from "./Hierarchy";

export default {
  components: {
    HierarchyTree: Hierarchy
  },
  data() {
    return {
      draggingNode: null
    };
  },
  computed:{
    data_com(){
      return {
        name: "组件",
        children: this.$store.getters.components,
        isRoot: true
      }
    },
    data_dialog(){
      return {
        name: "对话框组件",
        children: this.$store.getters.dialogs,
        isRoot: true
      }
    }
  },
  methods: {
    nodeChange(e) {
      this.$store.commit("nodeChange", e);
    },
    nodeClick(comObj) {
      this.$store.commit("activateComponent", { comObj });
    },
    delCom(data) {
      this.$store.commit("delComponent", data);
    },
    addCom(data) {
      this.$store.commit("addComponent", data);
    }
  }
};
</script>

<style scoped>
.toolbox {
  position: fixed;
  width: 250px;
  background: #eeeeee;
  left: 0;
  top: 60px;
  bottom: 0;
  padding: 20px 0;
  user-select: none;
  z-index: 999;
  box-sizing: border-box;
  word-wrap: break-word;
}

.add-btn {
  margin-left: 10px;
}
</style>
