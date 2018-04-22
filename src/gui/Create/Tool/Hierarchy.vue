<template>
  <!-- [解析]
  [:draggable="{Boolean}"] 空节点不能被拖动，判断依据是是否存在 node.name
  [@dragover.prevent] 必须设置，否则浏览器默认是禁用拖动的 -->
  <div class="tree-node" :class="{ 'empty-node': !node.name }"
       :draggable="!!node.name && idx!==undefined"
       @dragover.prevent
       @dragstart.stop="handleDragStart"
       @drop.stop="handleDrop"
       @dragenter.stop="handleDragEnter"
       @dragleave.stop="handleDragLeave"
       @dragend.prevent="handleDragEnd">
    <div 
    @click="emitEvent('nodeRow')" 
    @mouseenter="onMouseEnter" 
    @mouseleave="onMouseLeave" 
    class="tree-node-name" 
    :style="{'padding-left': level * 16 +10 + 'px','padding-right':'10px'}" 
    :class="[{'has-name': node.name,'cur-select':node === $store.state.activeComponent}, 'idx_' + idx ]">
      <div>
        <span>
          <span class="el-tree-node__label">
            <span v-if="!!node.__pg_slot__">
              <el-tag size="mini" type="info" style="font-size:10px;">
              slot
              </el-tag>
              </span>
            {{ node.name }}
          </span>
          <i @click="emitEvent('nodeName')" 
            v-if="node.name && node.children && node.children.length > 0" 
            :class="{'el-icon-arrow-down': hideChildren, 'el-icon-arrow-up': !hideChildren }"></i>
        </span>
        <span class="tree-node-action" v-if="node.name">
          <el-popover placement="right-end" trigger="click" v-model="showComlib">  
            <div class="com-lib" v-if="isDialog && idx === undefined">
              <div >
                <!-- <h6 class="com-lib-title">本地组件库</h6> -->
                <div @click="emitEvent('addCom',{comType,parent:node})" class="com-lib-item" v-for="comType in $store.getters.allDialogsType" :key="comType">
                  <span class="com-lib-item-text">{{comType}}</span>
                </div>
              </div>
            </div>
            <div class="com-lib" v-else>
                <!-- <h6 class="com-lib-title">本地组件库</h6> -->
                <div @click="emitEvent('addCom',{comType,parent:node})" class="com-lib-item" v-for="comType in $store.getters.allComsType" :key="comType">
                  <span class="com-lib-item-text">{{comType}}</span>
                </div>
            </div>        
            <el-button icon="el-icon-plus" size="mini" type="text" slot="reference" @click.stop="emitEvent('add')">
              </el-button>      
          </el-popover>
          <el-button icon="el-icon-delete" v-if="idx !== undefined" size="mini" type="text" slot="reference" @click="emitEvent('delete',{parent:$parent.node,node})">
              </el-button>      
        </span>
      </div>
    </div>
    <div class="tree-node-children">
      <tree-node
        v-show="!hideChildren"
        v-for="(child, $index) in children" :key="$index"
        v-model="valueModel" :node="child" :idx="$index" :level="level+1"
        :type="type"
        >
      </tree-node>
    </div>
  </div>
</template>
<script>
import Vue from "vue";
export default {
  name: "tree-node", // 递归组件需指明 name
  props: {
    value: Object, // 正在拖动的节点实例（TreeNode 组件通用，须双向绑定）
    node: Object, // 节点数据，形如 { name: 'xxx', children: [] }
    idx: Number, // v-for 的索引，用于相邻节点的判别
    level: {
      type: Number,
      default: 0
    }, // 层级
    type: String,
    isDialog: Boolean
  },
  data: function() {
    return {
      hideChildren: false,
      unwatchRootNode: () => {},
      showComlib: false
    };
  },
  beforeDestroy() {
    if (typeof this.idx === "undefined") {
      this.unwatchRootNode();
    }
  },
  computed: {
    valueModel: {
      get: function() {
        return this.value;
      },
      set: function(val) {
        this.$emit("input", val);
      }
    },
    children() {
      // 为每个子节点前后都生成空节点，便于实现兄弟节点间的“插入排序”
      // 举例：原本是 [N1, N2, N3]
      let { children } = this.node;
      if (!children || !children.length) return [];
      let _children = [];
      children.forEach(child => _children.push({}, child));
      _children.push({});
      // 最后生成 [E1, N1, E2, N2, E3, N3, E4]（其中 N 表示节点，E 表示空节点）
      return _children;
    },
    isParent() {
      // 拖放限制 1：判断“我”是否为被拖动节点的父节点
      return this === (this.value && this.value.$parent);
    },
    isNextToMe() {
      // 拖放限制 2：判断“我”是否为被拖动节点的相邻节点
      return (
        this.$parent === this.value &&
        this.value.$parent &&
        Math.abs(this.idx - this.value.idx) === 1
      );
    },
    isMeOrMyAncestor() {
      // 拖放限制 3：判断被拖动节点是否为“我”自身或“我”的祖先
      var p = this;
      while (p) {
        if (this.value === p) return true;
        p = p.$parent;
      }
    },
    isAllowToDrop() {
      // 上述拖放限制条件的综合
      return !(
        this.isParent ||
        this.isNextToMe ||
        this.isMeOrMyAncestor ||
        this.isDialogToComponents ||
        this.isComponentsToDialogsRoot ||
        this.isDialogNest
      );
    },
    isDialogNest() {
      //dialog不可作为其他组件的子组件
      return (
        (this.value.node.isDialog && !this.$parent.node.isRoot) ||
        (this.value.node.isDialog && this.node.name)
      );
    },
    isDialogToComponents() {
      //dialog不可移入“组件”Hierarchy里
      return this.type == "components" && this.value.node.isDialog;
    },
    isComponentsToDialogsRoot() {
      //普通组件不可作为“对话框”Hierarchy的根组件
      return (
        !this.node.name &&
        this.$parent.node.isRoot &&
        this.type == "dialogs" &&
        !this.value.node.isDialog
      );
    }
  },
  methods: {
    onMouseEnter(e) {
      if (!this.node.name) return;
      this.$store.commit("hoverMenuItem", { comObj: this.node });
    },
    onMouseLeave(e) {
      if (!this.node.name) return;
      this.$store.commit("hoverMenuItem", {});
    },
    clearBgColor() {
      // 清理样式
      this.$el.style.backgroundColor = "";
    },
    handleDragStart(ev) {
      if (this.idx === undefined) return;
      this.valueModel = this; // 设置本组件为当前正在拖动的实例，此举将同步 sync 到所有 TreeNode 实例
      ev.dataTransfer.effectAllowed = "move";
    },
    handleDrop() {
      this.clearBgColor(); // 此时 this 为目的地节点，vm 才是被拖动节点
      if (!this.isAllowToDrop) return;

      var dragParentNode = this.value.$parent.node;
      let dragIndex = dragParentNode.children.indexOf(this.value.node);

      // 情况 1：拖入空节点，成其兄弟（使用 splice 插入节点）
      if (!this.node.name) {
        let insertBeforeIndex = this.idx / 2;
        this.onDragEnd({
          drag: {
            p: dragParentNode,
            i: dragIndex
          },
          drop: {
            p: this.$parent.node,
            i: insertBeforeIndex
          }
        });
      } else {
        // 情况2：拖入普通节点，成为其子
        this.onDragEnd({
          drag: {
            p: dragParentNode,
            i: dragIndex
          },
          drop: {
            p: this.node,
            i: 0
          }
        });
      }
    },
    handleDragEnter() {
      // 允许拖放才会显示样式
      if (!this.isAllowToDrop) return;
      if (!this.node.name) {
        this.$el.style.backgroundColor = "#1ab394";
      } else {
        this.$el.style.backgroundColor = "rgba(26, 179, 148, 0.1)";
      }
    },
    handleDragLeave() {
      this.clearBgColor();
    },
    handleDragEnd() {
      this.clearBgColor();
    },
    onDragEnd(changeInfo) {
      if (typeof this.idx === "undefined") {
        this.$emit("on-change", changeInfo);
      } else {
        this.$parent && this.$parent.onDragEnd(changeInfo);
      }
    },
    onAddBtnClick(data) {
      if (typeof this.idx === "undefined") {
        this.$emit("on-add-btn-click", data);
      } else {
        this.$parent && this.$parent.onAddBtnClick(data);
      }
    },
    onEditBtnClick(data) {
      if (typeof this.idx === "undefined") {
        this.$emit("on-edit-btn-click", data);
      } else {
        this.$parent && this.$parent.onEditBtnClick(data);
      }
    },
    onCopyBtnClick(data) {
      if (typeof this.idx === "undefined") {
        this.$emit("on-copy-btn-click", data);
      } else {
        this.$parent && this.$parent.onCopyBtnClick(data);
      }
    },
    onDelBtnClick(data) {
      if (typeof this.idx === "undefined") {
        this.$emit("on-del-btn-click", data);
      } else {
        this.$parent && this.$parent.onDelBtnClick(data);
      }
    },
    onNodeNameClick(data) {
      if (typeof this.idx === "undefined") {
        this.$emit("on-node-name-click", data);
      } else {
        this.$parent && this.$parent.onNodeNameClick(data);
      }
    },
    onNodeRowClick(data) {
      if (typeof this.idx === "undefined") {
        this.$emit("on-node-row-click", data);
      } else {
        this.$parent && this.$parent.onNodeRowClick(data);
      }
    },
    onAddCom(data) {
      if (typeof this.idx === "undefined") {
        this.$emit("addCom", data);
      } else {
        this.$parent && this.$parent.onAddCom(data);
      }
    },
    emitEvent(type, data) {
      switch (type) {
        case "addCom":
          this.onAddCom(data);
          break; //{com,node}
        case "add":
          this.onAddBtnClick(this.node);
          break;
        case "edit":
          this.onEditBtnClick(this.node);
          break;
        case "copy":
          this.onCopyBtnClick(this.node);
          break;
        case "delete":
          this.onDelBtnClick(data);
          break;
        case "nodeRow":
          if (this.idx === undefined) return;
          this.onNodeRowClick(this.node);
          break;
        case "nodeName":
          this.hideChildren = !this.hideChildren;
          this.onNodeNameClick(this.node);
          break;
      }
    }
  }
};
</script>
<style lang="scss" scoped>
$color-primary: #1ab394;
$color-extra-light-black: #999;
.tree-node {
  /* 普通节点 */
  /*display: list-item;*/
  /*list-style: none;*/
  /*border-left: 1px dashed #ccc;*/
}
.tree-node.empty-node {
  /* 空节点 */
  height: 5px;
  list-style-type: none;
}
.tree-node-name.has-name {
  min-height: 16px;
  position: relative;
  &.idx_undefined {
    .tree-node-action {
      display: inline-block !important;
    }
  }
  .tree-node-action {
    margin-left: 15px;
    font-size: 14px;
    display: none;
    i {
      cursor: pointer;
      color: $color-primary;
      margin-right: 15px;
      &.el-icon-iconfont-tianjia {
        font-size: 16px !important;
      }
    }
  }
  &:hover:not(.idx_undefined) {
    .tree-node-action {
      display: inline-block;
      height: 14px;
    }
  }
  &:hover:not(.idx_undefined):not(.cur-select){
     background: rgba(26, 179, 148, 0.1);
    box-shadow: 0 2px 10px -2px rgba(26, 179, 148, 0.3);
  }
  .el-tree-node__label {
    margin-left: 5px;
    line-height: 28px;
  }
}
.el-icon-arrow-down,
.el-icon-arrow-up {
  line-height: 34px;
  &:before {
    font-size: 12px !important;
    color: $color-extra-light-black;
  }
}
.com-lib {
  width: 300px;
}
.com-lib-title{
    margin:0 0 10px 0;
  }
.com-lib-item {
  position: relative;
  display: inline-block;
  width: 75px;
  height: 75px;
  text-align: center;
  border-radius: 10px;
  word-wrap: break-word;
}
.com-lib-item-text{
  position: absolute;
  top:0;
  left:0;
  width: 100%;
  margin-top:50%;
  transform:translateY(-50%)
}
.com-lib-item:hover {
  background-color: whitesmoke;
}
.cur-select {
  background-color: lightgrey;
}
</style>