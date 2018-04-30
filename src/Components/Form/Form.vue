<template>
      <el-form v-bind="$props" label-suffix=":">
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
    "statusIcon",
    "size"
  ],
  data() {
    return {
    };
  },
  created() {},
  methods: {}
};
</script>
<style scoped>

</style>

