<template>
  <div class="detail">
      组件详情
      <el-form :model="form" label-suffix="：" v-if="$store.state.activeCOM">
            <component v-for="item in config2Components(config[$store.state.activeCOM.name])" :value="config2Default(item.config)" :key="item.name" :label="item.label" :name="item.name" :is="item.component" v-bind="item.props"></component>
      </el-form>
  </div>
</template>

<script>
import TableConfig from '../Components/Table/config'
import DialogConfig from '../Components/Dialog/config'
import config2Components from './config2Components'
import config2Default from './config2Default'
const config = {
  Table:TableConfig,
  Dialog:DialogConfig
}
export default {
  data(){
    return {
      config,config2Components,config2Default,
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
