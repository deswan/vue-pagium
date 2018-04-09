<template>
    <el-input 
    v-model="input" 
    :size="size" 
    placeholder=""
    @change="valChange">
      <!-- <el-option v-for="(com,idx) in $store.getters.allComs" :key="idx" :value="com.name" :label="com.name"></el-option> -->
    </el-input>
</template>

<script>
export default {
  name: "PG-NEW-COMPONENT",
  props: {
    value: String,
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
      this.$emit('input',this.input);
    }
  }
};
</script>

<style scoped>
</style>

