<template>
      <el-col v-bind="{span,offset,push,pull}">
        <slot></slot>
      </el-col>
</template>
<script>
export default {
  name: "Col",
  props: [
    "span",
    "offset",
    "push",
    "pull",
    "xs",
    "sm",
    "md",
    "lg",
    "xl",
    "tag",
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

