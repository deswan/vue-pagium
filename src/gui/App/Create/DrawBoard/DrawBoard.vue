<template>
<div>
  <div class="board-wrapper" ref="mainBoard" @click="clickMask">
      <div id="board-mask" @mouseleave="onLeave" :style="{top:mask.top,left:mask.left,width:mask.width,height:mask.height}">
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
  <div class="board-notice">element-ui@2.3.9 imported</div>
</div>
</template>

<script>
import Vue from 'vue'
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
      Object.assign(this.mask, {
        top: top - 60 + this.$refs.mainBoard.scrollTop + "px",
        left: left - 251 + this.$refs.mainBoard.scrollLeft + "px",
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
.board-notice{
  position: absolute;
  height: 20px;
  bottom:0;
  left:251px;  
  right:601px;
  line-height: 20px;
  text-align: center;
  background: whitesmoke;
  font-size: 11px;
  color:#999;
}
.board-wrapper {
  box-sizing: border-box;
  position: absolute;
  top: 60px;
  left: 250px;
  right: 600px;
  bottom: 0;
  overflow: auto;
  border:solid 1px #eee;
  border-top:none;
  border-bottom:none;
  padding: 20px 20px 30px;
}
/* .main-board {
  position: relative;
  height: calc(100% - 40px);
  margin: 20px;
  overflow: auto;
} */
#board-mask {
  box-sizing: border-box;
  position: absolute;
  z-index: 3000;
  background-color: rgba(0, 0, 0, 0.2);
  font-size: 14px;
  line-height: 15px;
  padding-left: 5px;
  text-align: center;
  overflow: hidden;
}
</style>
