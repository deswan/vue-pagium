<template>
    <div>
        <div>
            <el-table :data="tablet556.items" v-loading="tablet556.loading" border>
                <el-table-column>
                    <template slot-scope="scope"> </template>
                </el-table-column>
                <el-table-column>
                    <template slot-scope="scope"> </template>
                </el-table-column>
            </el-table>
        </div>
        <div>
            <el-table :data="table1.items" v-loading="table1.loading" border>
                <el-table-column>
                    <template slot-scope="scope"> </template>
                </el-table-column>
                <el-table-column>
                    <template slot-scope="scope"> </template>
                </el-table-column>
            </el-table>
        </div>
        <el-button @click="onClick"> </el-button>
        <el-dialog @close="close" :visible.sync="dialog54754Show"> </el-dialog>
    </div>
</template>
<script>
export default {
    name: 'PG-Page',
    data() {
        return {
            tablet556: {
                loading: false,
                items: [],
                total: 0
            },
            table1: {
                loading: false,
                items: [],
                total: 0
            },
            dialog54754Show: false
        };
    },
    created() {
        this.load();
        this.table1Load();
    },
    methods: {
        load() {
            this.tablet556.loading = true;
            this.$http({
                method: "get",
                url: "",
            }).then((response) => {
                let data = response.data;
                this.tablet556.total = data.total;
                this.tablet556.items = data.items;
                this.tablet556.loading = false;
            }).catch((err) => {
                this.tablet556.loading = false;
            })
        },
        clear() {
            this.tablet556.loading = false;
            this.tablet556.items = []
            this.tablet556.total = []
        },
        table1Load() {
            this.table1.loading = true;
            this.$http({
                method: "get",
                url: ""
            }).then(response => {
                let data = response.data;
                this.table1.total = data.total;
                this.table1.items = data.items;
                this.table1.loading = false;
            }).catch(err => {
                this.table1.loading = false;
            });
        },
        table1Clear() {
            this.table1.loading = false;
            this.table1.items = [];
            this.table1.total = [];
        },
        onClick(e) {
            this.open()
        },
        open() {
            this.dialog54754Show = true;
        },
        close() {},
    }
};

</script>
<style scoped>
</style>

