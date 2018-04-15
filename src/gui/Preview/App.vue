<template>
    <div>
        <el-breadcrumb>
            <el-breadcrumb-item> 123 </el-breadcrumb-item>
            <el-breadcrumb-item> </el-breadcrumb-item>
        </el-breadcrumb>
        <div>
            <el-table :data="table.items" border v-loading="table.loading">
                <el-table-column>
                    <template slot-scope="scope"> </template>
                </el-table-column>
                <el-table-column>
                    <template slot-scope="scope"> </template>
                </el-table-column>
            </el-table>
        </div>
        <div>
            <el-table :data="table1.items" border v-loading="table1.loading">
                <el-table-column>
                    <template slot-scope="scope"> </template>
                </el-table-column>
                <el-table-column>
                    <template slot-scope="scope"> </template>
                </el-table-column>
            </el-table>
        </div>
        <div>
            <el-table :data="table2.items" border v-loading="table2.loading">
                <el-table-column>
                    <template slot-scope="scope"> </template>
                </el-table-column>
                <el-table-column>
                    <template slot-scope="scope"> </template>
                </el-table-column>
            </el-table>
        </div>
        <div>
            <el-table :data="table3.items" border v-loading="table3.loading">
                <el-table-column>
                    <template slot-scope="scope"> </template>
                </el-table-column>
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
            table: {
                loading: false,
                items: [{},
                    {},
                    {}],
                total: 0
            },
            table1: {
                loading: false,
                items: [{},
                    {},
                    {}],
                total: 0
            },
            table2: {
                loading: false,
                items: [{},
                    {},
                    {}],
                total: 0
            },
            table3: {
                loading: false,
                items: [{},
                    {},
                    {}],
                total: 0
            },
        };
    },
    methods: {

    }
};

</script>
<style scoped>
</style>

