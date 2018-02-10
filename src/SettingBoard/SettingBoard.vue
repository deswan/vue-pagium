<template>
<<<<<<< HEAD:src/SettingBoard/SettingBoard.vue
  <div class="setting">
      <el-form :model="form" label-suffix="：" v-if="$store.state.activedComponent">
        <el-form-item :label="label" v-for="item in scheme2Input(config[$store.state.activedComponent.type])" :key="item.name">
            <component :is="item.input" v-bind="item.props"></component>
        </el-form-item>
=======
  <div class="detail">
      组件详情
      <el-form :model="form" label-suffix="：" v-if="$store.state.activeCOM">
            <component v-for="item in config2Components(config[$store.state.activeCOM.name])" :value="config2Default(item.config)" :key="item.name" :label="item.label" :name="item.name" :is="item.component" v-bind="item.props"></component>
>>>>>>> d04c78f2fff0f593a01ad31590aa24a8ad894278:src/Dash/Index.vue
      </el-form>
  </div>
</template>

<script>
import TableConfig from '../Components/Table/config'
import DialogConfig from '../Components/Dialog/config'
<<<<<<< HEAD:src/SettingBoard/SettingBoard.vue
import scheme2Input from './scheme2Input'
=======
import config2Components from './config2Components'
import config2Default from './config2Default'
>>>>>>> d04c78f2fff0f593a01ad31590aa24a8ad894278:src/Dash/Index.vue
const config = {
  Table:TableConfig,
  Dialog:DialogConfig
}
export default {
  data(){
    return {
<<<<<<< HEAD:src/SettingBoard/SettingBoard.vue
      config,scheme2Input,
=======
      config,config2Components,config2Default,
>>>>>>> d04c78f2fff0f593a01ad31590aa24a8ad894278:src/Dash/Index.vue
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
