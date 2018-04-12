<template>
    <el-select 
    v-model="input" 
    :size="size" 
    clearable
    filterable
    @change="valChange">
     <el-option
      v-for="item in $store.getters.componentNameList"
      :key="item"
      :label="item"
      :value="item">
    </el-option>
    </el-select>
</template>

<script>
export default {
  name: "PG-REFER-COMPONENT",
  props: {
    value: Object,
    options: Array,
    conf: Object,
    size: {
      default: "small"
    }
  },
  data() {
    return {
      input: ""
    };
  },
  created() {
    this.input = this.val2inp(this.value);
  },
  methods: {
    val2inp(val) {
      return val.value;
    },
    inp2val(inp) {
      return {
        type: "__pg_type_refer_component__",
        value: inp
      };
    },
    valChange(input) {
      this.$emit("input", this.inp2val(this.input));
    }
  },
  watch:{
    value(){
      this.input = this.val2inp(this.value);
    }
  }
};
</script>

<style scoped>

</style>

