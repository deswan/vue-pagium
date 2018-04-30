<template>
    <el-select 
    v-model="input" 
    :size="size" 
    clearable
    filterable
    no-data-text="无可用组件"
    placeholder="refer"
    @change="valChange">
     <el-option
      v-for="item in $store.getters.componentNameList(conf.property)"
      :key="item"
      :label="item"
      :value="item">
    </el-option>
    </el-select>
</template>

<script>
const {REFER_TYPE} = require('../../const')
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
        type: REFER_TYPE,
        value: inp,
        property: this.conf.property
      };
    },
    valChange(input) {
      this.$emit("input", this.inp2val(this.input));
      this.input = this.val2inp(this.value);
    }
  },
  watch: {
    value() {
      this.input = this.val2inp(this.value);
    }
  }
};
</script>

<style scoped>

</style>

