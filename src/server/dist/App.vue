<template>
    <div>
        <div>
            <el-table :data="Table.items" border v-loading="Table.loading">
                <el-table-column> </el-table-column>
                <el-table-column> </el-table-column>
            </el-table>
            <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="Table.page" :page-size="Table.pageSize" :total="Table.total"> </el-pagination>
        </div>
        <el-dialog :title="" :visible.sync="Dialog.show">
            <div>
                <el-table :data="Table1.items" border v-loading="Table1.loading">
                    <el-table-column> </el-table-column>
                    <el-table-column> </el-table-column>
                </el-table>
                <el-pagination @size-change="Table1HandleSizeChange" @current-change="Table1HandleCurrentChange" :current-page="Table1.page" :page-size="Table1.pageSize" :total="Table1.total"> </el-pagination>
            </div>
            <el-form label-width="80px">{{Form.FormShow}} </el-form>
        </el-dialog>
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
            show: true,
            Table1: {
                loading: false,
                items: [{},
                    {},
                    {}],
                total: 0,
                page: 1,
                pageSize: 50
            },
            FormShow: true,
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
        open() {
            this.Dialog.show = true;
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

