<template>
  <div>
    <el-table :data="input" size="mini" cell-class-name="pg-table-cell" row-key="__id__">
      <el-table-column width="60">
        <el-button slot-scope="scope" size="mini" type="danger" @click="delRow(scope.$index)"> - </el-button>
      </el-table-column>
      <el-table-column v-for="col in _itemCOM" :label="col.label" :key="col.name">
        <component 
            slot-scope="scope"
            :is="col.input" 
            v-bind="col.props" 
            :conf="col.conf" 
            size="mini"
            v-model="scope.row[col.name]"
            @input="handleChange">
        </component>
      </el-table-column>
    </el-table>
    <div class="col add" @click="add"><i class="el-icon-plus"></i></div>
  </div>
</template>

<script>
let defaultValue;
export default {
  name: "Array",
  props: {
    conf: {},
    value: Array,
    _itemCOM: Array,
    arrItem: {}
  },
  data() {
    return {
      cols: [],
      input: this.value,
      uuid: 0
    };
  },
  created() {
    this.input = this.input2Obj(this.value);
  },
  methods: {
    input2Obj(value) {
      if (this.conf.value[0] === "object") {
        return value.map(e => {
          return {
            ...e,
            __id__: this.uuid++
          };
        });
      } else {
        return value.map(e => {
          return {
            [_itemCOM.name]: e,
            __id__: this.uuid++
          };
        });
      }
    },
    objTOInput(input) {
      if (this.conf.value[0] === "object") {
        return input.map(e => {
          e = JSON.parse(JSON.stringify(e));
          delete e.__id__;
          return e;
        });
      } else {
        return input.map(e => {
          return e[_itemCOM.name];
        });
      }
    },
    add() {
      this.input.push(
        this.input2Obj([JSON.parse(JSON.stringify(this.arrItem))])[0]
      );
      this.handleChange();
    },
    handleChange() {
      this.$emit("input", this.objTOInput(this.input));
    },
    delRow(index) {
      this.input.splice(index, 1);
      this.handleChange();
    }
  },
  watch: {
    value() {
      this.input = this.input2Obj(this.value);
    }
  }
};
</script>

<style>
.row {
  display: flex;
  flex-flow: row wrap;
  align-items: stretch;
  width: 100%;
}

.col {
  flex: 0 0 calc(100% / 2 - 1px);
  box-sizing: border-box;
  padding-right: 10px;
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

.pg-table-cell .cell {
  padding: 0 3px;
}
</style>

