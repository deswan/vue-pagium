<template>
  <div class="setting">
      <el-form 
      label-suffix=":" 
      v-if="$store.state.activeComponent" 
      :key="$store.state.activeComponent.pg" 
      label-position="left"  
      label-width="120px">
        <el-form-item label="组件类型">
          <span class="com-type">{{$store.state.activeComponent.type}}</span>
          <span class="com-type-description">{{$store.state.activeComponent.description}}</span>
        </el-form-item>
        <el-form-item label="组件名称">
            <component :is="StringInput" @input="handleInput('_name',$event)" :value="$store.state.activeComponent.name"></component>
        </el-form-item>
        <template v-for="(item,idx) in $store.getters.activeComponentSetting" >
          <el-form-item 
          :label="item.label" 
          :key="idx">
              <!-- arrItem: 数组默认值 -->
              <component 
              :is="item.input" 
              @input="handleInput(item.name,$event)" 
              :arrItem="$store.state.activeComponent.props['__'+item.name]"
              :value="$store.state.activeComponent.props[item.name]" 
              v-bind="item.props" 
              :conf="item.conf">
              </component>
          </el-form-item>
        </template>
      </el-form>
  </div>
</template>

<script>
import StringInput from "@/type_parser/string/string.vue";
export default {
  data() {
    return {
      StringInput
    };
  },
  methods: {
    handleInput(name, value) {
      this.$store.commit("input", { me: this, name, value });
    }
  }
};
</script>

<style scoped>
.setting {
  padding: 20px 30px;
  width: 600px;
  box-sizing: border-box;
  background: white;
  position: fixed;
  right: 0;
  top: 60px;
  bottom: 0;
  overflow: auto;
  z-index: 999;
}
.setting::-webkit-scrollbar {
  display: none;
}
.com-type {
  font-size: 20px;
}
.com-type-description{
  margin-left:15px;
  color:#666;
}
.setting >>> .el-form-item__label {
  line-height: 1.6;
  padding-top: 10px;
  word-wrap: break-word;
}
</style>
