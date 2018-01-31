<template>
    <ul>
        <li v-for="(com,idx) in $store.state.components" :key="idx">
            <layer-folder v-if="com.subCOM && com.subCOM.length" :com="com"></layer-folder>
            <layer-item v-else :com="com"></layer-item>
        </li>
    </ul>
</template>

<script>
export default {
  props: ["com"],
  data() {
    return {};
  },
  methods: {}
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
