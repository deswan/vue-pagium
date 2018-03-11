<template>
    <el-dialog 
    class="pg-dialog-wrapper"
    :title="title" 
    :visible.sync="show" 
    :modal="false" 
    :modal-append-to-body="false"
    :lock-scroll="false"
    width="700px"
    top="100px"
    custom-class="pg-dialog"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false">
    <slot></slot>
    </el-dialog>
</template>
<script>
export default {
  name: 'Dialog',
  props:['title','active'],
  data() {
    return {
      show:true
    };
  },
  created(){
      this.show = this.active;
  },
  methods:{
     activate(){

     }
  },
  watch:{
    active(){
      this.show = this.active;
    }
  }
};
</script>
<style>
.pg-dialog{
  margin-left: 20px;
}
.pg-dialog-wrapper{
  left: 220px;
  right: 500px;
}
</style>

