<template>
    <div>
        <el-form-item :label="label">
            <div v-if="!format">
                <el-table :data="input" size="mini">
                    <el-table-column width="60">
                        <el-button slot-scope="scope" size="mini" type="danger" @click="delRow(scope.$index)"> - </el-button>
                    </el-table-column>
                    <el-table-column label="label" min-width="30">
                        <el-input size="mini" v-model="scope.row.name" slot-scope="scope" @inputArg="handleChange(scope.$index,arguments[0].value,'name')"></el-input>
                    </el-table-column>
                    <el-table-column label="value" min-width="60">
                        <el-input size="mini" v-model="scope.row.value" slot-scope="scope" @inputArg="handleChange(scope.$index,arguments[0].value,'value')"></el-input>
                    </el-table-column>
                </el-table>
                <div class="add-row" @click="addRow">
                    <i class="el-icon-plus"></i>
                </div>
            </div>
            <div v-else>
                <el-table :data="input" size="mini">
                    <el-table-column label="label" min-width="30">
                        <span slot-scope="scope">{{scope.row.label}}</span>
                    </el-table-column>
                    <el-table-column label="value" min-width="60">
                        <template slot-scope="scope">
                            <component size="mini" @inputArg="handleChange(scope.$index,arguments[0].value,'value')" pg-child :is="scope.row.c.component" v-bind="scope.row.c.props"></component>
                        </template>
                    </el-table-column>
                </el-table>
            </div>
        </el-form-item>
    </div>
</template>
<script>
export default {
  name: "Object",
  props: {
    value: {
      type: Object
    },
    format: {
      type: Array
    },
    label: {},
    name: String,
    pgChild: Boolean
  },
  data() {
    return {
      _value: this.value
    };
  },
  created() {},
  methods: {
    addRow() {
      this._value.push({ label: "", name: "", value: "" });
    },
    delRow(index) {
      this._value.splice(index, 1);
      this.inputArg();
    },
    handleChange(idx, val, type) {
      type == 'name' && (this._value[idx].name = val);
      type == 'value' && (this._value[idx].value = val);
      this.inputArg();
    },
    inputArg() {
      let obj = {};
      this._value.forEach(item => {
        if (!item.name) return;
        obj[item.name] = item.value;
      });
      if (this.pgChild) {
        this.$emit("inputArg", {
          name: this.name,
          value: obj
        });
      } else {
        this.$store.commit("inputArg", {
          name: this.name,
          value: obj
        });
      }
    }
  }
};
</script>
<style scoped>
.add-row {
  height: 30px;
  line-height: 30px;
  transition: all 0.5s ease;
  cursor: pointer;
}
.add-row:hover {
  background-color: whitesmoke;
}
</style>

