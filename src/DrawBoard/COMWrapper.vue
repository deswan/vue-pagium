<template>
      <components :is="comObj.com" v-bind="comObj.props" class="pg-com" 
      :active="$store.state.activeComponent === comObj" 
      :subActive="subActive"
      :id="comObj.id">
          <template v-if="comObj.subCom && comObj.subCom.length">
            <com-wrapper :com-obj="subCom" v-for="subCom in comObj.subCom" :key="subCom.id"></com-wrapper>
          </template>
      </components>
</template>

<script>
export default {
  name: "comWrapper",
  props: {
    comObj: {
      required: true
    }
  },
  computed: {
    subActive() {
      return find(this.comObj.subCom, this.$store.state.activeComponent);
      function find(list, node) {
        if (!list) return false;
        return list.some(e => {
          if ((e.id = node.id)) {
            return true;
          } else {
            return find(e.subCom, node);
          }
        });
      }
    }
  },
  created() {},
  data() {
    return {};
  }
};
</script>