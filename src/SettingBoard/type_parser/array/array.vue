<template>
    <div class="row">
        <div class="col" v-for="(item,idx) in input" :key="idx">
            <component :key="_itemCOM.name" :label="_itemCOM.label" :is="_itemCOM" v-bind="_itemCOM.props"></component>
        </div>
        <div class="col add" @click="add"><i class="el-icon-plus"></i></div>
    </div>
</template>

<script>
export default {
  name: "Array",
  props: {
    default: {
      type: Array
    },
    _itemCOM: {}
  },
  data() {
    return {
      input: ["", "", ""]
    };
  },
  created() {},
  methods: {
    add() {
      this.input.push("");
    }
  }
};
</script>

<style scoped>
.row {
  display: flex;
  flex-flow: row wrap;
  align-items: stretch;
  width: 100%;
}

.col {
  flex: 0 0 150px;
  margin-right: 10px;
}

.add {
  position: relative;
  transition: all 0.5s ease;
  cursor: pointer;
  height: 100px;
}

.add:hover {
  background-color: whitesmoke;
}

.add i {
  font-size: 20px;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
</style>

