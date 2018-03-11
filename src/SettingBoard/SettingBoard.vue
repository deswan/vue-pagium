<template>
  <div class="setting">
      <el-form label-suffix="：" v-if="$store.state.activeComponent">
        <el-form-item label="组件名称" :key="$store.state.activeComponent.pg">
            <component :is="StringInput" name="name"></component>
        </el-form-item>
        <el-form-item :label="item.label" v-for="(item,idx) in scheme2Input(schemes[$store.state.activeComponent.type].props)" :key="'' + $store.state.activeComponent.pg + idx">
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
import StringInput from './type_parser/string/string.vue'
const schemes = {
  Table:TableConfig,
  Dialog:DialogConfig
}
export default {
  data(){
    return {
      schemes,scheme2Input,StringInput,
      form:{

      }
    }
  }
}
</script>

<style scoped>
.setting{
  padding: 20px 30px 100px;
  width: 400px;
  background: white;
  position: fixed;
  right: 0;
  top:60px;
  height: 100%;
  overflow: auto
}
.setting::-webkit-scrollbar{
  display:none;
}
</style>
