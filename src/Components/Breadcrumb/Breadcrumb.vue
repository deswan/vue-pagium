<template>
  <el-breadcrumb separator="/" :separator-class="separatorClass">
    <el-breadcrumb-item 
    v-for="(item,idx) in items"
    :key="idx"
     :to="item.to">
     {{item.title}}
     </el-breadcrumb-item>
  </el-breadcrumb>
</template>
<script>
export default {
  name: 'Breadcrumb',
  props:['items','separator','separatorClass'],
  data() {
    return {
    };
  },
};
</script>
<style scoped>
</style>

