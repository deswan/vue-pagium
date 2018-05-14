<template>

<div class="board-wrapper">
  <div class="main-board" ref="mainBoard">
    <div id="board-mask" @click="clickMask" @mouseleave="onLeave" :style="{top:mask.top,left:mask.left,width:mask.width,height:mask.height}">
      {{mask.comObj ? mask.comObj.name : ''}}
    </div>
    <pg-com
      :com-obj="comObj" 
      @enter="onEnter" 
      @leave="onLeave" 
      v-for="comObj in $store.getters.components" 
      :key="comObj.pg"></pg-com>
    <!-- Dialogs -->
    <pg-com 
    :com-obj="comObj" 
    @enter="onEnter" 
    @leave="onLeave" 
    v-for="comObj in $store.getters.dialogs" 
    :key="comObj.pg"></pg-com>
  </div>

</div>

</template>

<script>
import COM from "./COM.vue";
import Dialog from "./Dialog.vue";
Vue.component("pagium-dialog2018", Dialog);
export default {
  components: {
    pgCom: COM
  },
  data() {
    return {
      mask: {
        top: 0,
        left: 0,
        width: 0,
        height: 0,
        comObj: null
      }
    };
  },
  methods: {
    onEnter({ comObj, rect }) {
      let { top, left, width, height } = rect;
      console.log(top)
      Object.assign(this.mask, {
        top: top - 80 + this.$refs.mainBoard.scrollTop + "px",
        left: left - 270 + "px",
        width: width + "px",
        height: height + "px",
        comObj
      });
    },
    onLeave({ comObj, rect }) {
      Object.assign(this.mask, {
        top: 0,
        left: 0,
        width: 0,
        height: 0,
        comObj: null
      });
    },
    clickMask() {
      if (this.mask.comObj) {
        this.$store.commit("activateComponent", { comObj: this.mask.comObj });
      }
    }
  },
  watch: {
    "$store.state.curHover"(comObj) {
      if (comObj) {
        let el = document.getElementById(`pg-com-${comObj.name}`);
        if (!el) return;
        this.onEnter({
          comObj,
          rect: document
            .getElementById(`pg-com-${comObj.name}`)
            .getBoundingClientRect()
        });
      } else {
        this.onLeave({});
      }
    }
  }
};
</script>

<style scoped>
.board-wrapper {
  box-sizing: border-box;
  position: absolute;
  top: 60px;
  left: 250px;
  right: 600px;
  bottom: 0;
  background-color: whitesmoke;
  overflow: auto;
}
.main-board {
  position: relative;
  height: calc(100% - 40px);
  margin: 20px;
  overflow: auto;
  background-color: white;
  box-shadow: 0 0 20px lightgray;
}
#board-mask {
  position: absolute;
  z-index: 2000;
  background-color: rgba(0, 0, 0, 0.2);
  font-size: 14px;
  line-height: 25px;
  padding-left: 5px;
  text-align: left;
  max-width: 100%;
  max-height: 100%;
}
</style>
