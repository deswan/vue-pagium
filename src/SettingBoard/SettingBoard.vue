<template>
  <div class="setting">
      <el-form label-suffix="：" v-if="$store.state.activeComponent">
        <el-form-item :label="item.label" v-for="item in scheme2Input(schemes[$store.state.activeComponent.type].props)" :key="item.name">
            <component :is="item.input" v-bind="item.props" :name="item.name"></component>
            <div class="expand" v-if="item.subInput && item.subInput.length && $store.state.activeComponent.props[item.name]">
                <el-form-item v-for="subInput in item.subInput" :label="subInput.label" :key="subInput.name">
                  <component :is="subInput.input" v-bind="subInput.props" :name="subInput.name"></component>
                </el-form-item>            
            </div>
        </el-form-item>
      </el-form>
  </div>
</template>

<script>
import TableConfig from '../Components/Table/config'
import DialogConfig from '../Components/Dialog/config'
import scheme2Input from './scheme2Input'
const schemes = {
  Table:TableConfig,
  Dialog:DialogConfig
}
export default {
  data(){
    return {
      schemes,scheme2Input,
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
