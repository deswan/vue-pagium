<template>
    <div>
        <el-form-item :label="label">
            <div v-if="!format">
                <el-table :data="input" size="mini">
                    <el-table-column width="60">
                        <el-button slot-scope="scope" size="mini" type="danger" @click="delRow(scope.$index)"> - </el-button>
                    </el-table-column>
                    <el-table-column label="key" min-width="30">
                        <el-input size="mini" v-model="scope.row.key" slot-scope="scope"></el-input>
                    </el-table-column>
                    <el-table-column label="value" min-width="60">
                        <el-input size="mini" v-model="scope.row.value" slot-scope="scope"></el-input>
                    </el-table-column>
                </el-table>
                <div class="add-row" @click="addRow"><i class="el-icon-plus"></i></div>
            </div>
            <div v-else>
                <el-table :data="input" size="mini">
                    <el-table-column label="key" min-width="30">
                        <span slot-scope="scope">{{scope.row.key}}</span>
                    </el-table-column>
                    <el-table-column label="value" min-width="60">
                        <template slot-scope="scope">
                            <component size="mini" :is="scope.row.c.component" v-bind="scope.row.c.props"></component>
                        </template>
                    </el-table-column>
                </el-table>
            </div>
        </el-form-item>
    </div>
</template>
<script>
export default {
  name: "Object",
  props: {
    default: {
      type: Object
    },
    format: {
      type: Array
    },
    label: {}
  },
  data() {
    return {
      input:[{key:'',value:''}]
    };
  },
  created(){
      if(this.format && this.format.length){
       this.input = this.format.map(item=>{
           return {
               key:item.label,
               value:item.default || '',
               c:item
           }
       })   
      }
  },
  methods:{
      addRow(){
          this.input.push({key:'',value:''});
      },
      delRow(index){
          this.input.splice(index,1)
      }
  }
};
</script>
<style scoped>
.add-row{
    height: 30px;
    line-height: 30px;
    transition: all .5s ease;
    cursor: pointer;
}
.add-row:hover{
    background-color: whitesmoke;
}
</style>

