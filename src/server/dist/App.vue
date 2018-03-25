<template>
    <div>
        <div>
            <el-table :data="Table.items" border v-loading="Table.loading">
                <el-table-column> </el-table-column>
                <el-table-column> </el-table-column>
            </el-table>
            <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="Table.page" :page-size="Table.pageSize" :total="Table.total"> </el-pagination>
        </div>
        <div>
            <el-table :data="Table1.items" border v-loading="Table1.loading">
                <el-table-column> </el-table-column>
                <el-table-column> </el-table-column>
            </el-table>
            <el-pagination @size-change="Table1HandleSizeChange" @current-change="Table1HandleCurrentChange" :current-page="Table1.page" :page-size="Table1.pageSize" :total="Table1.total"> </el-pagination>
        </div>
    </div>
</template>
<script>
export default {
    name: 'PG Page',
    data() {
        return {
            Table: {
                loading: false,
                items: [{},
                    {},
                    {}],
                total: 0,
                page: 1,
                pageSize: 50
            },
            Table1: {
                loading: false,
                items: [{},
                    {},
                    {}],
                total: 0,
                page: 1,
                pageSize: 50
            },
        };
    },
    methods: {
        handleCurrentChange(page) {
            this.Table.page = page;
        },
        handleSizeChange(size) {
            this.table.pageSize = size;
            if (this.table.page == 1) {
            } else {
                this.table.page = 1;
            }
        },
        Table1HandleCurrentChange(page) {
            this.Table1.page = page;
        },
        Table1HandleSizeChange(size) {
            this.table.pageSize = size;
            if (this.table.page == 1) {
            } else {
                this.table.page = 1;
            }
        },
    }
};

</script>
<style scoped>
</style>

