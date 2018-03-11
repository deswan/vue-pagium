<template>
  <div class="setting">
      <el-form label-suffix="：" v-if="$store.state.activeComponent" :key="$store.state.activeComponent.pg">
        <el-form-item label="组件名称">
            <component :is="StringInput" name="name" @input="handleInput('name',$event)" :value="$store.state.activeComponent.props['name']"></component>
        </el-form-item>
        <el-form-item 
        v-for="(item,idx) in scheme2Input(Configs[$store.state.activeComponent.type].props)" 
        :label="item.label" 
        :key="idx">

            <!-- 输入组件 -->
            <component :is="item.input" @input="handleInput(item.name,$event)" :value="$store.state.activeComponent.props[item.name]" v-bind="item.props" :name="item.name"></component>

            <!-- Boolean.on -->
            <div class="expand" v-if="item.subInput && item.subInput.length && $store.state.activeComponent.props[item.name]">
                <el-form-item v-for="(subInput,idx) in item.subInput" :label="subInput.label" :key="idx">
                  <component :is="subInput.input" v-bind="subInput.props" :name="subInput.name"></component>
                </el-form-item>            
            </div>
        </el-form-item>
      </el-form>
  </div>
</template>

<script>
import TableConfig from "../Components/Table/config";
import DialogConfig from "../Components/Dialog/config";
import scheme2Input from "./scheme2Input";
import StringInput from "./type_parser/string/string.vue";
const Configs = {
  Table: TableConfig,
  Dialog: DialogConfig
};
export default {
  data() {
    return {
      Configs,
      scheme2Input,
      StringInput,
      form: {}
    };
  },
  methods: {
    handleInput(name, value) {
      this.$store.commit("input", { name, value });
    }
  }
};
</script>

<style scoped>
.setting {
  padding: 20px 30px 100px;
  width: 400px;
  background: white;
  position: fixed;
  right: 0;
  top: 60px;
  height: 100%;
  overflow: auto;
}
.setting::-webkit-scrollbar {
  display: none;
}
</style>
