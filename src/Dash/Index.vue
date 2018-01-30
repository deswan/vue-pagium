<template>
  <div class="detail">
      组件详情
      <el-form :model="form" label-suffix="：">
            <component v-for="item in components" :key="item.name" :label="item.label" :is="item.component" v-bind="item.props"></component>
      </el-form>
  </div>
</template>

<script>
import config from './config'
import config2Components from './config2Components'

export default {
  created(){
  },
  data(){
    return {
      components:config2Components(config),
      form:{
        
      }
    }
  }
}
</script>

<style scoped>
.detail{
  box-sizing: border-box;
  padding: 20px 30px 100px;
  width: 500px;
  background: white;
  position: fixed;
  right: 0;
  top:60px;
  height: 100%;
  overflow: auto
}
</style>
