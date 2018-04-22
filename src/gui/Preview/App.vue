<template>
    <div>
        <el-breadcrumb>
            <el-breadcrumb-item> 广告管理 </el-breadcrumb-item>
            <el-breadcrumb-item> 首页国家馆管理 </el-breadcrumb-item>
        </el-breadcrumb>
        <el-button @click="onClick" type="primary"> 新增版面 </el-button>
        <div>
            <el-table :data="table.items" v-loading="table.loading" border>
                <el-table-column prop="taskId" label="版面ID" align="center">
                    <template slot-scope="scope"> </template>
                </el-table-column>
                <el-table-column prop="taskName" label="版面名称" align="center">
                    <template slot-scope="scope"> </template>
                </el-table-column>
                <el-table-column prop="siteType" label="站点" align="center">
                    <template slot-scope="scope"> </template>
                </el-table-column>
                <el-table-column prop="taskFromTime" label="开始时间" align="center">
                    <template slot-scope="scope"> </template>
                </el-table-column>
                <el-table-column prop="taskStatus" label="状态" align="center">
                    <template slot-scope="scope"> </template>
                </el-table-column>
                <el-table-column label="操作" align="center">
                    <template slot-scope="scope">
                        <el-button @click="editOnClick" size="small" type="text"> 编辑 </el-button>
                        <el-button @click="delOnClick" size="small" type="text"> 删除 </el-button>
                    </template>
                </el-table-column>
                <el-table-column label="多语言" align="center">
                    <template slot-scope="scope">
                        <el-button @click="multiOnClick" size="small" type="text"> 图片 </el-button>
                    </template>
                </el-table-column>
            </el-table>
            <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="table.page" :page-size="table.pageSize" :total="table.total"> </el-pagination>
        </div>
        <el-dialog title="多语言-图片" center @close="close" :visible.sync="dialog.show">
            <div>
                <el-table :data="dialog.table1.items" v-loading="dialog.table1.loading" border>
                    <el-table-column label="语种">
                        <template slot-scope="scope"> </template>
                    </el-table-column>
                    <el-table-column label="图片">
                        <template slot-scope="scope"> </template>
                    </el-table-column>
                    <el-table-column label="尺寸">
                        <template slot-scope="scope"> </template>
                    </el-table-column>
                    <el-table-column label="大小限制">
                        <template slot-scope="scope"> </template>
                    </el-table-column>
                    <el-table-column label="操作">
                        <template slot-scope="scope">
                            <el-upload :on-success="onSuccess" :on-error="onError" :before-upload="beforeUpload" :action="dialog.table1.uploadUploadUrl" accept=".jpg,.png,.gif"> </el-upload>
                        </template>
                    </el-table-column>
                </el-table>
                <el-pagination @size-change="table1HandleSizeChange" @current-change="table1HandleCurrentChange" :current-page="dialog.table1.page" :page-size="dialog.table1.pageSize" :total="dialog.table1.total"> </el-pagination>
            </div>
        </el-dialog>
    </div>
</template>
<script>
export default {
    name: 'PG-Page',
    data() {
        return {
            breadcrumb: {
            },
            create: {
            },
            table: {
                loading: false,
                items: [],
                total: 0,
                page: 1,
                pageSize: 50
            },
            dialog: {
                show: false,
                table1: {
                    loading: false,
                    items: [],
                    total: 0,
                    page: 1,
                    pageSize: 50,
                    uploadUploadUrl: "/upload"
                }
            }
        };
    },
    created() {
        this.load();
    },
    methods: {
        onClick(e) {},
        load() {
            this.table.loading = true;
            this.$http({
                method: "get",
                url: "/mock/table",
                params: {
                    page: this.table.page,
                    pageSize: this.table.pageSize,
                }
            }).then((response) => {
                let data = response.data;
                this.table.total = data.total;
                this.table.items = data.items;
                this.table.loading = false;
            }).catch((err) => {
                this.table.loading = false;
            })
        },
        clear() {
            this.table.loading = false;
            this.table.items = []
            this.table.total = []
            this.table.page = 1
            this.table.pageSize = 50
        },
        handleCurrentChange(page) {
            this.table.page = page;
            this.load();
        },
        handleSizeChange(size) {
            this.table.pageSize = size;
            if (this.table.page == 1) {
                this.load();
            } else {
                this.table.page = 1;
            }
        },
        editOnClick(e) {},
        delOnClick(e) {},
        multiOnClick(e) {
            this.open();
        },
        open() {
            this.dialog.show = true;
            this.table1Load()
        },
        close() {
            this.table1Clear()
        },
        table1Load() {
            this.dialog.table1.loading = true;
            this.$http({
                method: "get",
                url: "/mock/table",
                params: {
                    page: this.dialog.table1.page,
                    pageSize: this.dialog.table1.pageSize
                }
            }).then(response => {
                let data = response.data;
                this.dialog.table1.total = data.total;
                this.dialog.table1.items = data.items;
                this.dialog.table1.loading = false;
            }).catch(err => {
                this.dialog.table1.loading = false;
            });
        },
        table1Clear() {
            this.dialog.table1.loading = false;
            this.dialog.table1.items = [];
            this.dialog.table1.total = [];
            this.dialog.table1.page = 1;
            this.dialog.table1.pageSize = 50;
        },
        table1HandleCurrentChange(page) {
            this.dialog.table1.page = page;
            this.table1Load();
        },
        table1HandleSizeChange(size) {
            this.table.pageSize = size;
            if (this.table.page == 1) {
                this.table1Load();
            } else {
                this.table.page = 1;
            }
        },
        onSuccess(response,
            file,
            fileList) {
            this.$message.success("文件上传成功");
        },
        onError(err,
            file,
            fileList) {
            this.$message.error("文件上传失败：" + err.message);
        },
        beforeUpload(file) {
            return file.size <= 2072;
        }
    }
};

</script>
<style scoped>
</style>

