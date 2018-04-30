<template>
    <div>
        <el-table v-bind="{
          fit,
        height:height || undefined,
        maxHeight:height || undefined
        ,stripe,size:height || undefined}" :data="data" border :style="{'margin-top':marginTop+'px','margin-bottom':marginBottom+'px'}">
            <el-table-column v-for="(col,idx) in cols" :key="idx" v-bind="col" :resizable="false"></el-table-column>
        </el-table>
        <el-pagination v-if="pagination" style="margin-top:10px"></el-pagination>
    </div>
</template>
<script>
export default {
  name: 'Table',
  props:['cols','fit','height','maxHeight','stripe','size','marginTop','marginBottom','pagination'],
  data() {
    return {
      data:['','','']
    };
  }
};
</script>

