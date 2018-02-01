<template>
    <div>
        <el-table :data="data">
            <el-table-column v-for="(col,idx) in cols" :key="idx" v-bind="col"></el-table-column>
        </el-table>
    </div>
</template>
<script>
export default {
  name: 'Table',
  props:['cols','active'],
  data() {
    return {
      data:[]
    };
  },
  created(){
    if(this.cols && this.cols.length){
      let data = {};
      let props = this.cols.forEach(col=>{
        data[col.prop] = 'mock';
      })
      this.data = new Array(4).fill(data);
    }
  },
  methods:{
     
  }
};
</script>
<style scoped>
</style>

