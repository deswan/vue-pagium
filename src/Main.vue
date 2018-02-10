<template>
  <div>
    <div class="header"></div>
    <setting-board></setting-board>
    
    <div id="main">
      <draw-board></draw-board>
    </div>
      <my-tool></my-tool>
  </div>
</template>

<script>
import SettingBoard from './SettingBoard/SettingBoard.vue';
import DrawBoard from './DrawBoard/DrawBoard.vue';
import Tool from './Tool/Tool.vue';
export default {
    components:{
        SettingBoard,
        DrawBoard,
        myTool:Tool
    }
}
</script>

<style scoped>
.header{
  position: fixed;
  width: 100%;
  height: 60px;
  background: #409EFF;
  z-index: 999;
}
#main{
  box-sizing: border-box;
  position: absolute;
  top:60px;
  left: 100px;
  right: 500px;
  height: calc(100vh - 60px);
  background-color: whitesmoke;
  overflow:auto;
}
</style>
