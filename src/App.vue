<template>
    <div>
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
        };
    },
    methods: {

    }
};

</script>
<style scoped>
</style>

