<template>
    <div>
        <el-table 
        :data="items" 
        border
        v-loading="loading"
        >
            
            <el-table-column 
             fixed="left"   
             prop="name"   
             min-width="80px"   
             label="姓名"   
            >
              
            </el-table-column>
            
            <el-table-column 
              
             prop="age"   
             min-width="180px"   
             label="年龄"   
            >
              
            </el-table-column>
            
        </el-table>
        
        
          <el-pagination 
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
             :page-sizes="[50,100]"   
            :current-page="page"
            :page-size="pageSize"
              
            :total="total">
          </el-pagination>
        
    </div>
</template>
<script>
export default {
  name: 'Table',
  data() {
    return {
      loading:false,
      items:['','',''],
      total: 0,
      
        page: 1,
        pageSize: 50
      
    };
  },
  created(){
    this.loadList();
  },
  methods:{
    
     loadList(){
        this.loading = true;
        

this.$http({
  method: "get",
  url: "/api/table-data",
  data: {
    
    page:this.page,
    
    pageSize:this.pageSize,
    
  }
}).then((response)=>{
    this.$message.success(response.msg || 'success')
    return response;
}).catch((err)=>{
    this.$message.error(response.msg || 'error')
    return err;
}) 
        .then((response)=>{
          let data = response.data;
          this.total = data.total;
          this.items = data.items;
          this.loading = false;
        }).catch((err)=>{
          this.loading = false;
        })
     },
    

    
      handleCurrentChange(page) {
        this.page = page;
        
          this.loadList();
        
      },

      handleSizeChange(size) {
        this.table.pageSize = size;
        if (this.table.page == 1) {
          
            this.loadList();
          
        } else {
          this.table.page = 1;
        }
      },
    
  }
};
</script>
<style scoped>
</style>

