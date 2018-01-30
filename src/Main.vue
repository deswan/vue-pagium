<template>
  <div>
    <div class="header"></div>
    <my-dash></my-dash>
  </div>
</template>

<script>
import Dash from './Dash/Index.vue';
export default {
    components:{
        myDash:Dash
    }
}
</script>

<style scoped>
.header{
  position: absolute;
  width: 100%;
  height: 60px;
  background: #409EFF;
  z-index: 999;
}
</style>
