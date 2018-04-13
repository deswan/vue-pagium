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
      input: ""
    };
  },
  created() {
    this.input = this.val2inp(this.value);
  },
  methods: {
    val2inp(val) {
      return val.value.join(',');
    },
    inp2val(inp) {
      return {
        type: "__pg_type_slot_component__",
        value: inp.split(',')
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

