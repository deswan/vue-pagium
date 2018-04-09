<template>
    <div>
        <div>
            <el-table :data="Table.items" border v-loading="Table.loading">
                <el-table-column>
                    <template slot-scope="scope">
                        <el-button @click="onClick"> </el-button>
                        <el-button @click="Button1OnClick" size="mini"> </el-button>
                    </template>
                </el-table-column>
                <el-table-column> </el-table-column>
            </el-table>
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
                total: 0
            },
        };
    },
    methods: {
        onClick(e) {},
        Button1OnClick(e) {},
    }
};

</script>
<style scoped>
</style>

