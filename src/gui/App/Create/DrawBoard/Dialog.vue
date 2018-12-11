<template>
    <div class="pg-dialog">
      <div class="pg-dialog-content">
        <slot></slot>
      </div>
    </div>
</template>
<script>
export default {
  data() {
    return {
    };
  }
};
</script>
<style scoped>
.pg-dialog{
  font-size: 12px;
  border:solid lightgray 3px;
}
.pg-dialog-content{
  margin:5px;
}
.pg-dialog:before{
  content:'对话框';
  display: block;
  line-height: 15px;
  background-color: lightgray
}
</style>

