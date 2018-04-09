<template>
      <el-form v-bind="$props">
        <slot></slot>
      </el-form>
</template>
<script>
export default {
  name: "Form",
  props: [
    "inline",
    "labelPosition",
    "labelWidth",
    "labelSuffix",
    "statusIcon",
    "size"
  ],
  data() {
    return {
      form: {}
    };
  },
  created() {},
  methods: {}
};
</script>
<style scoped>

</style>

