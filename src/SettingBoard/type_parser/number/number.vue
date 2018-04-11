<template>
    <el-input-number 
    v-model="input" 
    :size="size" 
    @change="valChange">
    </el-input-number>
</template>
<script>
export default {
  props: {
    conf:{},
    value: String,
    size: {
      default: "small"
    }
  },
  data() {
    return {
      input: this.value
    };
  },
  created(){
  },
  methods: {
    valChange(input) {
      this.$emit('input',input);
    }
  }
};
</script>
