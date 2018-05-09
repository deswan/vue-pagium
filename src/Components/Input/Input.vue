<template>
    <el-form-item :label="label">
      <el-input v-bind="$props" :style="{width:width || 'auto'}" v-model="value"></el-input>
    </el-form-item>
</template>
<script>
export default {
  name: "Input",
  props: [
    "label",
    "size",
    "placeholder",
    "clearable",
    "prefixIcon",
    "suffixIcon",
    "readonly",
    "width"
  ],
  data() {
    return {
      value:''
    };
  }
};
</script>
<style scoped>

</style>

