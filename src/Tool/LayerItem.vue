<template>
  <div class="layer-li" @click="onClick">
      {{com.name}}
  </div>
</template>

<script>
export default {
  props: ["com"],
  data() {
    return {};
  },
  methods: {
      onClick(){
          this.$store.commit('activateCOM',this.com)
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
