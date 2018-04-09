<template>
  <el-button v-bind="$props">{{title}}</el-button>
</template>
<script>
export default {
  name: 'Button',
  props:['size','type','plain','round','disabled','icon','title'],
  data() {
    return {
    };
  },
};
</script>
<style scoped>
</style>

