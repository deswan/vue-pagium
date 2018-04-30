<template>
    <div>
        <el-breadcrumb style=" 
   ">
            <el-breadcrumb-item> 广告管理 </el-breadcrumb-item>
            <el-breadcrumb-item> 首页国家馆管理 </el-breadcrumb-item>
        </el-breadcrumb>
        <el-button @click="onClick" type="primary" icon="el-icon-plus" style=" margin-top:20px "> 新增版面 </el-button>
        <div>
            <el-table :data="table.items" v-loading="table.loading" border style=" margin-top:10px;   
            ">
                <el-table-column prop="taskId" label="版面ID" align="center"> </el-table-column>
                <el-table-column prop="taskName" label="版面名称" align="center"> </el-table-column>
                <el-table-column prop="siteType" label="站点" align="center"> </el-table-column>
                <el-table-column prop="taskFromTime" label="开始时间" align="center"> </el-table-column>
                <el-table-column prop="taskStatus" label="状态" align="center"> </el-table-column>
                <el-table-column label="操作" align="center">
                    <template slot-scope="scope">
                        <el-button @click="editOnClick(scope.row)" size="small" type="text" style=""> 编辑 </el-button>
                        <el-button @click="delOnClick(scope.row)" size="small" type="text" style=""> 删除 </el-button>
                    </template>
                </el-table-column>
                <el-table-column label="多语言" align="center">
                    <template slot-scope="scope">
                        <el-button @click="multiOnClick(scope.row)" size="small" type="text" style=""> 图片 </el-button>
                    </template>
                </el-table-column>
            </el-table>
            <el-pagination style="margin-top:10px" @size-change="handleSizeChange" @current-change="handleCurrentChange" :page-sizes="[50, 100]" :current-page="table.page" :page-size="table.pageSize" layout="sizes, prev, pager, next" :total="table.total">
            </el-pagination>
        </div>
        <el-dialog title="多语言-图片" @close="close" :visible.sync="multiDialog.show">
            <div>
                <el-table :data="multiDialog.multiTable.items" v-loading="multiDialog.multiTable.loading" border style="  
            ">
                    <el-table-column label="语种"> </el-table-column>
                    <el-table-column label="图片"> </el-table-column>
                    <el-table-column label="尺寸"> </el-table-column>
                    <el-table-column label="大小限制"> </el-table-column>
                    <el-table-column label="操作">
                        <template slot-scope="scope">
                            <el-upload :on-success="onSuccess" :on-error="onError" :action="multiDialog.multiTable.uploadUploadUrl" accept=".png,.jpg,.gif">
                                <el-button @click="uploadBtnOnClick" size="small" type="text" style=""> 上传 </el-button>
                            </el-upload>
                        </template>
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
            breadcrumb: {},
            button: {},
            table: {
                loading: false,
                items: [],
                total: 0,
                page: 1,
                pageSize: 50
            },
            multiDialog: {
                show: false,
                multiTable: {
                    loading: false,
                    items: [],
                    total: 0,
                    uploadUploadUrl: "/upload-photo"
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
            this.multiDialog.show = true;
            this.multiTableLoad()
        },
        close() {
            this.multiTableClear()
        },
        multiTableLoad() {
            this.multiDialog.multiTable.loading = true;
            this.$http({
                method: "get",
                url: "/mock/table"
            }).then(response => {
                let data = response.data;
                this.multiDialog.multiTable.total = data.total;
                this.multiDialog.multiTable.items = data.items;
                this.multiDialog.multiTable.loading = false;
            }).catch(err => {
                this.multiDialog.multiTable.loading = false;
            });
        },
        multiTableClear() {
            this.multiDialog.multiTable.loading = false;
            this.multiDialog.multiTable.items = [];
            this.multiDialog.multiTable.total = [];
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
        uploadBtnOnClick(e) {}
    }
};

</script>
<style scoped>
</style>

