<template>
  <div class="toolbox">
      <el-button @click="addCom" type="primary">添加组件</el-button>
  </div>
</template>

<script>
export default {
  created(){
  },
  data(){
    return {
      form:{
        
      }
    }
  },
  methods:{
      addCom(){
          this.$store.commit('addCOM',{
              name:'Table',
              props:{}
          })
      }
  }
}
</script>

<style scoped>
.toolbox{
    position: fixed;
    width: 100px;
    background: white;
    left: 0;
    top:60px;
    padding-top: 20px;
    height: 100%;
}
</style>
