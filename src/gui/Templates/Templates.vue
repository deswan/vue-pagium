<template>
  <div class="template-list">
    <el-button type="primary">新建页面</el-button>
    <el-table
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
          <el-button size="small">生成页面</el-button>
          <el-button size="small" type="warning">删除模板</el-button>
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
        items: [{
          name:'常规列表页',
          date:'2018-10-16 23:00:00',
          remark:'sdaasd'
        }]
      }
    };
  },
  methods: {
    save() {
      axios.post("/save", this.$store.getters.data);
    }
  }
};
</script>

<style scoped>
.template-list{
  width: 80%;
  margin:20px auto;
}
</style>
