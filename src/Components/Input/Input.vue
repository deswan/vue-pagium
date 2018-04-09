<template>
    <el-form-item :label="label">
      <el-input v-bind="$props"></el-input>
    </el-form-item>
</template>
<script>
export default {
  name: "Input",
  props: [
    "label",
    "size",
    "type",
    "placeholder",
    "clearable",
    "disabled",
    "prefixIcon",
    "suffixIcon",
    "rows",
    "autosize",
    "autoComplete",
    "name",
    "readonly",
    "autofocus"
  ],
  data() {
    return {};
  }
};
</script>
<style scoped>

</style>

