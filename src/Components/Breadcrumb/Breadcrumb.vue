<template>
  <el-breadcrumb :style="{'margin-top':marginTop+'px','margin-bottom':marginBottom+'px'}">
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
  props:['items','marginTop','marginBottom'],
  data() {
    return {
    };
  },
};
</script>
<style scoped>
</style>

