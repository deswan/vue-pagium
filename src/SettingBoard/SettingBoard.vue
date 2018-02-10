<template>
  <div class="setting">
      <el-form :model="form" label-suffix="：" v-if="$store.state.activedComponent">
        <el-form-item :label="label" v-for="item in scheme2Input(config[$store.state.activedComponent.type])" :key="item.name">
            <component :is="item.input" v-bind="item.props"></component>
        </el-form-item>
      </el-form>
  </div>
</template>

<script>
import TableConfig from '../Components/Table/config'
import DialogConfig from '../Components/Dialog/config'
import scheme2Input from './scheme2Input'
const config = {
  Table:TableConfig,
  Dialog:DialogConfig
}
export default {
  data(){
    return {
      config,scheme2Input,
      form:{

      }
    }
  }
}
</script>

<style scoped>
.setting{
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
