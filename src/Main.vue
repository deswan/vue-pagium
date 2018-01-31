<template>
  <div>
    <div class="header"></div>
    <my-dash></my-dash>
    
    <div id="main">
      <my-tool></my-tool>
      <draw-board></draw-board>
    </div>
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
  position: relative;
  margin-right: 500px;
  margin-left: 100px;
  padding-top: 60px;
  box-sizing: border-box;
  height: 100vh
}
</style>
