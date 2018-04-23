<template>
    <el-select
    multiple=""
    v-model="input" 
    :size="size" 
    placeholder="slot"
    @change="valChange">
      <el-option
        v-for="item in $store.getters.slotComNameList"
        :key="item"
        :label="item"
        :value="item">
      </el-option>
    </el-select>
</template>

<script>
const {SLOT_TYPE} = require('../../const')
export default {
  name: "PG-SLOT-COMPONENT",
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
      input: []
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
        type: SLOT_TYPE,
        value: inp
      };
    },
    valChange(input) {
      this.$emit("input", this.inp2val(this.input));
      this.input = this.val2inp(this.value);
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

