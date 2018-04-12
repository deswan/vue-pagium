<template>
  <div>
    <div v-if="format" key="1">
      <el-table :data="input" size="mini">
        <el-table-column label="label" min-width="30">
          <span slot-scope="scope">{{scope.row.label}}</span>
        </el-table-column>
        <el-table-column label="value" min-width="40">
          <component size="mini" slot-scope="scope" :conf="scope.row.com.conf" @input="handleChange" v-model="scope.row.value" pg-child :is="scope.row.com.input" v-bind="scope.row.com.props"></component>
        </el-table-column>
      </el-table>
    </div>
    <div v-else key="2">
      <el-table :data="input" size="mini">
        <el-table-column width="60">
          <el-button slot-scope="scope" size="mini" type="danger" @click="delRow(scope.$index)"> - </el-button>
        </el-table-column>
        <el-table-column label="label" min-width="30">
          <el-input size="mini" v-model="scope.row.name" slot-scope="scope" @change="handleChange"></el-input>
        </el-table-column>
        <el-table-column label="value" min-width="60">
          <el-input size="mini" v-model="scope.row.value" slot-scope="scope" @change="handleChange"></el-input>
        </el-table-column>
      </el-table>
      <div class="add-row" @click="addRow">
        <i class="el-icon-plus"></i>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "Object",
  props: {
    value: Object,
    format: Array,
    conf:{}
  },
  data() {
    return {
      input: []
    };
  },
  created() {
    if(this.format){
      this.input = this.obj2Array(this.value);
    }
  },
  methods: {
    obj2Array(obj) {
      let arr = [];
      for (let key in obj) {
        let arrItem = {
          label: key,
          name: key,
          value: obj[key]
        };
        if (this.format) {
          this.format.some(item => {
            if (arrItem.name === item.name) {
              arrItem.label = item.label;
              arrItem.com = item;
              return true;
            }
          });
        }
        arr.push(arrItem);
      }
      return arr;
    },
    arr2Obj(arr) {
      return arr.reduce((obj, arrItem) => {
        obj[arrItem.name] = arrItem.value;
        return obj;
      }, {});
    },
    //自由格式对象
    addRow() {
      this.input.push({
        label: "",
        name: "",
        value: ""
      });
    },
    //自由格式对象
    delRow(index) {
      this.input.splice(index, 1);
      this.inputArg();
    },
    handleChange() {
      this.inputArg();
    },
    inputArg() {
      this.$emit("input", this.arr2Obj(this.input));
    }
  },
  watch:{
    value(){
      if(this.format){
        this.input = this.obj2Array(this.value);
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

