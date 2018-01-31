<template>
  <ul class="layer-ul" :data-name="com.name" @click="onClick">
      {{com.name}}
  </ul>
</template>

<script>
import LayerItem from "./LayerItem.vue";
export default {
  components: {
    LayerItem
  },
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
.layer-ul {
  list-style-type: none;
  height: 40px;
  line-height: 40px;
  background-color: white;
  opacity: 1;
}
.layer-ul:before {
  display: block;
  content: attr(data-name);
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
