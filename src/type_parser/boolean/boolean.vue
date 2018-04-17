<template>
  <div>
    <el-switch v-model="input" @change="valChange"></el-switch>
  </div>
</template>

<script>
export default {
  name: "Boolean",
  props: {
    conf: {},
    value: Boolean,
    name: String
  },
  data() {
    return {
      input: this.value
    };
  },
  created() {},
  methods: {
    valChange(input) {
      this.$emit("input", input);
      this.input = this.value;
    }
  },
  watch: {
    value() {
      this.input = this.value;
    }
  }
};
</script>

<style scoped>

</style>
