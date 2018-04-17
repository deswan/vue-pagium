<template>
    <el-select 
    v-model="input" 
    :size="size" 
    :placeholder="conf.default || ''"
    clearable
    @change="valChange">
      <el-option v-for="option in options" :key="option.key" :value="option.key" :label="option.value"></el-option>
    </el-select>
</template>

<script>
export default {
  name: "PG-Select",
  props: {
    value: {},
    options: Array,
    conf:Object,
    size:{
      default:'small'
    }
  },
  data() {
    return {
      input: this.value
    };
  },
  methods: {
    valChange(input) {
      this.$emit('input',this.input)
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

