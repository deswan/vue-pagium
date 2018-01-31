<template>
  <div>
    <div class="header"></div>
    <my-dash></my-dash>
    
    <div id="main">
      <draw-board></draw-board>
    </div>
      <my-tool></my-tool>
  </div>
</template>

<script>
import Dash from './Dash/Index.vue';
import DrawBoard from './DrawBoard/DrawBoard.vue';
import Tool from './Tool/Tool.vue';
export default {
    components:{
        myDash:Dash,
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
