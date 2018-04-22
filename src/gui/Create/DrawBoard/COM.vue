<template>
      <components :is="$store.getters.type2Com[comObj.type]" v-bind="comObj.props" class="pg-com" 
      :active="$store.state.activeComponent && $store.state.activeComponent.pg === comObj.pg" 
      :com-name="comObj.name"
      :subActive="subActive"
      :id="`pg-com-${comObj.name}`"
      @mouseenter.native="onMouseenter"
      @mouseleave.native="onMouseleave"
      :pg="comObj.pg">
          <template v-if="comObj.children && comObj.children.length">
            <pg-com  @enter="onEnter" @leave="onLeave" :com-obj="subCom" v-for="subCom in comObj.children" :key="subCom.pg"></pg-com>
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
  },
  methods:{
    onEnter(e){
      this.$emit('enter',e)
    },
    onLeave(e){
      this.$emit('leave',e)
    },
    onMouseenter(e){
      if(this.comObj.isDialog) return;
      if(e.currentTarget.id === 'board-mask') return;
      let $el = e.currentTarget;
      this.$emit('enter',{
        comObj:this.comObj,
        rect:$el.getBoundingClientRect()
      })
    },
    onMouseleave(e){
      if(this.comObj.isDialog) return;
      if(e.currentTarget.id === 'board-mask') return;
      if(e.relatedTarget.id === 'board-mask') return;
      let $el = e.currentTarget;
      this.$emit('leave',{
        comObj:this.comObj,
        rect:$el.getBoundingClientRect()
      })
    }
  }
};
</script>
<style>

</style>
