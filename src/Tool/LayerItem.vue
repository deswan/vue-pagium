<template>
  <li class="layer-li" @click="onClick" @mousedown="onMouseDown">
      {{comObj.name}}
  </li>
</template>

<script>
export default {
  props: ["comObj"],
  data() {
    return {};
  },
  methods: {
      onClick(){
          this.$store.commit('activateComponent',this.comObj)
      },
      onMouseDown(e){
        this.$emit('mousedown',e)
      }
  }
};
</script>

<style scoped>
.layer-li {
  list-style-type: none;
  height: 40px;
  line-height: 40px;
  background-color: white;
  opacity: 1;
}
.layer-li:hover {
  opacity: 0.6;
}
</style>
