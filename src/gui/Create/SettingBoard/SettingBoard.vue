<template>
  <div class="setting">
      <el-form label-suffix=":" v-if="$store.state.activeComponent" :key="$store.state.activeComponent.pg" label-position="left"  label-width="80px">
        <el-form-item label="组件名称">
            <component :is="StringInput" name="name" @input="handleInput('name',$event)" :value="$store.state.activeComponent.props['name']"></component>
        </el-form-item>
        <template v-for="(item,idx) in $store.getters.activeComponentSetting" >
          <el-form-item 
          :label="item.label" 
          :key="idx">
              <!-- 输入组件
                arrItem: 数组默认值            
               -->
              <component 
              :is="item.input" 
              @input="handleInput(item.name,$event)" 
              :arrItem="$store.state.activeComponent.props['_'+item.name]"
              :value="$store.state.activeComponent.props[item.name]" 
              v-bind="item.props" 
              :conf="item.conf">
              </component>
          </el-form-item>
          <!-- Boolean.on -->
          <div class="expand" :key="idx + 'expand'" v-if="item.props.subInput && item.props.subInput.length && $store.state.activeComponent.props[item.name]">
              <el-form-item v-for="(subInput,idx) in item.props.subInput" :label="subInput.label" :key="idx">
                <component 
                :is="subInput.input" 
                @input="handleInput(subInput.name,$event)" 
                :arrItem="$store.state.activeComponent.props['_'+subInput.name]" 
                :value="$store.state.activeComponent.props[subInput.name]" 
                v-bind="subInput.props" 
                :conf="subInput.conf">
                </component>
              </el-form-item>            
          </div>
        </template>
      </el-form>
  </div>
</template>

<script>
import StringInput from "../../../type_parser/string/string.vue";
export default {
  data() {
    return {
      StringInput
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
