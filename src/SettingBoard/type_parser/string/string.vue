<template>
    <el-select 
    v-model="input" 
    :size="size" 
    @change="valChange" 
    v-if="options && options.length" 
    placeholder="" 
    clearable>
      <el-option v-for="option in options" :key="option.key" :value="option.key" :label="option.value"></el-option>
    </el-select>
    
    <el-input 
    v-model="input" 
    :size="size" 
    @change="valChange" 
    v-else></el-input>
    
</template>
<script>
export default {
  props: {
    value: String,
    size: {
      default: "small"
    },
    options:Array,
    name: String,
    pgChild: Boolean
  },
  data() {
    return {
      input: this.value
    };
  },
  created(){
  },
  methods: {
    valChange(input) {
      this.$emit('input',input);
    }
  }
};
</script>
