<template>
    <div>
        <el-form-item :label="label">
            <div class="row">
                <div class="col" v-for="(item,idx) in _value" :key="idx">
                    <component @inputArg="inputArg(idx,arguments[0].value)" v-model="_value[idx]" :key="_itemCOM.name" pgChild :is="_itemCOM.component" v-bind="_itemCOM.props"></component>
                </div>
                <div class="add col" @click="add">
                    <i class="el-icon-plus"></i>
                </div>
            </div>
        </el-form-item>
    </div>
</template>
<script>
export default {
  name: "Array",
  props: {
    value: {
      type: Array
    },
    label: {},
    _itemCOM: {},
    name: String
  },
  data() {
    return {
      _value: this.value
    };
  },
  created() {},
  methods: {
    add() {
      this._value.push("");
    },
    inputArg(idx, val) {
      this._value[idx] = val;
      this.$store.commit("inputArg", {
        name: this.name,
        value: this._value
      });
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

