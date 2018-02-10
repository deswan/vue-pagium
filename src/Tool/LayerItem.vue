<template>
  <div class="layer-li" @click="onClick">
      {{comObj.name}}
  </div>
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
