<template>
      <el-upload 
      v-bind="{action,multiple,name:requestName,withCredentials,accept,disabled}"
      :on-success="onSuccess"
      :on-error="onError"
      :before-upload="beforeUpload"
      >
        <slot></slot>
      </el-upload>
</template>
<script>
export default {
  name: "Upload",
  props: ["action", "multiple", "requestName", "withCredentials", "accept"],
  data() {
    return {};
  },
  methods: {
    onSuccess(response, file, fileList) {
      this.$message.success("文件上传成功");
    },
    onError(err, file, fileList) {
      this.$message.error("文件上传失败：" + err.message);
    },
    beforeUpload(file){
      console.log(file)
    }
  }
};
</script>
<style scoped>

</style>

