<template>
    <div>
        <el-table :data="items" border="" v-loading="loading">
            <el-table-column prop="name" min-width="80px" label="姓名">
            </el-table-column>
            <el-table-column prop="age" min-width="180px" label="年龄">
            </el-table-column>
        </el-table>
    </div>
</template>
<script>
export default {
    name: 'Table',
    data() {
        return {
            loading: false,
            items: ['', '', ''],
            total: 0,
        };
    },
    created() {
        this.loadList();
    },
    methods: {
        loadList() {
            this.loading = true;


            this.$http({
                method: "get",
                url: "/api/table-data",
            }).then((response) => {
                this.$message.success(response.msg || 'success')
                return response;
            }).catch((err) => {
                this.$message.error(response.msg || 'error')
                return err;
            })
                .then((response) => {
                    let data = response.data;
                    this.total = data.total;
                    this.items = data.items;
                    this.loading = false;
                }).catch((err) => {
                this.loading = false;
            })
        },
    }
};

</script>
<style scoped>
</style>

