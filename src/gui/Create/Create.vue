<template>
  <div>
    <setting-board></setting-board>
    
    <div class="main">
      <el-button class="save-btn" @click="save">save</el-button>
      
      <draw-board></draw-board>
    </div>
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
  methods: {
    save() {
      this.$store.dispatch('save',{vm:this})
    }
  }
};
</script>

<style scoped>

</style>
