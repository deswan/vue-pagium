<template>
      <component
      :is="comObj.realTimePreview"
      v-bind="comObj.props" 
      :pg-active="$store.state.activeComponent && $store.state.activeComponent.pg === comObj.pg || subActive"
      :id="`pg-com-${comObj.name}`" 
      @mouseenter.native="onMouseenter"
      @mouseleave.native="onMouseleave">
          <template v-if="comObj.children && comObj.children.length">
            <pg-com @enter="onEnter" @leave="onLeave" :com-obj="subCom" v-for="subCom in comObj.children" :key="subCom.pg"></pg-com>
          </template>
      </component>
</template>

<script>
export default {
  name: "pgCom",
  props: {
    comObj: {
      required: true
    }
  },
  errorCaptured(err,vm,info){
    return false;
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
      if(e.currentTarget.id === 'board-mask') return;
      let $el = e.currentTarget;
      this.$emit('enter',{
        comObj:this.comObj,
        rect:$el.getBoundingClientRect()
      })
    },
    onMouseleave(e){
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
