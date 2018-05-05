<template>
    <el-input-number 
    v-model="input" 
    :size="size" 
    controls-position="right"
    @change="valChange">
    </el-input-number>
</template>
<script>
export default {
  props: {
    conf:{},
    value: Number,
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
