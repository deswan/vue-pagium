<template>
  <el-button v-bind="$props" :style="{'margin-top':marginTop+'px'}">{{title}}</el-button>
</template>
<script>
export default {
  name: 'Button',
  props:['size','type','plain','round','icon','title','marginTop'],
  data() {
    return {
    };
  },
};
</script>
<style scoped>
</style>

