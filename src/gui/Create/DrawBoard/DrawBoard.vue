<template>
<div class="board-wrapper">
  <div class="main-board">
      <pg-com :com-obj="comObj" v-for="comObj in $store.getters.components" :key="comObj.pg"></pg-com>
  </div>

  <!-- Dialogs -->
  <pg-com :com-obj="comObj"  v-for="comObj in $store.getters.dialogs" :key="comObj.pg"></pg-com>
</div>
</template>

<script>
import COM from "./COM.vue";
import {on,off} from "element-ui/src/utils/dom";
export default {
  components: {
    pgCom: COM
  },
  data() {
    return {};
  }
};
</script>

<style>
.main-board {
  width: 400px;
  height: 500px;
  margin:100px auto 0;
  background-color: white;
}
.dialog-board {
  position: absolute;
  left: 850px;
  width: 400px;
  height: 300px;
  background-color: white;
}
</style>
