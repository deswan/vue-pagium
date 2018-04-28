<template>
    <div>
        <el-breadcrumb>
            <el-breadcrumb-item> </el-breadcrumb-item>
            <el-breadcrumb-item> </el-breadcrumb-item>
            <el-breadcrumb-item> </el-breadcrumb-item>
        </el-breadcrumb>
        <el-breadcrumb> </el-breadcrumb>
        <div>
            <el-table :data="table.items" v-loading="table.loading" border>
                <el-table-column>
                    <template slot-scope="scope"> </template>
                </el-table-column>
            </el-table>
        </div>
    </div>
</template>
<script>
export default {
    name: 'PG-Page',
    data() {
        return {
            breadcrum: {},
            breadcrum1: {},
            table: {
                loading: false,
                items: [],
                total: 0
            }
        };
    },
    created() {},
    methods: {
        load() {
            this.table.loading = true;
            this.$http({
                method: "get",
                url: "",
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
        }
    }
};

</script>
<style scoped>
</style>

