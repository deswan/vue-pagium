<template>
    <el-dialog :title="title" :visible.sync="show" :modal="false" :lock-scroll="false"></el-dialog>
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
<style scoped>
</style>

