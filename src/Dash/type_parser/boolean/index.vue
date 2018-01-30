<template>
    <div>
        <el-form-item :label="label">
            <el-switch v-model="input"></el-switch>
        </el-form-item>
        <div v-if="on && on.length && input">
            <component v-for="item in on" :key="item.name" :label="item.label" :is="item.component" v-bind="item.props"></component>
        </div>
    </div>
</template>
<script>
export default {
  name: "Boolean",
  props: {
    default: {
      type: Boolean
    },
    on: {
      type: Array
    },
    label: {}
  },
  data() {
    return {
      input: this.default || false
    };
  }
};
</script>
