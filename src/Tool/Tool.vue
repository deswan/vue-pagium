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
              <layer-folder v-if="comObj.subCom && comObj.subCom.length" :key="comObj.id" :com-obj="comObj" @mousedown="onMouseDown(arguments[0],comObj,idx)" @mouseup="onMouseUp" ref="layerItem"></layer-folder>
              <layer-item v-else :key="comObj.id" :com-obj="comObj" @mousedown="onMouseDown(arguments[0],comObj,idx)" ref="layerItem" :class="{'related-layer-item-up':comObj === movingRelate.comObj && movingRelate.direction == 'before' ,
              'related-layer-item-down':comObj === movingRelate.comObj && movingRelate.direction == 'after',
              'related-layer-item-in':comObj === movingRelate.comObj && movingRelate.direction == 'in'}"></layer-item>
          </template>
      </ul>
    <vue-drag-tree :model="data" default-text='"New A Girl"' hover-color="lightgrey" highlight-color="green"></vue-drag-tree>
      
      
      <div v-if="$store.state.dialogs.length" style="margin-top:20px">
       <!-- <div style="margin-top:20px">对话框</div> -->
        <ul>
            <template v-for="(comObj,idx) in $store.state.dialogs">
              <layer-folder v-if="comObj.subCom && comObj.subCom.length" :key="comObj.id" :com-obj="comObj" @mousedown="onMouseDown(arguments[0],comObj,idx)" @mouseup="onMouseUp" ref="layerItem"></layer-folder>
              <layer-item v-else :key="comObj.id" :com-obj="comObj" @mousedown="onMouseDown(arguments[0],comObj,idx)" ref="layerItem" :class="{'related-layer-item-up':comObj === movingRelate.comObj && movingRelate.direction == 'before' ,
              'related-layer-item-down':comObj === movingRelate.comObj && movingRelate.direction == 'after',
              'related-layer-item-in':comObj === movingRelate.comObj && movingRelate.direction == 'in'}"></layer-item>
            </template>
        </ul>
      </div>
  </div>
  <div v-if="isMoving" id="moving" :style="{left:movingComX - 50 +'px',top:movingComY - 20 +'px'}">
    <span v-if="isMoving">{{movingComObj.name}}</span>
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
      isMoving:false,
      movingComObj:null,
      movingComX:0,
      movingComY:0,
      movingRelate:{
        comObj:null,
        direction:'before'
      },
      mouseDownX:0,
      mouseDownY:0,
      data:{
        name: 'Root',
        id: 0,
        children: [
          {
            name: 'Node 1-1',
            id: 1,
            children: [
              {
                name: 'Node 2-1',
                id: 2
              }
            ]
          },
          {
            name: 'Node 1-2',
            id: 3
          }
        ]
      }
    };
  },
  methods: {
    assignData(data) {
      // data is a json object that node infomation was exchanged inside.You need to assign to finish the last step of exchange.
      
      // If you have not use vuex or something similar, you can just assign data to this.data
      this.data = data
      
      // If you have used vuex or something similar, you need to write assign code by yourselft.
      // vuex as an example:
      // updateData function is a mutation of vuex. 
      
      // this.updateData(data)
    },
    curNodeClicked(model,component) {
      // information of the node clicked just now.
    },
    addCom(com) {
      let name = this.getComName(com.name)
      this.$store.commit("addComponent", {
        id: +new Date(),
        name,
        type: com.name,
        nestable:allComsConfig[com.name].nestable,
        props: {...scheme2Default(allComsConfig[com.name].props),name},
        com,
        subCom: null
      });
    },
    getComName(name){
      for(let n=0;n<1000;n++){
        let newName = '' + name + (n || '')
        let isExist = this.$store.state.components.concat(this.$store.state.dialogs).some(comObj=>{
          return comObj.name === newName;
        })
        if(!isExist){
          return newName;
        }
      }
    },
    onMouseDown(e,comObj,idx){
      this.movingComObj = comObj;
      this.movingComIdx = idx;
      this.mouseDownX = e.pageX;
      this.mouseDownY = e.pageY;
      window.addEventListener('mousemove',this.onMouseMove)
      window.addEventListener('mouseup',this.onMouseUp)
    },
    onMouseUp(){
      if(this.isMoving && this.movingComObj && this.movingRelate.comObj){
        this.$store.commit('sort',{
          relateComObj:this.movingRelate.comObj,
          relateDirection:this.movingRelate.direction,
          comObj:this.movingComObj
        })
      }
      this.isMoving = false;
      this.movingComObj = null;
      this.movingRelate.comObj = null;
      this.movingRelate.direction = '';
      window.removeEventListener('mousemove',this.onMouseMove)
      window.removeEventListener('mouseup',this.onMouseUp)
    },
    onMouseMove(e){
      if(!this.isMoving && (e.pageX > this.mouseDownX + 10 || e.pageX < this.mouseDownX - 10 || e.pageY > this.mouseDownY + 10 || e.pageY < this.mouseDownY - 10)){
        this.isMoving = true;
      }
      this.movingComX = e.pageX;
      this.movingComY = e.pageY;
      let hasRelated = this.$refs.layerItem.some((vm,idx)=>{
        let dom = vm.$el;
        let top = dom.getBoundingClientRect().top;
        if(this.movingComObj === vm.comObj) return;
        if(top < e.clientY && e.clientY < top + 10){
          this.movingRelate.comObj = vm.comObj;
          this.movingRelate.direction = 'before';
          return true;
        }else if(top + 30 < e.clientY && e.clientY < top + 40){
          this.movingRelate.comObj = vm.comObj;
          this.movingRelate.direction = 'after';
          return true;
        }else if(top + 10 < e.clientY && e.clientY < top + 30 && vm.comObj.nestable){
          this.movingRelate.comObj = vm.comObj;
          this.movingRelate.direction = 'in';
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
  user-select: none;
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
.related-layer-item-in{
  background-color:grey;
}
</style>
