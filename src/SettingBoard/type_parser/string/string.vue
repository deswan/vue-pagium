<template>
    <el-form-item :label="label" v-if="label">
        <el-input v-model="_value" :size="size" @change="valChange">></el-input>
    </el-form-item>
    <el-input v-else v-model="_value" :size="size" @change="valChange"></el-input>
</template>
<script>
export default {
  props: {
    value: {
      type: String
    },
    size: {
      default: "small"
    },
    label: {},
    name: String,
    pgChild: Boolean
  },
  data() {
    return {
      _value: this.value
    };
  },
  methods: {
    valChange() {
      if (this.pgChild) {
        this.$emit("inputArg", {
          name: this.name,
          value: this._value
        });
      }else{
          this.$store.commit("inputArg", {
            name: this.name || '',
            value: this._value
          });
      }
    }
  }
};
</script>
