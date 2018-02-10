<template>
<div>
  <div class="toolbox">
      <el-popover placement="right-end" trigger="click">
        <el-button slot="reference" type="primary">添加组件</el-button>
        <div class="com-lib">
            <div @click="addCom(com)" class="com-lib-item" v-for="(com,key) in allComs" :key="key">{{com.name}}</div>
        </div>
      </el-popover>
      <ul>
          <template v-for="(comObj,idx) in $store.state.components">
              <layer-folder v-if="comObj.subCom && comObj.subCom.length" :key="comObj.id" :com-obj="comObj" @mousedown="onMouseDown(comObj,idx)" @mouseup="onMouseUp" ref="layerItem"></layer-folder>
              <layer-item v-else :key="comObj.id" :com-obj="comObj" @mousedown="onMouseDown(comObj,idx)" ref="layerItem" :class="{'related-layer-item-up':comObj === movingRelate.comObj && movingRelate.direction == 'before' ,
              'related-layer-item-down':comObj === movingRelate.comObj && movingRelate.direction == 'after'}"></layer-item>
          </template>
      </ul>
      
      <div v-if="$store.state.dialogs.length" style="margin-top:20px">
       <!-- <div style="margin-top:20px">对话框</div> -->
        <ul>
              <layer-item :key="comObj.id" :com-obj="comObj" v-for="comObj in $store.state.dialogs"></layer-item>
        </ul>
      </div>
  </div>
  <div v-if="movingComObj" id="moving" :style="{left:movingComX - 50 +'px',top:movingComY - 20 +'px'}">
    <span>{{movingComObj.name}}</span>
  </div>
</div>
</template>

<script>
import Table from "../Components/Table/Table.vue";
import TableConfig from "../Components/Table/config";
import Dialog from "../Components/Dialog/Dialog.vue";
import DialogConfig from "../Components/Dialog/config";

import LayerItem from "./LayerItem.vue";
import LayerFolder from "./LayerFolder.vue";

import scheme2Default from "./scheme2Default.js";
const allComs = {
  Table,
  Dialog
};
const allComsConfig = {
  Table:TableConfig, Dialog:DialogConfig
}
export default {
  components: {
    LayerItem,
    LayerFolder
  },
  data() {
    return {
      allComs,
      movingComObj:null,
      movingComX:0,
      movingComY:0,
      movingRelate:{
        comObj:null,
        direction:'up'
      },
    };
  },
  methods: {
    addCom(com) {
      this.$store.commit("addComponent", {
        id: +new Date(),
        name: com.name,
        type: com.name,
        nestable:allComsConfig[com.name].nestable,
        props: scheme2Default(allComsConfig[com.name].props),
        com,
        subCom: null
      });
    },
    onMouseDown(comObj,idx){
      this.movingComObj = comObj;
      this.movingComIdx = idx;
      window.addEventListener('mousemove',this.onMouseMove)
      window.addEventListener('mouseup',this.onMouseUp)
      console.log(this.$refs.layerItem)
    },
    onMouseUp(){
      this.movingComObj = null;
      window.removeEventListener('mousemove',this.onMouseMove)
      window.removeEventListener('mouseup',this.onMouseUp)
      this.movingRelate.comObj = null;
      this.movingRelate.direction = '';
    },
    onMouseMove(e){
      this.movingComX = e.pageX;
      this.movingComY = e.pageY;
      let hasRelated = this.$refs.layerItem.some((vm,idx)=>{
        let dom = vm.$el;
        let top = dom.getBoundingClientRect().top;
        if(this.movingComObj === vm.comObj) return;
        if(top < e.clientY && e.clientY < top + 20){
          this.movingRelate.comObj = vm.comObj;
          this.movingRelate.direction = 'before';
          return true;
        }else if(top + 20 < e.clientY && e.clientY < top + 40){
          this.movingRelate.comObj = vm.comObj;
          this.movingRelate.direction = 'after';
          return true;
        }
      })
      if(!hasRelated){
        this.movingRelate.comObj = null;
        this.movingRelate.direction = '';
      }
    }
  }
};
</script>

<style scoped>
.toolbox {
  position: fixed;
  width: 100px;
  background: whitesmoke;
  left: 0;
  top: 60px;
  padding-top: 20px;
  height: 100%;
}
.com-lib {
  width: 150px;
}
.com-lib-item {
  display: inline-block;
  width: 75px;
  height: 75px;
  line-height: 75px;
  text-align: center;
  border-radius: 10px;
}
.com-lib-item:hover {
  background-color: whitesmoke;
}
#moving{
  position: absolute;
  background: white;
  width: 100px;
  height: 40px;
  text-align: center;
  line-height: 40px;
  opacity: 0.5;  
  z-index: 99999999;
}
.related-layer-item-down{
  border-bottom:solid 2px yellow;
}
.related-layer-item-up{
  border-top:solid 2px yellow;
}
</style>
