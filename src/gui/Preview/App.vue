<template>
<div>
    <el-button @click="onClick" style=""> </el-button>
    <el-dialog @close="close" :visible.sync="dialog.show">
        <el-button @click="button1OnClick" style=""> </el-button>
    </el-dialog>
</div>
</template>
<script>
export default {
    name: 'PG-Page',
    data() {
        return {
            dialog: {
                show: false
            }
        };
    },
    created() {},
    methods: {
        onClick(e) {
            this.open()
        },
        open() {
            this.dialog.show = true;
        },
        close() {},
        button1OnClick(e) {}
    }
};

</script>
