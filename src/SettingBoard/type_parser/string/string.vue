<template>
    <el-select v-model="input" :size="size" @change="valChange" v-if="options && options.length" placeholder="">
      <el-option v-for="option in options" :key="option.key" :value="option.key" :label="option.value"></el-option>
    </el-select>
    <el-input v-model="input" :size="size" @change="valChange" v-else></el-input>
    
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
    options:Array,
    name: String,
    pgChild: Boolean
  },
  data() {
    return {
      input: this.value
    };
  },
  created(){
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
