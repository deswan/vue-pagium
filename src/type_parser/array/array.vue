<template>
  <div class="pg-table-wrapper">
    <el-table 
    :data="input" size="mini" cell-class-name="pg-table-cell" row-key="__id__">
      <el-table-column width="50">
        <el-button plain slot-scope="scope" size="mini" type="danger" @click="delRow(scope.$index)">-</el-button>
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
    <div class="btns">
      <el-button plain icon="el-icon-plus" circle type="primary" size="mini" @click="add"></el-button>
      <el-button icon="el-icon-search" circle type="info" plain size="mini" @click="showDetail"></el-button>
    </div>
    <el-dialog :visible.sync="detail.show" append-to-body width="80%" :show-close="false">
        <el-table 
      :data="input" size="mini" cell-class-name="pg-table-cell" row-key="__id__">
        <el-table-column>
          <template slot-scope="scope">
            <el-button :disabled="scope.$index === 0" size="small" type="text" @click="upRow(scope.$index)" icon="el-icon-sort-up"></el-button>
            <el-button :disabled="scope.$index === input.length - 1" size="small" type="text" @click="downRow(scope.$index)" icon="el-icon-sort-down"></el-button>
            <el-button plain size="mini" type="danger" @click="delRow(scope.$index)">-</el-button>
          </template>
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
    <div class="btns">
      <el-button icon="el-icon-plus" plain circle type="primary" size="mini" @click="add"></el-button>
    </div>
    </el-dialog>
  </div>
</template>

<script>
// import Sortable from "sortablejs";
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
      input: this.value,
      uuid: 0,
      detail: {
        show: false
      }
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
      this.input = this.input2Obj(this.value);
    },
    delRow(index) {
      this.input.splice(index, 1);
      this.handleChange();
    },
    showDetail() {
      this.detail.show = true;
    },
    upRow(index) {
      let [item] = this.input.splice(index, 1);
      this.input.splice(index - 1, 0, item);
    },
    downRow(index) {
      let [item] = this.input.splice(index, 1);
      this.input.splice(index + 1, 0, item);
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
.el-table .pg-table-header:hover {
  background: whitesmoke;
}
.pg-table-header-cell {
  background: transparent !important;
}
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

.btns {
  text-align: center;
  margin-top: 10px;
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
.pg-table-wrapper{
  position: relative;
}
.pg-table-search-btn{
  position: absolute;
  top:5px;
  left:5px;
  z-index: 999;
}
</style>

