<template>
      <components :is="$store.getters.type2Com[comObj.type]" v-bind="comObj.props" class="pg-com" 
      :active="$store.state.activeComponent && $store.state.activeComponent.pg === comObj.pg" 
      :subActive="subActive"
      :pg="comObj.pg">
          <template v-if="comObj.children && comObj.children.length">
            <pg-com :com-obj="subCom" v-for="subCom in comObj.children" :key="subCom.pg"></pg-com>
          </template>
      </components>
</template>

<script>
export default {
  name: "pgCom",
  props: {
    comObj: {
      required: true
    }
  },
  computed: {
    subActive() {
      if(!this.$store.state.activeComponent) return false;
      return find(this.comObj.children, this.$store.state.activeComponent);
      function find(list, node) {
        if (!list) return false;
        return list.some(e => {
          if ((e.pg === node.pg)) {
            return true;
          } else {
            return find(e.children, node);
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