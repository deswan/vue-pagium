<template>
  <div class="template-list">
    <h3>模板列表</h3>
    <el-table
    v-loading="table.loading"
      :data="table.items" style="margin-top:10px;">
      <el-table-column
        prop="date"
        label="修改时间"
        width="200"
        >
      </el-table-column>
      <el-table-column
        prop="name"
        label="模板名称"
        width="220">
      </el-table-column>
      <el-table-column
        prop="page"
        label="根组件"
        width="100">
        <span slot-scope="scope">{{scope.row.data.page || '无'}}</span>
      </el-table-column>
      <el-table-column
        prop="remark"
        label="备注">
      </el-table-column>
      <el-table-column
        label="操作"
        width="300">
        <template slot-scope="scope">
          <el-button size="small" @click="employ(scope.row)">应用</el-button>
          <el-button size="small" type="warning" @click="del(scope.row)">删除</el-button>
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
        loading: false,
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
      this.$store.commit("employTemplate", { template: row, vm: this.$parent });
    },
    del({ id, name }) {
      this.$confirm(`确认删除模板 ${name} ？`, "提示", {
        type: "warning"
      })
        .then(_ => {
          this.$http.post("delTemplate", { id }).then(({ data }) => {
            if (data.code === 0) {
              this.loadList();
            }
          });
        })
        .catch(_ => {});
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
