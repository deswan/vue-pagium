<template>
  <div class="template-list">
    <el-button type="primary" @click="newPage">生成空白页</el-button>
    <el-table
    v-loading="table.loading"
      :data="table.items" style="margin-top:10px;">
      <el-table-column
        prop="date"
        label="创建日期"
        width="180"
        >
      </el-table-column>
      <el-table-column
        prop="name"
        label="模板名称"
        width="180">
      </el-table-column>
      <el-table-column
        prop="remark"
        label="备注">
      </el-table-column>
      <el-table-column
        label="操作">
        <template slot-scope="scope">
          <el-button size="small" @click="employ(scope.row)">生成页面</el-button>
          <el-button size="small" type="warning" @click="del(scope.row)">删除模板</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
export default {
  data() {
    return {
      table: {
        loading:false,
        items: []
      }
    };
  },
  created() {
    this.loadList();
  },
  methods: {
    loadList() {
      this.table.loading = true;
      this.$http.get("templates").then(({ data }) => {
        this.table.items = data.data;
        this.table.loading = false;
      });
    },
    employ(row) {
      this.$store.commit("employTemplate", {template:row,vm:this});
    },
    del({ id,name }) {
      this.$confirm(`确认删除模板 ${name} ？`)
        .then(_ => {
          this.$http.post("delTemplate",{id}).then(({ data }) => {
            if (data.code === 0) {
              this.loadList();
            }
          });
        })
        .catch(_ => {});
    },
    newPage(){
      this.$store.commit("clearData");
      this.$router.push({name:'create'})
    }
  }
};
</script>

<style scoped>
.template-list {
  width: 80%;
  margin: 20px auto;
}
</style>
