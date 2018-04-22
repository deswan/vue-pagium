<template>
      <el-row v-bind="$props">
        <slot></slot>
      </el-row>
</template>
<script>
export default {
  name: "Row",
  props: [
    "gutter",
    "type",
    "justify",
    "align",
    "tag"
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

