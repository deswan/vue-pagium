<template>
      <el-row v-bind="$props" :style="{'margin-top':marginTop+'px','margin-bottom':marginBottom+'px'}">
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

