<template>
    <el-form-item :label="label" v-if="label">
        <el-input v-model="input" :size="size"></el-input>
    </el-form-item>
    <el-input v-else v-model="input" :size="size"></el-input>
</template>
<script>
export default {
    props:{
        default:{
            type:String
        },
        size:{
            default:'small'
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
