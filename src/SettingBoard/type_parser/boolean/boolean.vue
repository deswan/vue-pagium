<template>
  <div>
    <el-switch v-model="input" @change="valChange"></el-switch>
  </div>
</template>

<script>
  export default {
    name: "Boolean",
    props: {
      value:Boolean,
      name: String,
      pgChild: Boolean
    },
    data() {
      return {
        input: this.value
      };
    },
    created() {
    },
    methods: {
      valChange(input) {
          this.$emit('input',input);
      }
    }
  };
</script>

<style scoped>
</style>
