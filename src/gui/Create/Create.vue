<template>
  <div>
    <my-tool></my-tool>
    <draw-board></draw-board>
    <setting-board></setting-board>
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
  data() {
    return {
     
    };
  },
  methods: {
   
  }
};
</script>

<style>

</style>
