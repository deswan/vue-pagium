<template>
      <el-table :data="input" size="mini">
        <el-table-column label="key" min-width="30">
          <span slot-scope="scope">{{scope.row.label}}</span>
        </el-table-column>
        <el-table-column label="value" min-width="40">
          <component size="mini" slot-scope="scope" :conf="scope.row.com.conf" @input="handleChange" v-model="scope.row.value" pg-child :is="scope.row.com.input" v-bind="scope.row.com.props"></component>
        </el-table-column>
      </el-table>
</template>

<script>
export default {
  name: "Object",
  props: {
    value: {},
    format: Array,
    conf: {}
  },
  data() {
    return {
      input: []
    };
  },
  created() {
    this.input = this.obj2Array(this.value);
  },
  methods: {
    obj2Array(obj) {
      let arr = [];
      Object.keys(obj).forEach(key => {
        let arrItem = {
          name: key,
          value: obj[key]
        };
        this.format.some(item => {
          if (arrItem.name === item.name) {
            arrItem.label = item.label;
            arrItem.com = item;
            return true;
          }
        });
        arr.push(arrItem);
      });

      return arr;
    },
    arr2Obj(arr) {
      return arr.reduce((obj, arrItem) => {
        obj[arrItem.name] = arrItem.value;
        return obj;
      }, {});
    },
    // //自由格式对象
    // addRow() {
    //   this.input.push({
    //     label: "",
    //     name: "",
    //     value: ""
    //   });
    // },
    // //自由格式对象
    // delRow(index) {
    //   this.input.splice(index, 1);
    //   this.inputArg();
    // },
    handleChange() {
      this.inputArg();
    },
    inputArg() {
      this.$emit("input", this.arr2Obj(this.input));
      this.input = this.obj2Array(this.value);
    }
  },
  watch: {
    value() {
      this.input = this.obj2Array(this.value);
    }
  }
};
</script>

<style scoped>
/* .add-row {
  height: 30px;
  line-height: 30px;
  transition: all 0.5s ease;
  cursor: pointer;
}

.add-row:hover {
  background-color: whitesmoke;
} */
</style>

