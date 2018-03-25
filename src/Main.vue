<template>
  <div>
    <div class="header">
      <el-button class="save-btn" @click="save">save</el-button>
    </div>
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
import axios from 'axios';
export default {
    components:{
        SettingBoard,
        DrawBoard,
        myTool:Tool
    },
    methods:{
      save(){
        axios.post('/save',this.$store.getters.data)
      }
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
  left: 200px;
  right: 460px;
  height: calc(100vh - 60px);
  background-color: whitesmoke;
  overflow:auto;
}
.save-btn{
  float: right;
}
</style>
