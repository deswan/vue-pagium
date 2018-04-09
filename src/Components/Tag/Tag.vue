<template>
      <el-tag v-bind="$props">
        {{title}}
      </el-tag>
</template>
<script>
export default {
  name: "Tag",
  props: [
    "title",
    "type",
    "color",
    "hit",
    "size"
  ],
  data() {
    return {
    };
  }
};
</script>
<style scoped>

</style>

