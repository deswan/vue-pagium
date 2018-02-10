<template>
    <div>
        <el-table :data="data" border>
            <el-table-column v-for="(col,idx) in cols" :key="idx" v-bind="col" :resizable="false"></el-table-column>
        </el-table>
    </div>
</template>
<script>
export default {
  name: 'Table',
  props:['cols','active'],
  data() {
    return {
      data:['','','']
    };
  },
  created(){
  },
  methods:{
     
  },
  watch:{
    cols(){
      console.log(this.cols)
    }
  }
};
</script>
<style scoped>
</style>

