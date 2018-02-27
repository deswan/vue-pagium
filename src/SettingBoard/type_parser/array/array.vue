<template>
    <div class="row">
        <div class="col" v-for="(item,idx) in input" :key="idx">
            <component :is="_itemCOM.input" v-bind="_itemCOM.props" pg-child v-model="input[idx]" @input="handleChange"></component>
        </div>
        <div class="col add" @click="add"><i class="el-icon-plus"></i></div>
    </div>
</template>

<script>
let defaultValue;
export default {
  name: "Array",
  props: {
    _itemCOM:Object,
    name:String
  },
  created() {
    if (!this.pgChild) {
        defaultValue = JSON.stringify(this.$store.state.activeComponent.props[this.name][0])
        this.input = this.$store.state.activeComponent.props[this.name]
    }
  },
  data() {
    return {
      input: ["", "", ""]
    };
  },
  methods: {
    add() {
      this.input.push(JSON.parse(defaultValue));
    },
    handleChange(val) {
        this.$store.commit('input',{
            name: this.name,
            value: this.input
        })
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
</style>

