<template>
  <div id="app">
    <my-app></my-app>
  </div>
</template>

<script>
import Main from './Main.vue'
export default {
  components:{
    myApp:Main
  }
}
</script>

<style lang="scss">
#app {
  font-family: Helvetica, sans-serif;
  text-align: center;
}
body{
  margin:0;
  background: #F3F3F3;
}
ul{
  margin:0;
  padding: 0;
}
</style>
