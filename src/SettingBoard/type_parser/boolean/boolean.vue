<template>
  <div>
    <el-switch v-model="input" @change="valChange"></el-switch>
  </div>
</template>

<script>
  export default {
    name: "Boolean",
    props: {
      name: String,
      pgChild: Boolean
    },
    data() {
      return {
        input: this.value
      };
    },
    created() {
      if (!this.pgChild) {
        this.input = this.$store.state.activeComponent.props[this.name]
      }
    },
    methods: {
      valChange(input) {
        if(this.pgChild){
          this.$emit('input',input);
        }else{
          this.$store.commit('input',{
            name: this.name,
            value: input
          })
        }
      }
    }
  };
</script>

<style scoped>
</style>
