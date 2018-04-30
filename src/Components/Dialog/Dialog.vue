<template>
    <el-dialog 
    class="pg-dialog-wrapper"
    custom-class="pg-dialog"
    :title="title" 
    :visible.sync="pgActive" 
    :modal="false" 
    :modal-append-to-body="false"
    :lock-scroll="false"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
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

