<template>
    <el-dialog 
    class="pg-dialog-wrapper"
    :title="title" 
    :visible.sync="show" 
    :modal="false" 
    :modal-append-to-body="false"
    :lock-scroll="false"
    width="700px"
    custom-class="pg-dialog"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"></el-dialog>
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
  margin-left: 250px;
}
.pg-dialog-wrapper{
  left: 100px;
}
</style>

