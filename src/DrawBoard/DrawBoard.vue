<template>
  <div class="draw-board">
      <components :is="comMap[com.name]" v-bind="com.props" v-for="(com,idx) in $store.state.components" :key="idx"></components>
  </div>
</template>

<script>
import Table from '../Components/Table/Table.vue';
const comMap = {
    Table
}
export default {
  created(){
  },
  data(){
    return {
        comMap
    }
  }
}
</script>

<style>
.draw-board{
    position: absolute;
    top:100px;
    left: 50%;
    transform: translateX(-50%);
    width: 80%;
    height: 600px;
    background-color: white;
}
</style>
