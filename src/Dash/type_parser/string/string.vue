<template>
    <el-form-item :label="label">
        <el-input v-model="input" size="small"></el-input>
    </el-form-item>
</template>
<script>
export default {
    props:{
        default:{
            type:String
        },
        label:{}
    },
    data(){
        return {
            input: this.default || ''
        }
    }
}
</script>
