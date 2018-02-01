<template>
<div class="board-wrapper">
  <div class="main-board">
      <com-wrapper :com="com" v-for="(com,idx) in $store.state.components" :key="idx"></com-wrapper>
  </div>
<com-wrapper :com="com"  v-for="(com,idx) in $store.state.dialogs" :key="idx"></com-wrapper>
</div>
</template>

<script>
import COMWrapper from "./COMWrapper.vue";
import {on,off} from "element-ui/src/utils/dom";
export default {
  components: {
      'comWrapper':COMWrapper
  },
  created() {},
  mounted(){
    //   on(document,'click',(e)=>{
    //       this.$store.commit('blurCOM')
    //   })
  },
  data() {
    return {};
  }
};
</script>

<style>
.main-board {
  position: absolute;
  top: 40px;
  left: 200px;
  width: 600px;
  height: 800px;
  background-color: white;
}
.board-wrapper{
    position: relative;
    height: 2000px;
    width: 2000px;
}
.dialog-board{
    position: absolute;
    left: 850px;
    width: 400px;
    height: 300px;
    background-color: white;
}
</style>
