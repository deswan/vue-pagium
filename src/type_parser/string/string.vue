<template>
    <el-input 
    v-model="input" 
    :size="size" 
    @change="valChange"></el-input>
    
</template>
<script>
export default {
  props: {
    conf:{},
    value: String,
    size: {
      default: "small"
    },
    name: String
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
  watch:{
    value(){
      this.input = this.value;
    }
  }
};
</script>
