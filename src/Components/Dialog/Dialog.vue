<template>
    <el-dialog 
    class="pg-dialog-wrapper"
    custom-class="pg-dialog"
    :title="title" 
    :visible="pgActive" 
    :modal="false" 
    :lock-scroll="false"
    >
    <slot></slot>
    </el-dialog>
</template>
<script>
export default {
  name: 'Dialog',
  props:['title','pg-active'],
  data() {
    return {
    };
  }
};
</script>
<style>
</style>

