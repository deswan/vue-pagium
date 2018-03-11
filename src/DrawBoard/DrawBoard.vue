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
  position: absolute;
  top: 40px;
  left: 200px;
  width: 600px;
  height: 800px;
  background-color: white;
}
.board-wrapper {
  position: relative;
  height: 2000px;
  width: 2000px;
}
.dialog-board {
  position: absolute;
  left: 850px;
  width: 400px;
  height: 300px;
  background-color: white;
}
</style>
