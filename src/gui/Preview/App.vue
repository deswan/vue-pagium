<template>
    <div>
        <el-breadcrumb>
            <el-breadcrumb-item> 广告管理 </el-breadcrumb-item>
            <el-breadcrumb-item> WAP首页国家馆管理 </el-breadcrumb-item>
        </el-breadcrumb>
        <el-button @click="onClick" type="primary" icon="el-icon-plus"> 新增版面 </el-button>
        <div>
            <el-table :data="table.items" border v-loading="table.loading">
                <el-table-column prop="taskId" label="版面ID">
                    <template slot-scope="scope"> </template>
                </el-table-column>
                <el-table-column prop="taskName" label="版面名称">
                    <template slot-scope="scope"> </template>
                </el-table-column>
                <el-table-column prop="siteType" label="站点">
                    <template slot-scope="scope"> </template>
                </el-table-column>
                <el-table-column prop="taskFromTime" label="开始时间">
                    <template slot-scope="scope"> </template>
                </el-table-column>
                <el-table-column prop="taskStatus" label="状态">
                    <template slot-scope="scope"> </template>
                </el-table-column>
                <el-table-column label="操作">
                    <template slot-scope="scope">
                        <el-button @click="editOnClick" size="small"> 编辑 </el-button>
                        <el-button @click="delOnClick" size="small" type="warning"> 删除 </el-button>
                    </template>
                </el-table-column>
                <el-table-column label="多语言">
                    <template slot-scope="scope">
                        <el-button @click="multiOnClick" size="small" type="text"> 图片 </el-button>
                    </template>
                </el-table-column>
            </el-table>
            <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="table.page" :page-size="table.pageSize" :total="table.total"> </el-pagination>
        </div>
        <el-dialog title="多语言-图片" :visible.sync="dialog.show">
            <div>
                <el-table :data="dialog.table.items" border v-loading="dialog.table.loading">
                    <el-table-column min-width="120" label="语种">
                        <template slot-scope="scope"> </template>
                    </el-table-column>
                    <el-table-column label="图片">
                        <template slot-scope="scope"> </template>
                    </el-table-column>
                    <el-table-column label="尺寸">
                        <template slot-scope="scope"> </template>
                    </el-table-column>
                    <el-table-column label="操作">
                        <template slot-scope="scope"> </template>
                    </el-table-column>
                </el-table>
            </div>
        </el-dialog>
    </div>
</template>
<script>
export default {
    name: 'PG-Page',
    data() {
        return {
            table: {
                loading: false,
                items: [{},
                    {},
                    {}],
                total: 0,
                page: 1,
                pageSize: 50
            },
            dialog: {
                show: false,
                table: {
                    loading: false,
                    items: [{},
                        {},
                        {}],
                    total: 0
                }
            },
        };
    },
    created() {
        this.loadList();
    },
    methods: {
        onClick(e) {},
        loadList() {
            this.table.loading = true;
            this.$http({
                method: "get",
                url: "/api/table-data",
                params: {
                    page: this.table.page,
                    pageSize: this.table.pageSize,
                }
            }).then((response) => {
                this.$message.success(response.msg || 'success')
                return response;
            }).catch((err) => {
                this.$message.error(response.msg || 'error')
                return err;
            }).then((response) => {
                let data = response.data;
                this.table.total = data.total;
                this.table.items = data.items;
                this.table.loading = false;
            }).catch((err) => {
                this.table.loading = false;
            })
        },
        handleCurrentChange(page) {
            this.table.page = page;
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
        editOnClick(e) {},
        delOnClick(e) {},
        multiOnClick(e) {},
        open() {
            this.dialog.show = true;
        },
    }
};

</script>
<style scoped>
</style>

