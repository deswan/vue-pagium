webpackJsonp([1],{

/***/ "+atQ":
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _stringify = __webpack_require__("hoiv");

var _stringify2 = _interopRequireDefault(_stringify);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

var id = 1000;
var fromData = '';
var toData = '';
var fromParentModelChildren = ''; // from 节点的父组件的model
var nodeClicked = undefined; // Attention: 递归的所有组件共享同一个＂顶级作用域＂（这个词或许不太正确，但就这个意思）．即：共享上面这几个let变量．这为实现当前节点的高亮提供了基础．

exports.default = {
    name: 'VueDragTreeCom42',
    data: function data() {
        return {
            open: false,
            isClicked: false,
            styleObj: {
                background: 'white'
            }
        };
    },
    props: {
        model: Object,
        'default-text': String, // 填加节点时显示的默认文本．
        'current-highlight': Boolean, // 当前节点高亮
        'hover-color': String,
        'highlight-color': String
    },
    computed: {
        isFolder: function isFolder() {
            return this.model.children && this.model.children.length;
        }
    },
    methods: {
        toggle: function toggle() {
            if (this.isFolder) {
                this.open = !this.open;
            }
            // 调用vue-drag-tree的父组件中的方法,以传递出当前被点击的节点的id值
            var rootTree = this.findRoot();
            //　API: 对外开放的当前被点击节点的信息
            rootTree.$parent.curNodeClicked(this.model, this);

            // 纪录节点被点击的状态
            this.isClicked = !this.isClicked;

            // 用户需要节点高亮？　-->　this.currentHighlight ? 高亮 : 不高亮
            if (this.currentHighlight) {
                // 第一次点击当前节点．当前节点高亮，遍历重置其他节点的样式
                if (nodeClicked != this.model.id) {
                    var treeParent = rootTree.$parent;

                    // 遍历重置所有树组件的高亮样式
                    var nodeStack = [treeParent.$children[0]];
                    while (nodeStack.length != 0) {
                        var item = nodeStack.shift();
                        item.styleObj.background = 'white';
                        if (item.$children && item.$children.length > 0) {
                            nodeStack = nodeStack.concat(item.$children);
                        }
                    }
                    // 然后把当前节点的样式设置为高亮
                    this.styleObj.background = this.highlightColor ? this.highlightColor : '#99A9BF';

                    // 设置为当前节点
                    nodeClicked = this.model.id;
                }
            }
        },
        exchangeData: function exchangeData(rootCom, from, to) {
            //如果drag的目的地是 + - 符号的话，退出。
            if (!to || !from || typeof to == 'string' || from.id == to.id) {
                return;
            }

            from = JSON.parse((0, _stringify2.default)(from));
            to = JSON.parse((0, _stringify2.default)(to));
            // copy一个,最后再赋值给state.treeData.这样能保证值的变化都会触发视图刷新(因为JS判断引用类型是否相同是根据内存地址.)
            var treeData = JSON.parse((0, _stringify2.default)(this.model));
            var nodeStack = [treeData];
            var status = 0;

            // 如果from或者to节点存在父子/祖辈关系，会报id of undefined的错。这种情况不考虑拖拽功能，所以catch住，返回/return就行
            try {
                // 广度优先遍历,找到涉及数据交换的两个对象.然后交换数据.
                while (!(status === 2)) {
                    var item = nodeStack.shift();
                    if (item.id == from.id) {
                        item.id = to.id;
                        item.name = to.name;
                        if (to.children && to.children.length > 0) {
                            item['children'] = to.children;
                        } else {
                            item.children = [];
                        }
                        status++;
                        //找到后,跳出当前循环.
                        continue;
                    }
                    if (item.id == to.id) {
                        item.id = from.id;
                        item.name = from.name;
                        if (from.children && from.children.length > 0) {
                            item['children'] = from.children;
                        } else {
                            item.children = [];
                        }
                        status++;
                        //找到后,跳出当前循环.
                        continue;
                    }
                    if (item.children && item.children.length > 0) {
                        nodeStack = nodeStack.concat(item.children);
                    }
                }
            } catch (e) {
                return;
            }
            //API: 对外开放交换后的数据的赋值操作
            rootCom.assignData(treeData);
        },
        changeType: function changeType() {
            // 用户需要高亮-->才纪录当前被点击节点
            if (this.currentHighlight) {
                nodeClicked = this.model.id;
            }
            if (!this.isFolder) {
                this.$set(this.model, 'children', []);
                this.addChild();
                this.open = true;
                this.isClicked = true;
            }
        },
        mouseOver: function mouseOver(e) {
            if ((this.styleObj.background != '#99A9BF' || this.styleObj.background != this.hightlightColor) && e.target.className === 'treeNodeText') {
                e.target.style.background = this.hoverColor ? this.hoverColor : '#E5E9F2';
            }
        },
        mouseOut: function mouseOut(e) {
            if ((this.styleObj.background != '#99A9BF' || this.styleObj.background != this.hightlightColor) && e.target.className === 'treeNodeText') {
                e.target.style.background = 'white';
            }
        },
        findRoot: function findRoot() {
            // 返回Tree的根,即递归Tree时的最顶层那个vue-drag-tree组件
            var ok = false;
            var that = this;
            while (!ok) {
                // 如果父组件有data属性，说明当前组件是Tree组件递归调用发生时的第一个组件。
                // Warning: 因为是判断data属性是否存在，所有在别人使用该组件时，属性名必须得是data
                // v1.0.9-update: add another judgement method.
                if (!/VueDragTreeCom42/.test(that.$parent.$vnode.tag) || that.$parent.data) {
                    ok = true;
                    // 交换两者的数据 
                    break;
                }
                that = that.$parent;
            }
            return that;
        },
        addChild: function addChild() {
            this.model.children.push({
                name: this.defaultText ? this.defaultText : 'New Node',
                id: id++
            });
        },
        removeChild: function removeChild(id) {
            // 获取父组件的model.children
            var parent_model_children = this.$parent.model.children;

            // 在父组件model.children里删除
            for (var index in parent_model_children) {
                // 找到该删的id
                if (parent_model_children[index].id == id) {
                    parent_model_children = parent_model_children.splice(index, 1);
                    break;
                }
            }
        },
        dragStart: function dragStart(e) {
            // fromData = this.model
            e.dataTransfer.effectAllowed = "move";
            e.dataTransfer.setData("nottext", e.target.innerHTML);
            return true;
        },
        dragEnd: function dragEnd(e) {
            fromData = undefined;
            toData = undefined;
            fromParentModelChildren = undefined;
        },
        dragOver: function dragOver(e) {
            e.preventDefault();
            return true;
        },
        dragOverPlus: function dragOverPlus(e) {
            e.preventDefault();
        },
        dragEnterPlus: function dragEnterPlus(e) {},
        dragEnter: function dragEnter(e) {
            toData = this.model;
            var rootTree = this.findRoot();
            rootTree.exchangeData(rootTree.$parent, fromData, toData);
        },
        dragLeave: function dragLeave(e) {
            fromData = this.model;
            fromParentModelChildren = this.$parent.model.children;
            // e.target.style.background = '#7B1FA2'
        },
        drop: function drop(e) {
            // toData = this.model
            // e.target.style.background = '#7B1FA2'
        },
        dropPlus: function dropPlus(e) {
            // 把from节点插入到当前层级节点的最后一个
            if (this.model.hasOwnProperty('children')) {
                this.model.children.push(fromData);
            } else {
                this.model.children = [fromData];
            }

            // 把from节点从之前的节点删除
            for (var i in fromParentModelChildren) {
                if (fromParentModelChildren[i].id == fromData.id) {
                    fromParentModelChildren.splice(i, 1);
                }
            }
        }
    },
    beforeCreate: function beforeCreate() {
        this.$options.components.item = __webpack_require__("vmF+");
    },
    created: function created() {
        // console.log('this.hig', this.highlightColor, '|', this.hoverColor)
    }
};

/***/ }),

/***/ "+uoL":
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__("DF/m");
if(typeof content === 'string') content = [[module.i, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var update = __webpack_require__("pFN4")("75ca21bd", content, false, {});
// Hot Module Replacement
if(false) {
 // When the styles change, update the <style> tags
 if(!content.locals) {
   module.hot.accept("!!../../../node_modules/css-loader/index.js?{\"sourceMap\":true}!../../../node_modules/vue-loader/lib/style-compiler/index.js?{\"vue\":true,\"id\":\"data-v-25e57fc6\",\"scoped\":true,\"hasInlineConfig\":false}!../../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./select.vue", function() {
     var newContent = require("!!../../../node_modules/css-loader/index.js?{\"sourceMap\":true}!../../../node_modules/vue-loader/lib/style-compiler/index.js?{\"vue\":true,\"id\":\"data-v-25e57fc6\",\"scoped\":true,\"hasInlineConfig\":false}!../../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./select.vue");
     if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
     update(newContent);
   });
 }
 // When the module is disposed, remove the <style> tags
 module.hot.dispose(function() { update(); });
}

/***/ }),

/***/ "/NW1":
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__("Vmy+")(true);
// imports


// module
exports.push([module.i, "\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n", "", {"version":3,"sources":[],"names":[],"mappings":"","file":"refer-component.vue","sourceRoot":""}]);

// exports


/***/ }),

/***/ "012k":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_number_vue__ = __webpack_require__("uB5r");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_number_vue___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_number_vue__);
/* harmony namespace reexport (unknown) */ for(var __WEBPACK_IMPORT_KEY__ in __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_number_vue__) if(__WEBPACK_IMPORT_KEY__ !== 'default') (function(key) { __webpack_require__.d(__webpack_exports__, key, function() { return __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_number_vue__[key]; }) }(__WEBPACK_IMPORT_KEY__));
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_78ea8f26_hasScoped_false_transformToRequire_video_src_poster_source_src_img_src_image_xlink_href_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_number_vue__ = __webpack_require__("DEzI");
var disposed = false
var normalizeComponent = __webpack_require__("mUJo")
/* script */


/* template */

/* template functional */
var __vue_template_functional__ = false
/* styles */
var __vue_styles__ = null
/* scopeId */
var __vue_scopeId__ = null
/* moduleIdentifier (server only) */
var __vue_module_identifier__ = null
var Component = normalizeComponent(
  __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_number_vue___default.a,
  __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_78ea8f26_hasScoped_false_transformToRequire_video_src_poster_source_src_img_src_image_xlink_href_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_number_vue__["a" /* default */],
  __vue_template_functional__,
  __vue_styles__,
  __vue_scopeId__,
  __vue_module_identifier__
)
Component.options.__file = "type_parser/number/number.vue"

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-78ea8f26", Component.options)
  } else {
    hotAPI.reload("data-v-78ea8f26", Component.options)
  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

/* harmony default export */ __webpack_exports__["default"] = (Component.exports);


/***/ }),

/***/ "0NhW":
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _Hierarchy = __webpack_require__("va7i");

var _Hierarchy2 = _interopRequireDefault(_Hierarchy);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = {
  components: {
    HierarchyTree: _Hierarchy2.default
  },
  data: function data() {
    return {
      data_com: {},
      data_dialog: {},
      draggingNode: null
    };
  },
  created: function created() {
    this.data_com = {
      name: "组件",
      subCom: this.$store.getters.components,
      isRoot: true
    };
    this.data_dialog = {
      name: "对话框",
      subCom: this.$store.getters.dialogs,
      isRoot: true
    };
  },

  methods: {
    nodeChange: function nodeChange(e) {
      this.$store.commit("nodeChange", e);
    },
    nodeClick: function nodeClick(comObj) {
      this.$store.commit("activateComponent", { comObj: comObj });
    },
    delCom: function delCom(root, node) {
      this.$store.commit("delComponent", { list: root, node: node });
    },
    addCom: function addCom(_ref) {
      var comType = _ref.comType,
          node = _ref.node;

      this.$store.commit("addComponent", { node: node, comType: comType });
    }
  }
}; //
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

/***/ }),

/***/ "0Rvm":
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
//
//
//
//
//
//
//
//
//
//
//

exports.default = {
  name: "pgCom",
  props: {
    comObj: {
      required: true
    }
  },
  computed: {
    subActive: function subActive() {
      return find(this.comObj.subCom, this.$store.state.activeComponent);
      function find(list, node) {
        if (!list) return false;
        return list.some(function (e) {
          if (e.pg === node.pg) {
            return true;
          } else {
            return find(e.subCom, node);
          }
        });
      }
    }
  },
  created: function created() {},
  data: function data() {
    return {};
  }
};

/***/ }),

/***/ "0niv":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c("el-input", {
    attrs: { size: _vm.size },
    on: { change: _vm.valChange },
    model: {
      value: _vm.input,
      callback: function($$v) {
        _vm.input = $$v
      },
      expression: "input"
    }
  })
}
var staticRenderFns = []
render._withStripped = true
var esExports = { render: render, staticRenderFns: staticRenderFns }
/* harmony default export */ __webpack_exports__["a"] = (esExports);
if (false) {
  module.hot.accept()
  if (module.hot.data) {
    require("vue-hot-reload-api")      .rerender("data-v-3eccc3b4", esExports)
  }
}

/***/ }),

/***/ "119C":
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__("1XGB");
if(typeof content === 'string') content = [[module.i, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var update = __webpack_require__("pFN4")("b144f098", content, false, {});
// Hot Module Replacement
if(false) {
 // When the styles change, update the <style> tags
 if(!content.locals) {
   module.hot.accept("!!../../../../node_modules/css-loader/index.js?{\"sourceMap\":true}!../../../../node_modules/vue-loader/lib/style-compiler/index.js?{\"vue\":true,\"id\":\"data-v-a888106c\",\"scoped\":true,\"hasInlineConfig\":false}!../../../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./SettingBoard.vue", function() {
     var newContent = require("!!../../../../node_modules/css-loader/index.js?{\"sourceMap\":true}!../../../../node_modules/vue-loader/lib/style-compiler/index.js?{\"vue\":true,\"id\":\"data-v-a888106c\",\"scoped\":true,\"hasInlineConfig\":false}!../../../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./SettingBoard.vue");
     if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
     update(newContent);
   });
 }
 // When the module is disposed, remove the <style> tags
 module.hot.dispose(function() { update(); });
}

/***/ }),

/***/ "1EeX":
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__("jIOo");
if(typeof content === 'string') content = [[module.i, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var update = __webpack_require__("pFN4")("f41b286e", content, false, {});
// Hot Module Replacement
if(false) {
 // When the styles change, update the <style> tags
 if(!content.locals) {
   module.hot.accept("!!../../../node_modules/css-loader/index.js?{\"sourceMap\":true}!../../../node_modules/vue-loader/lib/style-compiler/index.js?{\"vue\":true,\"id\":\"data-v-272f7ccc\",\"scoped\":true,\"hasInlineConfig\":false}!../../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./Tag.vue", function() {
     var newContent = require("!!../../../node_modules/css-loader/index.js?{\"sourceMap\":true}!../../../node_modules/vue-loader/lib/style-compiler/index.js?{\"vue\":true,\"id\":\"data-v-272f7ccc\",\"scoped\":true,\"hasInlineConfig\":false}!../../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./Tag.vue");
     if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
     update(newContent);
   });
 }
 // When the module is disposed, remove the <style> tags
 module.hot.dispose(function() { update(); });
}

/***/ }),

/***/ "1XGB":
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__("Vmy+")(true);
// imports


// module
exports.push([module.i, "\n.setting[data-v-a888106c] {\n  padding: 20px 30px 100px;\n  width: 400px;\n  background: white;\n  position: fixed;\n  right: 0;\n  top: 60px;\n  height: 100%;\n  overflow: auto;\n}\n.setting[data-v-a888106c]::-webkit-scrollbar {\n  display: none;\n}\n", "", {"version":3,"sources":["/Users/wang/vue-element-page-generator/src/gui/Create/SettingBoard/Create/SettingBoard/SettingBoard.vue"],"names":[],"mappings":";AAwDA;EACA,yBAAA;EACA,aAAA;EACA,kBAAA;EACA,gBAAA;EACA,SAAA;EACA,UAAA;EACA,aAAA;EACA,eAAA;CACA;AACA;EACA,cAAA;CACA","file":"SettingBoard.vue","sourcesContent":["<template>\n  <div class=\"setting\">\n      <el-form label-suffix=\":\" v-if=\"$store.state.activeComponent\" :key=\"$store.state.activeComponent.pg\" label-position=\"left\"  label-width=\"80px\">\n        <el-form-item label=\"组件名称\">\n            <component :is=\"StringInput\" name=\"name\" @input=\"handleInput('name',$event)\" :value=\"$store.state.activeComponent.props['name']\"></component>\n        </el-form-item>\n        <template v-for=\"(item,idx) in $store.getters.activeComponentSetting\" >\n          <el-form-item \n          :label=\"item.label\" \n          :key=\"idx\">\n              <!-- 输入组件\n                arrItem: 数组默认值            \n               -->\n              <component \n              :is=\"item.input\" \n              @input=\"handleInput(item.name,$event)\" \n              :arrItem=\"$store.state.activeComponent.props['_'+item.name]\"\n              :value=\"$store.state.activeComponent.props[item.name]\" \n              v-bind=\"item.props\" \n              :conf=\"item.conf\">\n              </component>\n          </el-form-item>\n          <!-- Boolean.on -->\n          <div class=\"expand\" :key=\"idx + 'expand'\" v-if=\"item.props.subInput && item.props.subInput.length && $store.state.activeComponent.props[item.name]\">\n              <el-form-item v-for=\"(subInput,idx) in item.props.subInput\" :label=\"subInput.label\" :key=\"idx\">\n                <component \n                :is=\"subInput.input\" \n                @input=\"handleInput(subInput.name,$event)\" \n                :arrItem=\"$store.state.activeComponent.props['_'+subInput.name]\" \n                :value=\"$store.state.activeComponent.props[subInput.name]\" \n                v-bind=\"subInput.props\" \n                :conf=\"subInput.conf\">\n                </component>\n              </el-form-item>            \n          </div>\n        </template>\n      </el-form>\n  </div>\n</template>\n\n<script>\nimport StringInput from \"../../../type_parser/string/string.vue\";\nexport default {\n  data() {\n    return {\n      StringInput\n    };\n  },\n  methods: {\n    handleInput(name, value) {\n      this.$store.commit(\"input\", { name, value });\n    }\n  }\n};\n</script>\n\n<style scoped>\n.setting {\n  padding: 20px 30px 100px;\n  width: 400px;\n  background: white;\n  position: fixed;\n  right: 0;\n  top: 60px;\n  height: 100%;\n  overflow: auto;\n}\n.setting::-webkit-scrollbar {\n  display: none;\n}\n</style>\n"],"sourceRoot":""}]);

// exports


/***/ }),

/***/ "22Ya":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_Templates_vue__ = __webpack_require__("W7Vb");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_Templates_vue___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_Templates_vue__);
/* harmony namespace reexport (unknown) */ for(var __WEBPACK_IMPORT_KEY__ in __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_Templates_vue__) if(__WEBPACK_IMPORT_KEY__ !== 'default') (function(key) { __webpack_require__.d(__webpack_exports__, key, function() { return __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_Templates_vue__[key]; }) }(__WEBPACK_IMPORT_KEY__));
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_7077c805_hasScoped_true_transformToRequire_video_src_poster_source_src_img_src_image_xlink_href_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_Templates_vue__ = __webpack_require__("4/T3");
var disposed = false
function injectStyle (ssrContext) {
  if (disposed) return
  __webpack_require__("sKOe")
}
var normalizeComponent = __webpack_require__("mUJo")
/* script */


/* template */

/* template functional */
var __vue_template_functional__ = false
/* styles */
var __vue_styles__ = injectStyle
/* scopeId */
var __vue_scopeId__ = "data-v-7077c805"
/* moduleIdentifier (server only) */
var __vue_module_identifier__ = null
var Component = normalizeComponent(
  __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_Templates_vue___default.a,
  __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_7077c805_hasScoped_true_transformToRequire_video_src_poster_source_src_img_src_image_xlink_href_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_Templates_vue__["a" /* default */],
  __vue_template_functional__,
  __vue_styles__,
  __vue_scopeId__,
  __vue_module_identifier__
)
Component.options.__file = "Templates/Templates.vue"

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-7077c805", Component.options)
  } else {
    hotAPI.reload("data-v-7077c805", Component.options)
  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

/* harmony default export */ __webpack_exports__["default"] = (Component.exports);


/***/ }),

/***/ "2O6T":
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _vue = __webpack_require__("X9e9");

var _vue2 = _interopRequireDefault(_vue);

var _elementUi = __webpack_require__("HkdF");

var _elementUi2 = _interopRequireDefault(_elementUi);

__webpack_require__("k1P6");

var _App = __webpack_require__("30p7");

var _App2 = _interopRequireDefault(_App);

var _store = __webpack_require__("vdRI");

var _store2 = _interopRequireDefault(_store);

var _vueDragTree = __webpack_require__("vmF+");

var _vueDragTree2 = _interopRequireDefault(_vueDragTree);

var _axios = __webpack_require__("uj17");

var _axios2 = _interopRequireDefault(_axios);

__webpack_require__("vi+0");

var _router = __webpack_require__("rSE8");

var _router2 = _interopRequireDefault(_router);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_vue2.default.component('vue-drag-tree', _vueDragTree2.default);
_vue2.default.use(_elementUi2.default);
_vue2.default.prototype.$http = _axios2.default;

new _vue2.default({
  el: '#app',
  store: _store2.default,
  router: _router2.default,
  render: function render(h) {
    return h(_App2.default);
  }
});

/***/ }),

/***/ "2UTb":
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
//
//
//
//
//

exports.default = {
  name: "Input",
  props: ["label", "size", "type", "placeholder", "clearable", "disabled", "prefixIcon", "suffixIcon", "rows", "autosize", "name", "readonly", "autofocus"],
  data: function data() {
    return {};
  }
};

/***/ }),

/***/ "2YwJ":
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
//
//
//

exports.default = {
  name: 'Button',
  props: ['size', 'type', 'plain', 'round', 'disabled', 'icon', 'title'],
  data: function data() {
    return {};
  }
};

/***/ }),

/***/ "2qJO":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c(
    "div",
    { attrs: { id: "app" } },
    [
      _c(
        "div",
        { staticClass: "header" },
        [
          _c(
            "el-menu",
            {
              attrs: {
                "default-active": "1",
                mode: "horizontal",
                "background-color": "#545c64",
                "text-color": "#fff",
                "active-text-color": "#ffd04b",
                router: ""
              }
            },
            [
              _c("el-menu-item", { attrs: { index: "/" } }, [_vm._v("模板")]),
              _vm._v(" "),
              _c("el-menu-item", { attrs: { index: "/create" } }, [
                _vm._v("编辑页面")
              ])
            ],
            1
          )
        ],
        1
      ),
      _vm._v(" "),
      _c("router-view")
    ],
    1
  )
}
var staticRenderFns = []
render._withStripped = true
var esExports = { render: render, staticRenderFns: staticRenderFns }
/* harmony default export */ __webpack_exports__["a"] = (esExports);
if (false) {
  module.hot.accept()
  if (module.hot.data) {
    require("vue-hot-reload-api")      .rerender("data-v-472cff63", esExports)
  }
}

/***/ }),

/***/ "30p7":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_App_vue__ = __webpack_require__("wtlx");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_App_vue___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_App_vue__);
/* harmony namespace reexport (unknown) */ for(var __WEBPACK_IMPORT_KEY__ in __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_App_vue__) if(__WEBPACK_IMPORT_KEY__ !== 'default') (function(key) { __webpack_require__.d(__webpack_exports__, key, function() { return __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_App_vue__[key]; }) }(__WEBPACK_IMPORT_KEY__));
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_472cff63_hasScoped_false_transformToRequire_video_src_poster_source_src_img_src_image_xlink_href_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_App_vue__ = __webpack_require__("2qJO");
var disposed = false
function injectStyle (ssrContext) {
  if (disposed) return
  __webpack_require__("JhZg")
}
var normalizeComponent = __webpack_require__("mUJo")
/* script */


/* template */

/* template functional */
var __vue_template_functional__ = false
/* styles */
var __vue_styles__ = injectStyle
/* scopeId */
var __vue_scopeId__ = null
/* moduleIdentifier (server only) */
var __vue_module_identifier__ = null
var Component = normalizeComponent(
  __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_App_vue___default.a,
  __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_472cff63_hasScoped_false_transformToRequire_video_src_poster_source_src_img_src_image_xlink_href_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_App_vue__["a" /* default */],
  __vue_template_functional__,
  __vue_styles__,
  __vue_scopeId__,
  __vue_module_identifier__
)
Component.options.__file = "App.vue"

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-472cff63", Component.options)
  } else {
    hotAPI.reload("data-v-472cff63", Component.options)
  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

/* harmony default export */ __webpack_exports__["default"] = (Component.exports);


/***/ }),

/***/ "4/T3":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c(
    "div",
    { staticClass: "template-list" },
    [
      _c("el-button", { attrs: { type: "primary" } }, [_vm._v("新建页面")]),
      _vm._v(" "),
      _c(
        "el-table",
        {
          staticStyle: { "margin-top": "10px" },
          attrs: { data: _vm.table.items }
        },
        [
          _c("el-table-column", {
            attrs: { prop: "date", label: "创建日期", width: "180" }
          }),
          _vm._v(" "),
          _c("el-table-column", {
            attrs: { prop: "name", label: "模板名称", width: "180" }
          }),
          _vm._v(" "),
          _c("el-table-column", { attrs: { prop: "remark", label: "备注" } }),
          _vm._v(" "),
          _c("el-table-column", {
            attrs: { label: "操作" },
            scopedSlots: _vm._u([
              {
                key: "default",
                fn: function(scope) {
                  return [
                    _c("el-button", { attrs: { size: "small" } }, [
                      _vm._v("生成页面")
                    ]),
                    _vm._v(" "),
                    _c(
                      "el-button",
                      { attrs: { size: "small", type: "warning" } },
                      [_vm._v("删除模板")]
                    )
                  ]
                }
              }
            ])
          })
        ],
        1
      )
    ],
    1
  )
}
var staticRenderFns = []
render._withStripped = true
var esExports = { render: render, staticRenderFns: staticRenderFns }
/* harmony default export */ __webpack_exports__["a"] = (esExports);
if (false) {
  module.hot.accept()
  if (module.hot.data) {
    require("vue-hot-reload-api")      .rerender("data-v-7077c805", esExports)
  }
}

/***/ }),

/***/ "4IRE":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c(
    "div",
    { staticClass: "toolbox" },
    [
      _c("hierarchy-tree", {
        staticClass: "hierarchy",
        attrs: {
          node: _vm.data_com,
          "all-coms": _vm.$store.getters.allComsType,
          type: "components"
        },
        on: {
          "on-node-row-click": _vm.nodeClick,
          addCom: _vm.addCom,
          "on-change": _vm.nodeChange,
          "on-del-btn-click": function($event) {
            _vm.delCom(_vm.data_com, $event)
          }
        },
        model: {
          value: _vm.draggingNode,
          callback: function($$v) {
            _vm.draggingNode = $$v
          },
          expression: "draggingNode"
        }
      }),
      _vm._v(" "),
      _c("hierarchy-tree", {
        staticClass: "hierarchy",
        attrs: {
          node: _vm.data_dialog,
          "all-coms": _vm.$store.getters.allDialogsType,
          type: "dialogs"
        },
        on: {
          "on-node-row-click": _vm.nodeClick,
          addCom: _vm.addCom,
          "on-change": _vm.nodeChange,
          "on-del-btn-click": function($event) {
            _vm.delCom(_vm.data_dialog, $event)
          }
        },
        model: {
          value: _vm.draggingNode,
          callback: function($$v) {
            _vm.draggingNode = $$v
          },
          expression: "draggingNode"
        }
      })
    ],
    1
  )
}
var staticRenderFns = []
render._withStripped = true
var esExports = { render: render, staticRenderFns: staticRenderFns }
/* harmony default export */ __webpack_exports__["a"] = (esExports);
if (false) {
  module.hot.accept()
  if (module.hot.data) {
    require("vue-hot-reload-api")      .rerender("data-v-4259cc0a", esExports)
  }
}

/***/ }),

/***/ "4SEc":
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__("Vmy+")(true);
// imports


// module
exports.push([module.i, "\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n", "", {"version":3,"sources":[],"names":[],"mappings":"","file":"Input.vue","sourceRoot":""}]);

// exports


/***/ }),

/***/ "5RBz":
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__("Vmy+")(true);
// imports


// module
exports.push([module.i, "\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n", "", {"version":3,"sources":[],"names":[],"mappings":"","file":"slot-component.vue","sourceRoot":""}]);

// exports


/***/ }),

/***/ "5txc":
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__("Vmy+")(true);
// imports


// module
exports.push([module.i, "\n\n\n\n\n\n\n\n\n\n\n\n\n\n", "", {"version":3,"sources":[],"names":[],"mappings":"","file":"Button.vue","sourceRoot":""}]);

// exports


/***/ }),

/***/ "6ull":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_Button_vue__ = __webpack_require__("2YwJ");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_Button_vue___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_Button_vue__);
/* harmony namespace reexport (unknown) */ for(var __WEBPACK_IMPORT_KEY__ in __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_Button_vue__) if(__WEBPACK_IMPORT_KEY__ !== 'default') (function(key) { __webpack_require__.d(__webpack_exports__, key, function() { return __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_Button_vue__[key]; }) }(__WEBPACK_IMPORT_KEY__));
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_ca73f7b8_hasScoped_true_transformToRequire_video_src_poster_source_src_img_src_image_xlink_href_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_Button_vue__ = __webpack_require__("lfoz");
var disposed = false
function injectStyle (ssrContext) {
  if (disposed) return
  __webpack_require__("sM2O")
}
var normalizeComponent = __webpack_require__("mUJo")
/* script */


/* template */

/* template functional */
var __vue_template_functional__ = false
/* styles */
var __vue_styles__ = injectStyle
/* scopeId */
var __vue_scopeId__ = "data-v-ca73f7b8"
/* moduleIdentifier (server only) */
var __vue_module_identifier__ = null
var Component = normalizeComponent(
  __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_Button_vue___default.a,
  __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_ca73f7b8_hasScoped_true_transformToRequire_video_src_poster_source_src_img_src_image_xlink_href_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_Button_vue__["a" /* default */],
  __vue_template_functional__,
  __vue_styles__,
  __vue_scopeId__,
  __vue_module_identifier__
)
Component.options.__file = "Components/Button/Button.vue"

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-ca73f7b8", Component.options)
  } else {
    hotAPI.reload("data-v-ca73f7b8", Component.options)
  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

/* harmony default export */ __webpack_exports__["default"] = (Component.exports);


/***/ }),

/***/ "7CZV":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_slot_component_vue__ = __webpack_require__("Mtp0");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_slot_component_vue___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_slot_component_vue__);
/* harmony namespace reexport (unknown) */ for(var __WEBPACK_IMPORT_KEY__ in __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_slot_component_vue__) if(__WEBPACK_IMPORT_KEY__ !== 'default') (function(key) { __webpack_require__.d(__webpack_exports__, key, function() { return __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_slot_component_vue__[key]; }) }(__WEBPACK_IMPORT_KEY__));
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_ddc4c6f4_hasScoped_true_transformToRequire_video_src_poster_source_src_img_src_image_xlink_href_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_slot_component_vue__ = __webpack_require__("Z4LF");
var disposed = false
function injectStyle (ssrContext) {
  if (disposed) return
  __webpack_require__("T6oC")
}
var normalizeComponent = __webpack_require__("mUJo")
/* script */


/* template */

/* template functional */
var __vue_template_functional__ = false
/* styles */
var __vue_styles__ = injectStyle
/* scopeId */
var __vue_scopeId__ = "data-v-ddc4c6f4"
/* moduleIdentifier (server only) */
var __vue_module_identifier__ = null
var Component = normalizeComponent(
  __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_slot_component_vue___default.a,
  __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_ddc4c6f4_hasScoped_true_transformToRequire_video_src_poster_source_src_img_src_image_xlink_href_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_slot_component_vue__["a" /* default */],
  __vue_template_functional__,
  __vue_styles__,
  __vue_scopeId__,
  __vue_module_identifier__
)
Component.options.__file = "type_parser/slot-component/slot-component.vue"

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-ddc4c6f4", Component.options)
  } else {
    hotAPI.reload("data-v-ddc4c6f4", Component.options)
  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

/* harmony default export */ __webpack_exports__["default"] = (Component.exports);


/***/ }),

/***/ "7kUT":
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__("Vmy+")(true);
// imports


// module
exports.push([module.i, "\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n", "", {"version":3,"sources":[],"names":[],"mappings":"","file":"Table.vue","sourceRoot":""}]);

// exports


/***/ }),

/***/ "7n1y":
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
//
//
//
//
//
//
//

exports.default = {
  name: 'Table',
  props: ['cols', 'active'],
  data: function data() {
    return {
      data: ['', '', '']
    };
  },
  created: function created() {},

  methods: {},
  watch: {
    cols: function cols() {}
  }
};

/***/ }),

/***/ "7skA":
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__("Vmy+")(true);
// imports


// module
exports.push([module.i, "\n.toolbox[data-v-4259cc0a] {\n  position: fixed;\n  width: 200px;\n  background: #eeeeee;\n  left: 0;\n  top: 60px;\n  padding: 20px 0 0;\n  height: 100%;\n  user-select: none;\n  text-align: left;\n  z-index: 999;\n}\n.add-btn[data-v-4259cc0a] {\n  margin-left: 10px;\n}\n", "", {"version":3,"sources":["/Users/wang/vue-element-page-generator/src/gui/Create/Tool/Create/Tool/Tool.vue"],"names":[],"mappings":";AA0EA;EACA,gBAAA;EACA,aAAA;EACA,oBAAA;EACA,QAAA;EACA,UAAA;EACA,kBAAA;EACA,aAAA;EACA,kBAAA;EACA,iBAAA;EACA,aAAA;CACA;AAEA;EACA,kBAAA;CACA","file":"Tool.vue","sourcesContent":["<template>\n  <div class=\"toolbox\">\n      <hierarchy-tree \n      @on-node-row-click=\"nodeClick\" \n      v-model=\"draggingNode\" \n      :node=\"data_com\" \n      :all-coms=\"$store.getters.allComsType\" \n      class=\"hierarchy\" \n      @addCom=\"addCom\" \n      @on-change=\"nodeChange\"\n      @on-del-btn-click=\"delCom(data_com,$event)\"\n      type=\"components\"\n      >\n      </hierarchy-tree>      \n\n      <hierarchy-tree \n      @on-node-row-click=\"nodeClick\"  \n      v-model=\"draggingNode\" \n      :node=\"data_dialog\" \n      :all-coms=\"$store.getters.allDialogsType\" \n      class=\"hierarchy\" \n      @addCom=\"addCom\" \n      @on-change=\"nodeChange\"\n      @on-del-btn-click=\"delCom(data_dialog,$event)\"\n      type=\"dialogs\"\n      >\n      </hierarchy-tree> \n  </div>\n</template>\n\n<script>\n\nimport Hierarchy from \"./Hierarchy\";\n\nexport default {\n  components: {\n    HierarchyTree: Hierarchy\n  },\n  data() {\n    return {\n      data_com: {},\n      data_dialog: {},\n      draggingNode: null\n    };\n  },\n  created() {\n    this.data_com = {\n      name: \"组件\",\n      subCom: this.$store.getters.components,\n      isRoot: true\n    };\n    this.data_dialog = {\n      name: \"对话框\",\n      subCom: this.$store.getters.dialogs,\n      isRoot: true\n    };\n  },\n  methods: {\n    nodeChange(e) {\n      this.$store.commit(\"nodeChange\", e);\n    },\n    nodeClick(comObj) {\n      this.$store.commit(\"activateComponent\", { comObj });\n    },\n    delCom(root, node) {\n      this.$store.commit(\"delComponent\", { list: root, node });\n    },\n    addCom({ comType, node }) {\n      this.$store.commit(\"addComponent\", { node, comType });\n    }\n  }\n};\n</script>\n\n<style scoped>\n.toolbox {\n  position: fixed;\n  width: 200px;\n  background: #eeeeee;\n  left: 0;\n  top: 60px;\n  padding: 20px 0 0;\n  height: 100%;\n  user-select: none;\n  text-align: left;\n  z-index: 999;\n}\n\n.add-btn {\n  margin-left: 10px;\n}\n</style>\n"],"sourceRoot":""}]);

// exports


/***/ }),

/***/ "8OWv":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_refer_component_vue__ = __webpack_require__("nsKq");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_refer_component_vue___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_refer_component_vue__);
/* harmony namespace reexport (unknown) */ for(var __WEBPACK_IMPORT_KEY__ in __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_refer_component_vue__) if(__WEBPACK_IMPORT_KEY__ !== 'default') (function(key) { __webpack_require__.d(__webpack_exports__, key, function() { return __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_refer_component_vue__[key]; }) }(__WEBPACK_IMPORT_KEY__));
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_2777b368_hasScoped_true_transformToRequire_video_src_poster_source_src_img_src_image_xlink_href_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_refer_component_vue__ = __webpack_require__("E1zk");
var disposed = false
function injectStyle (ssrContext) {
  if (disposed) return
  __webpack_require__("Ssu4")
}
var normalizeComponent = __webpack_require__("mUJo")
/* script */


/* template */

/* template functional */
var __vue_template_functional__ = false
/* styles */
var __vue_styles__ = injectStyle
/* scopeId */
var __vue_scopeId__ = "data-v-2777b368"
/* moduleIdentifier (server only) */
var __vue_module_identifier__ = null
var Component = normalizeComponent(
  __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_refer_component_vue___default.a,
  __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_2777b368_hasScoped_true_transformToRequire_video_src_poster_source_src_img_src_image_xlink_href_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_refer_component_vue__["a" /* default */],
  __vue_template_functional__,
  __vue_styles__,
  __vue_scopeId__,
  __vue_module_identifier__
)
Component.options.__file = "type_parser/refer-component/refer-component.vue"

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-2777b368", Component.options)
  } else {
    hotAPI.reload("data-v-2777b368", Component.options)
  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

/* harmony default export */ __webpack_exports__["default"] = (Component.exports);


/***/ }),

/***/ "8rDQ":
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
//
//
//
//
//

exports.default = {
  name: "Form",
  props: ["inline", "labelPosition", "labelWidth", "labelSuffix", "statusIcon", "size"],
  data: function data() {
    return {
      form: {}
    };
  },
  created: function created() {},

  methods: {}
};

/***/ }),

/***/ "9K0A":
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.hasError = exports.input = undefined;

var _slotComponent = __webpack_require__("7CZV");

var _slotComponent2 = _interopRequireDefault(_slotComponent);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var hasError = function hasError(conf) {};

var input = {
    component: _slotComponent2.default,
    propsLoader: function propsLoader(conf) {
        return {};
    }
};

exports.input = input;
exports.hasError = hasError;

/***/ }),

/***/ "A/U0":
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.hasError = exports.input = undefined;

var _boolean = __webpack_require__("enBu");

var _boolean2 = _interopRequireDefault(_boolean);

var _scheme2Input = __webpack_require__("noFo");

var _scheme2Input2 = _interopRequireDefault(_scheme2Input);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var hasError = function hasError(conf) {};

var input = {
    component: _boolean2.default,
    propsLoader: function propsLoader(conf) {
        return {
            subInput: conf.on && (0, _scheme2Input2.default)(conf.on)
        };
    }
};

exports.input = input;
exports.hasError = hasError;

/***/ }),

/***/ "BKqd":
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = {
    "name": 'input',
    "props": [{
        "name": "label",
        "label": "label",
        "value": "string"
    }, {
        "name": "required",
        "label": "required",
        "value": "boolean"
    }, {
        "name": "width",
        "label": "宽度",
        "value": "string"
    }, {
        "name": "size",
        "label": "尺寸",
        "value": "select",
        "options": ["medium", "small", "mini"]
    }, {
        "name": "type",
        "label": "类型",
        "value": "select",
        "default": "text",
        "options": ["text", "textarea"]
    }, {
        "name": "placeholder",
        "label": "placeholder",
        "value": "string"
    }, {
        "name": "clearable",
        "label": "是否可清空",
        "value": "boolean"
    }, {
        "name": "disabled",
        "label": "禁用",
        "value": "boolean"
    }, {
        "name": "prefixIcon",
        "label": "输入框头部图标",
        "value": "string"
    }, {
        "name": "suffixIcon",
        "label": "输入框尾部图标",
        "value": "string"
    }, {
        "name": "rows",
        "label": "输入框行数，只对 type=\"textarea\" 有效",
        "value": "number"
    }, {
        "name": "autosize",
        "label": "自适应内容高度，只对 type=\"textarea\" 有效",
        "value": "string"
    }, {
        "name": "autoComplete",
        "label": "自动补全",
        "value": "boolean"
    }, {
        "name": "name",
        "label": "name",
        "value": "string"
    }, {
        "name": "readonly",
        "label": "readonly",
        "value": "boolean"
    }, {
        "name": "autofocus",
        "label": "autofocus",
        "value": "boolean"
    }]
};

/***/ }),

/***/ "BoSz":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_Breadcrumb_vue__ = __webpack_require__("PTys");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_Breadcrumb_vue___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_Breadcrumb_vue__);
/* harmony namespace reexport (unknown) */ for(var __WEBPACK_IMPORT_KEY__ in __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_Breadcrumb_vue__) if(__WEBPACK_IMPORT_KEY__ !== 'default') (function(key) { __webpack_require__.d(__webpack_exports__, key, function() { return __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_Breadcrumb_vue__[key]; }) }(__WEBPACK_IMPORT_KEY__));
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_3fbdf404_hasScoped_true_transformToRequire_video_src_poster_source_src_img_src_image_xlink_href_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_Breadcrumb_vue__ = __webpack_require__("FxCM");
var disposed = false
function injectStyle (ssrContext) {
  if (disposed) return
  __webpack_require__("zqVg")
}
var normalizeComponent = __webpack_require__("mUJo")
/* script */


/* template */

/* template functional */
var __vue_template_functional__ = false
/* styles */
var __vue_styles__ = injectStyle
/* scopeId */
var __vue_scopeId__ = "data-v-3fbdf404"
/* moduleIdentifier (server only) */
var __vue_module_identifier__ = null
var Component = normalizeComponent(
  __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_Breadcrumb_vue___default.a,
  __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_3fbdf404_hasScoped_true_transformToRequire_video_src_poster_source_src_img_src_image_xlink_href_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_Breadcrumb_vue__["a" /* default */],
  __vue_template_functional__,
  __vue_styles__,
  __vue_scopeId__,
  __vue_module_identifier__
)
Component.options.__file = "Components/Breadcrumb/Breadcrumb.vue"

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-3fbdf404", Component.options)
  } else {
    hotAPI.reload("data-v-3fbdf404", Component.options)
  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

/* harmony default export */ __webpack_exports__["default"] = (Component.exports);


/***/ }),

/***/ "DEzI":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c("el-input-number", {
    attrs: { size: _vm.size },
    on: { change: _vm.valChange },
    model: {
      value: _vm.input,
      callback: function($$v) {
        _vm.input = $$v
      },
      expression: "input"
    }
  })
}
var staticRenderFns = []
render._withStripped = true
var esExports = { render: render, staticRenderFns: staticRenderFns }
/* harmony default export */ __webpack_exports__["a"] = (esExports);
if (false) {
  module.hot.accept()
  if (module.hot.data) {
    require("vue-hot-reload-api")      .rerender("data-v-78ea8f26", esExports)
  }
}

/***/ }),

/***/ "DF/m":
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__("Vmy+")(true);
// imports


// module
exports.push([module.i, "\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n", "", {"version":3,"sources":[],"names":[],"mappings":"","file":"select.vue","sourceRoot":""}]);

// exports


/***/ }),

/***/ "E1zk":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c(
    "el-select",
    {
      attrs: { size: _vm.size, clearable: "", filterable: "" },
      on: { change: _vm.valChange },
      model: {
        value: _vm.input,
        callback: function($$v) {
          _vm.input = $$v
        },
        expression: "input"
      }
    },
    _vm._l(_vm.$store.getters.componentNameList, function(item) {
      return _c("el-option", { key: item, attrs: { label: item, value: item } })
    })
  )
}
var staticRenderFns = []
render._withStripped = true
var esExports = { render: render, staticRenderFns: staticRenderFns }
/* harmony default export */ __webpack_exports__["a"] = (esExports);
if (false) {
  module.hot.accept()
  if (module.hot.data) {
    require("vue-hot-reload-api")      .rerender("data-v-2777b368", esExports)
  }
}

/***/ }),

/***/ "Ehk1":
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.hasError = exports.input = undefined;

var _string = __webpack_require__("LPeo");

var _string2 = _interopRequireDefault(_string);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var hasError = function hasError(conf) {};

var input = {
    component: _string2.default,
    propsLoader: function propsLoader(conf) {
        return {};
    }
};

exports.input = input;
exports.hasError = hasError;

/***/ }),

/***/ "F/QB":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c(
    "el-form",
    _vm._b({}, "el-form", _vm.$props, false),
    [_vm._t("default")],
    2
  )
}
var staticRenderFns = []
render._withStripped = true
var esExports = { render: render, staticRenderFns: staticRenderFns }
/* harmony default export */ __webpack_exports__["a"] = (esExports);
if (false) {
  module.hot.accept()
  if (module.hot.data) {
    require("vue-hot-reload-api")      .rerender("data-v-1b80d924", esExports)
  }
}

/***/ }),

/***/ "F1cB":
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.isPlainObject = isPlainObject;
function isPlainObject(e) {
    return Object.prototype.toString.call(e).match(/\[object (.*)\]/)[1] === 'Object';
}

/***/ }),

/***/ "FxCM":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c(
    "el-breadcrumb",
    { attrs: { separator: "/", "separator-class": _vm.separatorClass } },
    _vm._l(_vm.items, function(item, idx) {
      return _c("el-breadcrumb-item", { key: idx, attrs: { to: item.to } }, [
        _vm._v("\n   " + _vm._s(item.title) + "\n   ")
      ])
    })
  )
}
var staticRenderFns = []
render._withStripped = true
var esExports = { render: render, staticRenderFns: staticRenderFns }
/* harmony default export */ __webpack_exports__["a"] = (esExports);
if (false) {
  module.hot.accept()
  if (module.hot.data) {
    require("vue-hot-reload-api")      .rerender("data-v-3fbdf404", esExports)
  }
}

/***/ }),

/***/ "HcWG":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_Tool_vue__ = __webpack_require__("0NhW");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_Tool_vue___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_Tool_vue__);
/* harmony namespace reexport (unknown) */ for(var __WEBPACK_IMPORT_KEY__ in __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_Tool_vue__) if(__WEBPACK_IMPORT_KEY__ !== 'default') (function(key) { __webpack_require__.d(__webpack_exports__, key, function() { return __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_Tool_vue__[key]; }) }(__WEBPACK_IMPORT_KEY__));
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_4259cc0a_hasScoped_true_transformToRequire_video_src_poster_source_src_img_src_image_xlink_href_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_Tool_vue__ = __webpack_require__("4IRE");
var disposed = false
function injectStyle (ssrContext) {
  if (disposed) return
  __webpack_require__("e1Q+")
}
var normalizeComponent = __webpack_require__("mUJo")
/* script */


/* template */

/* template functional */
var __vue_template_functional__ = false
/* styles */
var __vue_styles__ = injectStyle
/* scopeId */
var __vue_scopeId__ = "data-v-4259cc0a"
/* moduleIdentifier (server only) */
var __vue_module_identifier__ = null
var Component = normalizeComponent(
  __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_Tool_vue___default.a,
  __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_4259cc0a_hasScoped_true_transformToRequire_video_src_poster_source_src_img_src_image_xlink_href_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_Tool_vue__["a" /* default */],
  __vue_template_functional__,
  __vue_styles__,
  __vue_scopeId__,
  __vue_module_identifier__
)
Component.options.__file = "Create/Tool/Tool.vue"

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-4259cc0a", Component.options)
  } else {
    hotAPI.reload("data-v-4259cc0a", Component.options)
  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

/* harmony default export */ __webpack_exports__["default"] = (Component.exports);


/***/ }),

/***/ "HiWM":
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__("Vmy+")(true);
// imports


// module
exports.push([module.i, "\n.add-row[data-v-2d1c2e66] {\n  height: 30px;\n  line-height: 30px;\n  transition: all 0.5s ease;\n  cursor: pointer;\n}\n.add-row[data-v-2d1c2e66]:hover {\n  background-color: whitesmoke;\n}\n", "", {"version":3,"sources":["/Users/wang/vue-element-page-generator/src/type_parser/type_parser/object/object.vue"],"names":[],"mappings":";AA2GA;EACA,aAAA;EACA,kBAAA;EACA,0BAAA;EACA,gBAAA;CACA;AAEA;EACA,6BAAA;CACA","file":"object.vue","sourcesContent":["<template>\n  <div>\n    <div v-if=\"format\" key=\"1\">\n      <el-table :data=\"input\" size=\"mini\">\n        <el-table-column label=\"label\" min-width=\"30\">\n          <span slot-scope=\"scope\">{{scope.row.label}}</span>\n        </el-table-column>\n        <el-table-column label=\"value\" min-width=\"40\">\n          <component size=\"mini\" slot-scope=\"scope\" :conf=\"scope.row.com.conf\" @input=\"handleChange\" v-model=\"scope.row.value\" pg-child :is=\"scope.row.com.input\" v-bind=\"scope.row.com.props\"></component>\n        </el-table-column>\n      </el-table>\n    </div>\n    <div v-else key=\"2\">\n      <el-table :data=\"input\" size=\"mini\">\n        <el-table-column width=\"60\">\n          <el-button slot-scope=\"scope\" size=\"mini\" type=\"danger\" @click=\"delRow(scope.$index)\"> - </el-button>\n        </el-table-column>\n        <el-table-column label=\"label\" min-width=\"30\">\n          <el-input size=\"mini\" v-model=\"scope.row.name\" slot-scope=\"scope\" @change=\"handleChange\"></el-input>\n        </el-table-column>\n        <el-table-column label=\"value\" min-width=\"60\">\n          <el-input size=\"mini\" v-model=\"scope.row.value\" slot-scope=\"scope\" @change=\"handleChange\"></el-input>\n        </el-table-column>\n      </el-table>\n      <div class=\"add-row\" @click=\"addRow\">\n        <i class=\"el-icon-plus\"></i>\n      </div>\n    </div>\n  </div>\n</template>\n\n<script>\nexport default {\n  name: \"Object\",\n  props: {\n    value: Object,\n    format: Array,\n    conf:{}\n  },\n  data() {\n    return {\n      input: []\n    };\n  },\n  created() {\n    if(this.format){\n      this.input = this.obj2Array(this.value);\n    }\n  },\n  methods: {\n    obj2Array(obj) {\n      let arr = [];\n      for (let key in obj) {\n        let arrItem = {\n          label: key,\n          name: key,\n          value: obj[key]\n        };\n        if (this.format) {\n          this.format.some(item => {\n            if (arrItem.name === item.name) {\n              arrItem.label = item.label;\n              arrItem.com = item;\n              return true;\n            }\n          });\n        }\n        arr.push(arrItem);\n      }\n      return arr;\n    },\n    arr2Obj(arr) {\n      return arr.reduce((obj, arrItem) => {\n        obj[arrItem.name] = arrItem.value;\n        return obj;\n      }, {});\n    },\n    //自由格式对象\n    addRow() {\n      this.input.push({\n        label: \"\",\n        name: \"\",\n        value: \"\"\n      });\n    },\n    //自由格式对象\n    delRow(index) {\n      this.input.splice(index, 1);\n      this.inputArg();\n    },\n    handleChange() {\n      this.inputArg();\n    },\n    inputArg() {\n      this.$emit(\"input\", this.arr2Obj(this.input));\n    }\n  },\n  watch:{\n    value(){\n      if(this.format){\n        this.input = this.obj2Array(this.value);\n      }\n    }\n  }\n};\n</script>\n\n<style scoped>\n.add-row {\n  height: 30px;\n  line-height: 30px;\n  transition: all 0.5s ease;\n  cursor: pointer;\n}\n\n.add-row:hover {\n  background-color: whitesmoke;\n}\n</style>\n\n"],"sourceRoot":""}]);

// exports


/***/ }),

/***/ "Is/d":
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__("hjkg");
if(typeof content === 'string') content = [[module.i, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var update = __webpack_require__("pFN4")("2c03e146", content, false, {});
// Hot Module Replacement
if(false) {
 // When the styles change, update the <style> tags
 if(!content.locals) {
   module.hot.accept("!!../../css-loader/index.js?{\"sourceMap\":true}!../../vue-loader/lib/style-compiler/index.js?{\"vue\":true,\"id\":\"data-v-029b3b2f\",\"scoped\":false,\"hasInlineConfig\":false}!../../vue-loader/lib/selector.js?type=styles&index=0!./vue-drag-tree.vue", function() {
     var newContent = require("!!../../css-loader/index.js?{\"sourceMap\":true}!../../vue-loader/lib/style-compiler/index.js?{\"vue\":true,\"id\":\"data-v-029b3b2f\",\"scoped\":false,\"hasInlineConfig\":false}!../../vue-loader/lib/selector.js?type=styles&index=0!./vue-drag-tree.vue");
     if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
     update(newContent);
   });
 }
 // When the module is disposed, remove the <style> tags
 module.hot.dispose(function() { update(); });
}

/***/ }),

/***/ "Is3s":
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__("b5km");
if(typeof content === 'string') content = [[module.i, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var update = __webpack_require__("pFN4")("2e72d17a", content, false, {});
// Hot Module Replacement
if(false) {
 // When the styles change, update the <style> tags
 if(!content.locals) {
   module.hot.accept("!!../../../node_modules/css-loader/index.js?{\"sourceMap\":true}!../../../node_modules/vue-loader/lib/style-compiler/index.js?{\"vue\":true,\"id\":\"data-v-51437f64\",\"scoped\":false,\"hasInlineConfig\":false}!../../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./Dialog.vue", function() {
     var newContent = require("!!../../../node_modules/css-loader/index.js?{\"sourceMap\":true}!../../../node_modules/vue-loader/lib/style-compiler/index.js?{\"vue\":true,\"id\":\"data-v-51437f64\",\"scoped\":false,\"hasInlineConfig\":false}!../../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./Dialog.vue");
     if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
     update(newContent);
   });
 }
 // When the module is disposed, remove the <style> tags
 module.hot.dispose(function() { update(); });
}

/***/ }),

/***/ "JcYZ":
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = {
    "name": 'form',
    "props": [{
        "name": "inline",
        "label": "是否行内表单",
        "value": "boolean"
    }, {
        "name": "labelPosition",
        "label": "标签位置",
        "value": "select",
        "default": "",
        "options": ["left", "right", "top"]
    }, {
        "name": "labelWidth",
        "label": "标签宽度",
        "value": "string",
        "default": "80px"
    }, {
        "name": "labelSuffix",
        "label": "标签后缀",
        "value": "string",
        "default": ":"
    }, {
        "name": "statusIcon",
        "label": "是否在输入框中显示校验结果反馈图标",
        "value": "boolean"
    }, {
        "name": "size",
        "label": "表单内组件尺寸",
        "value": "string"
    }]
};

/***/ }),

/***/ "JebD":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_Form_vue__ = __webpack_require__("8rDQ");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_Form_vue___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_Form_vue__);
/* harmony namespace reexport (unknown) */ for(var __WEBPACK_IMPORT_KEY__ in __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_Form_vue__) if(__WEBPACK_IMPORT_KEY__ !== 'default') (function(key) { __webpack_require__.d(__webpack_exports__, key, function() { return __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_Form_vue__[key]; }) }(__WEBPACK_IMPORT_KEY__));
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_1b80d924_hasScoped_true_transformToRequire_video_src_poster_source_src_img_src_image_xlink_href_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_Form_vue__ = __webpack_require__("F/QB");
var disposed = false
function injectStyle (ssrContext) {
  if (disposed) return
  __webpack_require__("YnTr")
}
var normalizeComponent = __webpack_require__("mUJo")
/* script */


/* template */

/* template functional */
var __vue_template_functional__ = false
/* styles */
var __vue_styles__ = injectStyle
/* scopeId */
var __vue_scopeId__ = "data-v-1b80d924"
/* moduleIdentifier (server only) */
var __vue_module_identifier__ = null
var Component = normalizeComponent(
  __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_Form_vue___default.a,
  __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_1b80d924_hasScoped_true_transformToRequire_video_src_poster_source_src_img_src_image_xlink_href_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_Form_vue__["a" /* default */],
  __vue_template_functional__,
  __vue_styles__,
  __vue_scopeId__,
  __vue_module_identifier__
)
Component.options.__file = "Components/Form/Form.vue"

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-1b80d924", Component.options)
  } else {
    hotAPI.reload("data-v-1b80d924", Component.options)
  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

/* harmony default export */ __webpack_exports__["default"] = (Component.exports);


/***/ }),

/***/ "JhZg":
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__("c+bf");
if(typeof content === 'string') content = [[module.i, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var update = __webpack_require__("pFN4")("31fb7152", content, false, {});
// Hot Module Replacement
if(false) {
 // When the styles change, update the <style> tags
 if(!content.locals) {
   module.hot.accept("!!../../node_modules/css-loader/index.js?{\"sourceMap\":true}!../../node_modules/vue-loader/lib/style-compiler/index.js?{\"vue\":true,\"id\":\"data-v-472cff63\",\"scoped\":false,\"hasInlineConfig\":false}!../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./App.vue", function() {
     var newContent = require("!!../../node_modules/css-loader/index.js?{\"sourceMap\":true}!../../node_modules/vue-loader/lib/style-compiler/index.js?{\"vue\":true,\"id\":\"data-v-472cff63\",\"scoped\":false,\"hasInlineConfig\":false}!../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./App.vue");
     if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
     update(newContent);
   });
 }
 // When the module is disposed, remove the <style> tags
 module.hot.dispose(function() { update(); });
}

/***/ }),

/***/ "Ksto":
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _string = __webpack_require__("LPeo");

var _string2 = _interopRequireDefault(_string);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = {
  data: function data() {
    return {
      StringInput: _string2.default
    };
  },

  methods: {
    handleInput: function handleInput(name, value) {
      this.$store.commit("input", { name: name, value: value });
    }
  }
}; //
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

/***/ }),

/***/ "Kw4U":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_object_vue__ = __webpack_require__("mlcZ");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_object_vue___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_object_vue__);
/* harmony namespace reexport (unknown) */ for(var __WEBPACK_IMPORT_KEY__ in __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_object_vue__) if(__WEBPACK_IMPORT_KEY__ !== 'default') (function(key) { __webpack_require__.d(__webpack_exports__, key, function() { return __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_object_vue__[key]; }) }(__WEBPACK_IMPORT_KEY__));
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_2d1c2e66_hasScoped_true_transformToRequire_video_src_poster_source_src_img_src_image_xlink_href_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_object_vue__ = __webpack_require__("e3gZ");
var disposed = false
function injectStyle (ssrContext) {
  if (disposed) return
  __webpack_require__("Xnz+")
}
var normalizeComponent = __webpack_require__("mUJo")
/* script */


/* template */

/* template functional */
var __vue_template_functional__ = false
/* styles */
var __vue_styles__ = injectStyle
/* scopeId */
var __vue_scopeId__ = "data-v-2d1c2e66"
/* moduleIdentifier (server only) */
var __vue_module_identifier__ = null
var Component = normalizeComponent(
  __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_object_vue___default.a,
  __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_2d1c2e66_hasScoped_true_transformToRequire_video_src_poster_source_src_img_src_image_xlink_href_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_object_vue__["a" /* default */],
  __vue_template_functional__,
  __vue_styles__,
  __vue_scopeId__,
  __vue_module_identifier__
)
Component.options.__file = "type_parser/object/object.vue"

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-2d1c2e66", Component.options)
  } else {
    hotAPI.reload("data-v-2d1c2e66", Component.options)
  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

/* harmony default export */ __webpack_exports__["default"] = (Component.exports);


/***/ }),

/***/ "LPeo":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_string_vue__ = __webpack_require__("kgg8");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_string_vue___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_string_vue__);
/* harmony namespace reexport (unknown) */ for(var __WEBPACK_IMPORT_KEY__ in __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_string_vue__) if(__WEBPACK_IMPORT_KEY__ !== 'default') (function(key) { __webpack_require__.d(__webpack_exports__, key, function() { return __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_string_vue__[key]; }) }(__WEBPACK_IMPORT_KEY__));
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_3eccc3b4_hasScoped_false_transformToRequire_video_src_poster_source_src_img_src_image_xlink_href_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_string_vue__ = __webpack_require__("0niv");
var disposed = false
var normalizeComponent = __webpack_require__("mUJo")
/* script */


/* template */

/* template functional */
var __vue_template_functional__ = false
/* styles */
var __vue_styles__ = null
/* scopeId */
var __vue_scopeId__ = null
/* moduleIdentifier (server only) */
var __vue_module_identifier__ = null
var Component = normalizeComponent(
  __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_string_vue___default.a,
  __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_3eccc3b4_hasScoped_false_transformToRequire_video_src_poster_source_src_img_src_image_xlink_href_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_string_vue__["a" /* default */],
  __vue_template_functional__,
  __vue_styles__,
  __vue_scopeId__,
  __vue_module_identifier__
)
Component.options.__file = "type_parser/string/string.vue"

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-3eccc3b4", Component.options)
  } else {
    hotAPI.reload("data-v-3eccc3b4", Component.options)
  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

/* harmony default export */ __webpack_exports__["default"] = (Component.exports);


/***/ }),

/***/ "Mbk5":
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
//
//
//
//
//
//

exports.default = {
  name: "Boolean",
  props: {
    conf: {},
    value: Boolean,
    name: String
  },
  data: function data() {
    return {
      input: this.value
    };
  },
  created: function created() {},

  methods: {
    valChange: function valChange(input) {
      this.$emit("input", input);
    }
  },
  watch: {
    value: function value() {
      this.input = this.value;
    }
  }
};

/***/ }),

/***/ "MtiE":
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _defineProperty2 = __webpack_require__("AbJS");

var _defineProperty3 = _interopRequireDefault(_defineProperty2);

var _stringify = __webpack_require__("hoiv");

var _stringify2 = _interopRequireDefault(_stringify);

var _extends2 = __webpack_require__("AGn3");

var _extends3 = _interopRequireDefault(_extends2);

var _assign = __webpack_require__("Bx2q");

var _assign2 = _interopRequireDefault(_assign);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = function (config) {
    var def = {};
    (0, _assign2.default)(def, conf2Default(config, true));
    return def;

    function getDefault(conf, isRoot) {
        var type = conf.value;
        if (type === 'string') {
            return '';
        } else if (type === 'select') {
            return '';
        } else if (type === 'slot-component') {
            return {
                type: '__pg_type_slot_component__',
                value: []
            };
        } else if (type === 'refer-component') {
            return {
                type: '__pg_type_refer_component__',
                value: ''
            };
        } else if (type === 'boolean') {
            if (conf.on && isRoot) {
                //仅限Root
                (0, _assign2.default)(def, conf2Default(conf.on)); //!!!有副作用
            }
            return false;
        } else if (type === 'object') {
            if (conf.format) {
                return conf2Default(conf.format);
            } else {
                return {
                    name: '',
                    value: ''
                };
            }
        } else if (Array.isArray(type) && type.length == 1) {
            var item = getDefault((0, _extends3.default)({}, conf, {
                value: type[0]
            }));
            (0, _assign2.default)(def, (0, _defineProperty3.default)({}, '_' + conf.name, JSON.parse((0, _stringify2.default)(item)))); //!!!有副作用
            return new Array(2).fill('').map(function () {
                return JSON.parse((0, _stringify2.default)(item)); //防止引用同一个实例
            });
        }
    }
    /**
     * 
     * @param { Array<conf> } config 
     * @param { Boolean } isRoot 是否是根config
     */
    function conf2Default(config, isRoot) {
        var def = {};
        config.forEach(function (conf) {
            def[conf.name] = conf.default !== undefined ? conf.default : getDefault(conf, isRoot);
        });
        return def;
    }
};

/***/ }),

/***/ "Mtp0":
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
//
//
//
//
//
//
//
//
//
//

exports.default = {
  name: "PG-SLOT-COMPONENT",
  props: {
    value: Object,
    options: Array,
    conf: Object,
    size: {
      default: "small"
    }
  },
  data: function data() {
    return {
      input: ""
    };
  },
  created: function created() {
    this.input = this.val2inp(this.value);
  },

  methods: {
    val2inp: function val2inp(val) {
      return val.value.join(',');
    },
    inp2val: function inp2val(inp) {
      return {
        type: "__pg_type_slot_component__",
        value: inp.split(',')
      };
    },
    valChange: function valChange(input) {
      this.$emit("input", this.inp2val(this.input));
    }
  },
  watch: {
    value: function value() {
      this.input = this.val2inp(this.value);
    }
  }
};

/***/ }),

/***/ "N0EC":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_array_vue__ = __webpack_require__("PRBh");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_array_vue___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_array_vue__);
/* harmony namespace reexport (unknown) */ for(var __WEBPACK_IMPORT_KEY__ in __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_array_vue__) if(__WEBPACK_IMPORT_KEY__ !== 'default') (function(key) { __webpack_require__.d(__webpack_exports__, key, function() { return __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_array_vue__[key]; }) }(__WEBPACK_IMPORT_KEY__));
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_6a437f3a_hasScoped_false_transformToRequire_video_src_poster_source_src_img_src_image_xlink_href_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_array_vue__ = __webpack_require__("qyNe");
var disposed = false
function injectStyle (ssrContext) {
  if (disposed) return
  __webpack_require__("QpPm")
}
var normalizeComponent = __webpack_require__("mUJo")
/* script */


/* template */

/* template functional */
var __vue_template_functional__ = false
/* styles */
var __vue_styles__ = injectStyle
/* scopeId */
var __vue_scopeId__ = null
/* moduleIdentifier (server only) */
var __vue_module_identifier__ = null
var Component = normalizeComponent(
  __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_array_vue___default.a,
  __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_6a437f3a_hasScoped_false_transformToRequire_video_src_poster_source_src_img_src_image_xlink_href_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_array_vue__["a" /* default */],
  __vue_template_functional__,
  __vue_styles__,
  __vue_scopeId__,
  __vue_module_identifier__
)
Component.options.__file = "type_parser/array/array.vue"

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-6a437f3a", Component.options)
  } else {
    hotAPI.reload("data-v-6a437f3a", Component.options)
  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

/* harmony default export */ __webpack_exports__["default"] = (Component.exports);


/***/ }),

/***/ "Njca":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c(
    "div",
    [
      _c(
        "el-table",
        { attrs: { data: _vm.data, border: "" } },
        _vm._l(_vm.cols, function(col, idx) {
          return _c(
            "el-table-column",
            _vm._b(
              { key: idx, attrs: { resizable: false } },
              "el-table-column",
              col,
              false
            )
          )
        })
      )
    ],
    1
  )
}
var staticRenderFns = []
render._withStripped = true
var esExports = { render: render, staticRenderFns: staticRenderFns }
/* harmony default export */ __webpack_exports__["a"] = (esExports);
if (false) {
  module.hot.accept()
  if (module.hot.data) {
    require("vue-hot-reload-api")      .rerender("data-v-2405cc7c", esExports)
  }
}

/***/ }),

/***/ "OSsu":
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.hasError = exports.input = undefined;

var _number = __webpack_require__("012k");

var _number2 = _interopRequireDefault(_number);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var hasError = function hasError(conf) {};

var input = {
    component: _number2.default,
    propsLoader: function propsLoader(conf) {
        return {};
    }
};

exports.input = input;
exports.hasError = hasError;

/***/ }),

/***/ "OnC2":
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__("qUYg");
if(typeof content === 'string') content = [[module.i, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var update = __webpack_require__("pFN4")("b759af9e", content, false, {});
// Hot Module Replacement
if(false) {
 // When the styles change, update the <style> tags
 if(!content.locals) {
   module.hot.accept("!!../../../../node_modules/css-loader/index.js?{\"sourceMap\":true}!../../../../node_modules/vue-loader/lib/style-compiler/index.js?{\"vue\":true,\"id\":\"data-v-453d3eb3\",\"scoped\":true,\"hasInlineConfig\":false}!../../../../node_modules/sass-loader/lib/loader.js?{\"sourceMap\":true}!../../../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./Hierarchy.vue", function() {
     var newContent = require("!!../../../../node_modules/css-loader/index.js?{\"sourceMap\":true}!../../../../node_modules/vue-loader/lib/style-compiler/index.js?{\"vue\":true,\"id\":\"data-v-453d3eb3\",\"scoped\":true,\"hasInlineConfig\":false}!../../../../node_modules/sass-loader/lib/loader.js?{\"sourceMap\":true}!../../../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./Hierarchy.vue");
     if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
     update(newContent);
   });
 }
 // When the module is disposed, remove the <style> tags
 module.hot.dispose(function() { update(); });
}

/***/ }),

/***/ "PRBh":
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _stringify = __webpack_require__("hoiv");

var _stringify2 = _interopRequireDefault(_stringify);

var _defineProperty2 = __webpack_require__("AbJS");

var _defineProperty3 = _interopRequireDefault(_defineProperty2);

var _extends2 = __webpack_require__("AGn3");

var _extends3 = _interopRequireDefault(_extends2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

var defaultValue = void 0;
exports.default = {
  name: "Array",
  props: {
    conf: {},
    value: Array,
    _itemCOM: Array,
    arrItem: {}
  },
  data: function data() {
    return {
      cols: [],
      input: this.value,
      uuid: 0
    };
  },
  created: function created() {
    this.input = this.input2Obj(this.value);
  },

  methods: {
    input2Obj: function input2Obj(value) {
      var _this = this;

      if (this.conf.value[0] === "object") {
        return value.map(function (e) {
          return (0, _extends3.default)({}, e, {
            __id__: _this.uuid++
          });
        });
      } else {
        return value.map(function (e) {
          var _ref;

          return _ref = {}, (0, _defineProperty3.default)(_ref, _itemCOM.name, e), (0, _defineProperty3.default)(_ref, "__id__", _this.uuid++), _ref;
        });
      }
    },
    objTOInput: function objTOInput(input) {
      if (this.conf.value[0] === "object") {
        return input.map(function (e) {
          e = JSON.parse((0, _stringify2.default)(e));
          delete e.__id__;
          return e;
        });
      } else {
        return input.map(function (e) {
          return e[_itemCOM.name];
        });
      }
    },
    add: function add() {
      this.input.push(this.input2Obj([JSON.parse((0, _stringify2.default)(this.arrItem))])[0]);
      this.handleChange();
    },
    handleChange: function handleChange() {
      this.$emit("input", this.objTOInput(this.input));
    },
    delRow: function delRow(index) {
      this.input.splice(index, 1);
      this.handleChange();
    }
  },
  watch: {
    value: function value() {
      this.input = this.input2Obj(this.value);
    }
  }
};

/***/ }),

/***/ "PTys":
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
//
//
//
//
//
//
//
//
//
//

exports.default = {
  name: 'Breadcrumb',
  props: ['items', 'separator', 'separatorClass'],
  data: function data() {
    return {};
  }
};

/***/ }),

/***/ "PVA4":
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__("Vmy+")(true);
// imports


// module
exports.push([module.i, "\n.template-list[data-v-7077c805]{\n  width: 80%;\n  margin:20px auto;\n}\n", "", {"version":3,"sources":["/Users/wang/vue-element-page-generator/src/gui/Templates/Templates/Templates.vue"],"names":[],"mappings":";AAoDA;EACA,WAAA;EACA,iBAAA;CACA","file":"Templates.vue","sourcesContent":["<template>\n  <div class=\"template-list\">\n    <el-button type=\"primary\">新建页面</el-button>\n    <el-table\n      :data=\"table.items\" style=\"margin-top:10px;\">\n      <el-table-column\n        prop=\"date\"\n        label=\"创建日期\"\n        width=\"180\"\n        >\n      </el-table-column>\n      <el-table-column\n        prop=\"name\"\n        label=\"模板名称\"\n        width=\"180\">\n      </el-table-column>\n      <el-table-column\n        prop=\"remark\"\n        label=\"备注\">\n      </el-table-column>\n      <el-table-column\n        label=\"操作\">\n        <template slot-scope=\"scope\">\n          <el-button size=\"small\">生成页面</el-button>\n          <el-button size=\"small\" type=\"warning\">删除模板</el-button>\n        </template>\n      </el-table-column>\n    </el-table>\n  </div>\n</template>\n\n<script>\nexport default {\n  data() {\n    return {\n      table: {\n        items: [{\n          name:'常规列表页',\n          date:'2018-10-16 23:00:00',\n          remark:'sdaasd'\n        }]\n      }\n    };\n  },\n  methods: {\n    save() {\n      axios.post(\"/save\", this.$store.getters.data);\n    }\n  }\n};\n</script>\n\n<style scoped>\n.template-list{\n  width: 80%;\n  margin:20px auto;\n}\n</style>\n"],"sourceRoot":""}]);

// exports


/***/ }),

/***/ "QOdy":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c(
    "el-select",
    {
      attrs: {
        size: _vm.size,
        placeholder: _vm.conf.default || "",
        clearable: ""
      },
      on: { change: _vm.valChange },
      model: {
        value: _vm.input,
        callback: function($$v) {
          _vm.input = $$v
        },
        expression: "input"
      }
    },
    _vm._l(_vm.options, function(option) {
      return _c("el-option", {
        key: option.key,
        attrs: { value: option.key, label: option.value }
      })
    })
  )
}
var staticRenderFns = []
render._withStripped = true
var esExports = { render: render, staticRenderFns: staticRenderFns }
/* harmony default export */ __webpack_exports__["a"] = (esExports);
if (false) {
  module.hot.accept()
  if (module.hot.data) {
    require("vue-hot-reload-api")      .rerender("data-v-25e57fc6", esExports)
  }
}

/***/ }),

/***/ "QpPm":
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__("ikPJ");
if(typeof content === 'string') content = [[module.i, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var update = __webpack_require__("pFN4")("52d1f13d", content, false, {});
// Hot Module Replacement
if(false) {
 // When the styles change, update the <style> tags
 if(!content.locals) {
   module.hot.accept("!!../../../node_modules/css-loader/index.js?{\"sourceMap\":true}!../../../node_modules/vue-loader/lib/style-compiler/index.js?{\"vue\":true,\"id\":\"data-v-6a437f3a\",\"scoped\":false,\"hasInlineConfig\":false}!../../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./array.vue", function() {
     var newContent = require("!!../../../node_modules/css-loader/index.js?{\"sourceMap\":true}!../../../node_modules/vue-loader/lib/style-compiler/index.js?{\"vue\":true,\"id\":\"data-v-6a437f3a\",\"scoped\":false,\"hasInlineConfig\":false}!../../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./array.vue");
     if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
     update(newContent);
   });
 }
 // When the module is disposed, remove the <style> tags
 module.hot.dispose(function() { update(); });
}

/***/ }),

/***/ "Qrc2":
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
//
//
//
//
//

exports.default = {
  name: "Tag",
  props: ["title", "type", "color", "hit", "size"],
  data: function data() {
    return {};
  }
};

/***/ }),

/***/ "R8Qc":
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__("ZRUf");
if(typeof content === 'string') content = [[module.i, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var update = __webpack_require__("pFN4")("85c8dfb2", content, false, {});
// Hot Module Replacement
if(false) {
 // When the styles change, update the <style> tags
 if(!content.locals) {
   module.hot.accept("!!../../../node_modules/css-loader/index.js?{\"sourceMap\":true}!../../../node_modules/vue-loader/lib/style-compiler/index.js?{\"vue\":true,\"id\":\"data-v-6e215a50\",\"scoped\":true,\"hasInlineConfig\":false}!../../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./boolean.vue", function() {
     var newContent = require("!!../../../node_modules/css-loader/index.js?{\"sourceMap\":true}!../../../node_modules/vue-loader/lib/style-compiler/index.js?{\"vue\":true,\"id\":\"data-v-6e215a50\",\"scoped\":true,\"hasInlineConfig\":false}!../../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./boolean.vue");
     if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
     update(newContent);
   });
 }
 // When the module is disposed, remove the <style> tags
 module.hot.dispose(function() { update(); });
}

/***/ }),

/***/ "SAAC":
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__("4SEc");
if(typeof content === 'string') content = [[module.i, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var update = __webpack_require__("pFN4")("499d3912", content, false, {});
// Hot Module Replacement
if(false) {
 // When the styles change, update the <style> tags
 if(!content.locals) {
   module.hot.accept("!!../../../node_modules/css-loader/index.js?{\"sourceMap\":true}!../../../node_modules/vue-loader/lib/style-compiler/index.js?{\"vue\":true,\"id\":\"data-v-6fe728ba\",\"scoped\":true,\"hasInlineConfig\":false}!../../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./Input.vue", function() {
     var newContent = require("!!../../../node_modules/css-loader/index.js?{\"sourceMap\":true}!../../../node_modules/vue-loader/lib/style-compiler/index.js?{\"vue\":true,\"id\":\"data-v-6fe728ba\",\"scoped\":true,\"hasInlineConfig\":false}!../../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./Input.vue");
     if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
     update(newContent);
   });
 }
 // When the module is disposed, remove the <style> tags
 module.hot.dispose(function() { update(); });
}

/***/ }),

/***/ "Ssu4":
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__("/NW1");
if(typeof content === 'string') content = [[module.i, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var update = __webpack_require__("pFN4")("bd029e3c", content, false, {});
// Hot Module Replacement
if(false) {
 // When the styles change, update the <style> tags
 if(!content.locals) {
   module.hot.accept("!!../../../node_modules/css-loader/index.js?{\"sourceMap\":true}!../../../node_modules/vue-loader/lib/style-compiler/index.js?{\"vue\":true,\"id\":\"data-v-2777b368\",\"scoped\":true,\"hasInlineConfig\":false}!../../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./refer-component.vue", function() {
     var newContent = require("!!../../../node_modules/css-loader/index.js?{\"sourceMap\":true}!../../../node_modules/vue-loader/lib/style-compiler/index.js?{\"vue\":true,\"id\":\"data-v-2777b368\",\"scoped\":true,\"hasInlineConfig\":false}!../../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./refer-component.vue");
     if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
     update(newContent);
   });
 }
 // When the module is disposed, remove the <style> tags
 module.hot.dispose(function() { update(); });
}

/***/ }),

/***/ "T6oC":
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__("5RBz");
if(typeof content === 'string') content = [[module.i, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var update = __webpack_require__("pFN4")("56cfd292", content, false, {});
// Hot Module Replacement
if(false) {
 // When the styles change, update the <style> tags
 if(!content.locals) {
   module.hot.accept("!!../../../node_modules/css-loader/index.js?{\"sourceMap\":true}!../../../node_modules/vue-loader/lib/style-compiler/index.js?{\"vue\":true,\"id\":\"data-v-ddc4c6f4\",\"scoped\":true,\"hasInlineConfig\":false}!../../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./slot-component.vue", function() {
     var newContent = require("!!../../../node_modules/css-loader/index.js?{\"sourceMap\":true}!../../../node_modules/vue-loader/lib/style-compiler/index.js?{\"vue\":true,\"id\":\"data-v-ddc4c6f4\",\"scoped\":true,\"hasInlineConfig\":false}!../../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./slot-component.vue");
     if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
     update(newContent);
   });
 }
 // When the module is disposed, remove the <style> tags
 module.hot.dispose(function() { update(); });
}

/***/ }),

/***/ "U82Y":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_select_vue__ = __webpack_require__("a+xK");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_select_vue___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_select_vue__);
/* harmony namespace reexport (unknown) */ for(var __WEBPACK_IMPORT_KEY__ in __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_select_vue__) if(__WEBPACK_IMPORT_KEY__ !== 'default') (function(key) { __webpack_require__.d(__webpack_exports__, key, function() { return __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_select_vue__[key]; }) }(__WEBPACK_IMPORT_KEY__));
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_25e57fc6_hasScoped_true_transformToRequire_video_src_poster_source_src_img_src_image_xlink_href_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_select_vue__ = __webpack_require__("QOdy");
var disposed = false
function injectStyle (ssrContext) {
  if (disposed) return
  __webpack_require__("+uoL")
}
var normalizeComponent = __webpack_require__("mUJo")
/* script */


/* template */

/* template functional */
var __vue_template_functional__ = false
/* styles */
var __vue_styles__ = injectStyle
/* scopeId */
var __vue_scopeId__ = "data-v-25e57fc6"
/* moduleIdentifier (server only) */
var __vue_module_identifier__ = null
var Component = normalizeComponent(
  __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_select_vue___default.a,
  __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_25e57fc6_hasScoped_true_transformToRequire_video_src_poster_source_src_img_src_image_xlink_href_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_select_vue__["a" /* default */],
  __vue_template_functional__,
  __vue_styles__,
  __vue_scopeId__,
  __vue_module_identifier__
)
Component.options.__file = "type_parser/select/select.vue"

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-25e57fc6", Component.options)
  } else {
    hotAPI.reload("data-v-25e57fc6", Component.options)
  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

/* harmony default export */ __webpack_exports__["default"] = (Component.exports);


/***/ }),

/***/ "UL2/":
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _SettingBoard = __webpack_require__("qqo4");

var _SettingBoard2 = _interopRequireDefault(_SettingBoard);

var _DrawBoard = __webpack_require__("kplG");

var _DrawBoard2 = _interopRequireDefault(_DrawBoard);

var _Tool = __webpack_require__("HcWG");

var _Tool2 = _interopRequireDefault(_Tool);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = {
  components: {
    SettingBoard: _SettingBoard2.default,
    DrawBoard: _DrawBoard2.default,
    myTool: _Tool2.default
  },
  methods: {
    save: function save() {
      this.$store.dispatch('save', { vm: this });
    }
  }
}; //
//
//
//
//
//
//
//
//
//
//
//
//

/***/ }),

/***/ "UNOE":
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.hasError = exports.input = undefined;

var _extends2 = __webpack_require__("AGn3");

var _extends3 = _interopRequireDefault(_extends2);

var _array = __webpack_require__("N0EC");

var _array2 = _interopRequireDefault(_array);

var _scheme2Input = __webpack_require__("noFo");

var _scheme2Input2 = _interopRequireDefault(_scheme2Input);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var hasError = function hasError(conf) {};

var input = {
    component: _array2.default,
    propsLoader: function propsLoader(conf) {
        var props = {};
        var _itemCOM = (0, _scheme2Input2.default)([(0, _extends3.default)({}, conf, {
            value: conf.value[0],
            label: null
        })])[0];
        if (conf.value[0] === 'object' && _itemCOM.props.format) {
            props._itemCOM = _itemCOM.props.format;
        } else {
            props._itemCOM = [_itemCOM];
        }
        return props;
    }
};

exports.input = input;
exports.hasError = hasError;

/***/ }),

/***/ "Ut9Q":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c("div", [
    _c(
      "div",
      {
        staticClass: "treeNodeText",
        style: _vm.styleObj,
        attrs: { id: _vm.model.id, draggable: "true" },
        on: {
          click: _vm.toggle,
          dblclick: _vm.changeType,
          dragstart: _vm.dragStart,
          dragover: _vm.dragOver,
          dragenter: _vm.dragEnter,
          dragleave: _vm.dragLeave,
          drop: _vm.drop,
          dragend: _vm.dragEnd,
          mouseover: _vm.mouseOver,
          mouseout: _vm.mouseOut
        }
      },
      [
        _c("span", {
          class: [_vm.isClicked ? "nodeClicked" : "", "vue-drag-node-icon"]
        }),
        _vm._v("\n        " + _vm._s(_vm.model.name) + "\n        "),
        _vm.model.id != "0"
          ? _c(
              "span",
              {
                on: {
                  click: function($event) {
                    _vm.removeChild(_vm.model.id)
                  }
                }
              },
              [_vm._v(" x")]
            )
          : _vm._e()
      ]
    ),
    _vm._v(" "),
    _vm.isFolder
      ? _c(
          "div",
          {
            directives: [
              {
                name: "show",
                rawName: "v-show",
                value: _vm.open,
                expression: "open"
              }
            ],
            staticClass: "treeMargin"
          },
          [
            _vm._l(_vm.model.children, function(model) {
              return _c("vue-drag-tree-com42", {
                key: model.id,
                attrs: {
                  model: model,
                  "current-highlight": _vm.currentHighlight,
                  "default-text": _vm.defaultText,
                  "hover-color": _vm.hoverColor,
                  "highlight-color": _vm.highlightColor
                }
              })
            }),
            _vm._v(" "),
            _c(
              "div",
              {
                staticClass: "changeTree",
                on: {
                  click: _vm.addChild,
                  drop: _vm.dropPlus,
                  dragover: _vm.dragOverPlus,
                  dragenter: _vm.dragEnterPlus
                }
              },
              [_vm._v("+")]
            )
          ],
          2
        )
      : _vm._e()
  ])
}
var staticRenderFns = []
render._withStripped = true
var esExports = { render: render, staticRenderFns: staticRenderFns }
/* harmony default export */ __webpack_exports__["a"] = (esExports);
if (false) {
  module.hot.accept()
  if (module.hot.data) {
    require("vue-hot-reload-api")      .rerender("data-v-029b3b2f", esExports)
  }
}

/***/ }),

/***/ "VJeK":
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = {
    "name": 'table',
    "props": [{
        "name": "cols",
        "label": "设置列",
        "value": ["object"],
        "format": [{
            "name": "fixed",
            "label": "fixed",
            "value": "select",
            "options": ["left", "right"]
        }, {
            "name": "label",
            "label": "label",
            "value": "string"
        }, {
            "name": "prop",
            "label": "prop",
            "value": "string"
        }, {
            "name": "min-width",
            "label": "min-width",
            "value": "string"
        }, {
            "name": "scope",
            "label": "scope",
            "value": "slot-component"
        }]
    }, {
        "name": "pagination",
        "label": "分页器",
        "value": "boolean",
        "on": [{
            "name": "pageSizes",
            "label": "可选页数",
            "value": "string"
        }, {
            "name": "paginationLayout",
            "label": "布局",
            "value": "string"
        }]
    }, {
        "name": "load",
        "label": "数据加载",
        "value": "boolean",
        "on": [{
            "name": "method",
            "default": "get",
            "label": "method",
            "value": "string"
        }, {
            "name": "url",
            "label": "接口名称",
            "value": "string"
        }, {
            "name": "params",
            "label": "请求参数",
            "value": "object"
        }, {
            "name": "totalName",
            "label": "响应total字段",
            "default": "total",
            "value": "string"
        }, {
            "name": "itemsName",
            "label": "响应items字段",
            "default": "items",
            "value": "string"
        }, {
            "name": "pageName",
            "default": "page",
            "label": "请求page字段",
            "value": "string"
        }, {
            "name": "pageSizeName",
            "default": "pageSize",
            "label": "请求pageSize字段",
            "value": "string"
        }]
    }]
};

/***/ }),

/***/ "VacL":
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__("ZsVe");
if(typeof content === 'string') content = [[module.i, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var update = __webpack_require__("pFN4")("7f9b9540", content, false, {});
// Hot Module Replacement
if(false) {
 // When the styles change, update the <style> tags
 if(!content.locals) {
   module.hot.accept("!!../../../node_modules/css-loader/index.js?{\"sourceMap\":true}!../../../node_modules/vue-loader/lib/style-compiler/index.js?{\"vue\":true,\"id\":\"data-v-31e3ab51\",\"scoped\":true,\"hasInlineConfig\":false}!../../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./Create.vue", function() {
     var newContent = require("!!../../../node_modules/css-loader/index.js?{\"sourceMap\":true}!../../../node_modules/vue-loader/lib/style-compiler/index.js?{\"vue\":true,\"id\":\"data-v-31e3ab51\",\"scoped\":true,\"hasInlineConfig\":false}!../../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./Create.vue");
     if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
     update(newContent);
   });
 }
 // When the module is disposed, remove the <style> tags
 module.hot.dispose(function() { update(); });
}

/***/ }),

/***/ "W7Vb":
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

exports.default = {
  data: function data() {
    return {
      table: {
        items: [{
          name: '常规列表页',
          date: '2018-10-16 23:00:00',
          remark: 'sdaasd'
        }]
      }
    };
  },

  methods: {
    save: function save() {
      axios.post("/save", this.$store.getters.data);
    }
  }
};

/***/ }),

/***/ "WEJo":
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = {
    "name": 'dialog',
    "isDialog": true,
    "expose": ["open"],
    "props": [{
        "name": "title",
        "value": "string",
        "label": "标题"
    }, {
        "name": "showClose",
        "label": "显示关闭按钮",
        "value": "boolean"
    }, {
        "name": "center",
        "label": "对头部和底部采用居中布局",
        "value": "boolean"
    }]
};

/***/ }),

/***/ "WWVw":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_Tag_vue__ = __webpack_require__("Qrc2");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_Tag_vue___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_Tag_vue__);
/* harmony namespace reexport (unknown) */ for(var __WEBPACK_IMPORT_KEY__ in __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_Tag_vue__) if(__WEBPACK_IMPORT_KEY__ !== 'default') (function(key) { __webpack_require__.d(__webpack_exports__, key, function() { return __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_Tag_vue__[key]; }) }(__WEBPACK_IMPORT_KEY__));
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_272f7ccc_hasScoped_true_transformToRequire_video_src_poster_source_src_img_src_image_xlink_href_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_Tag_vue__ = __webpack_require__("YChW");
var disposed = false
function injectStyle (ssrContext) {
  if (disposed) return
  __webpack_require__("1EeX")
}
var normalizeComponent = __webpack_require__("mUJo")
/* script */


/* template */

/* template functional */
var __vue_template_functional__ = false
/* styles */
var __vue_styles__ = injectStyle
/* scopeId */
var __vue_scopeId__ = "data-v-272f7ccc"
/* moduleIdentifier (server only) */
var __vue_module_identifier__ = null
var Component = normalizeComponent(
  __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_Tag_vue___default.a,
  __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_272f7ccc_hasScoped_true_transformToRequire_video_src_poster_source_src_img_src_image_xlink_href_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_Tag_vue__["a" /* default */],
  __vue_template_functional__,
  __vue_styles__,
  __vue_scopeId__,
  __vue_module_identifier__
)
Component.options.__file = "Components/Tag/Tag.vue"

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-272f7ccc", Component.options)
  } else {
    hotAPI.reload("data-v-272f7ccc", Component.options)
  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

/* harmony default export */ __webpack_exports__["default"] = (Component.exports);


/***/ }),

/***/ "XDMU":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c(
    "div",
    [
      _c("el-switch", {
        on: { change: _vm.valChange },
        model: {
          value: _vm.input,
          callback: function($$v) {
            _vm.input = $$v
          },
          expression: "input"
        }
      })
    ],
    1
  )
}
var staticRenderFns = []
render._withStripped = true
var esExports = { render: render, staticRenderFns: staticRenderFns }
/* harmony default export */ __webpack_exports__["a"] = (esExports);
if (false) {
  module.hot.accept()
  if (module.hot.data) {
    require("vue-hot-reload-api")      .rerender("data-v-6e215a50", esExports)
  }
}

/***/ }),

/***/ "Xnz+":
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__("HiWM");
if(typeof content === 'string') content = [[module.i, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var update = __webpack_require__("pFN4")("f2a675c4", content, false, {});
// Hot Module Replacement
if(false) {
 // When the styles change, update the <style> tags
 if(!content.locals) {
   module.hot.accept("!!../../../node_modules/css-loader/index.js?{\"sourceMap\":true}!../../../node_modules/vue-loader/lib/style-compiler/index.js?{\"vue\":true,\"id\":\"data-v-2d1c2e66\",\"scoped\":true,\"hasInlineConfig\":false}!../../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./object.vue", function() {
     var newContent = require("!!../../../node_modules/css-loader/index.js?{\"sourceMap\":true}!../../../node_modules/vue-loader/lib/style-compiler/index.js?{\"vue\":true,\"id\":\"data-v-2d1c2e66\",\"scoped\":true,\"hasInlineConfig\":false}!../../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./object.vue");
     if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
     update(newContent);
   });
 }
 // When the module is disposed, remove the <style> tags
 module.hot.dispose(function() { update(); });
}

/***/ }),

/***/ "YChW":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c("el-tag", _vm._b({}, "el-tag", _vm.$props, false), [
    _vm._v("\n  " + _vm._s(_vm.title) + "\n")
  ])
}
var staticRenderFns = []
render._withStripped = true
var esExports = { render: render, staticRenderFns: staticRenderFns }
/* harmony default export */ __webpack_exports__["a"] = (esExports);
if (false) {
  module.hot.accept()
  if (module.hot.data) {
    require("vue-hot-reload-api")      .rerender("data-v-272f7ccc", esExports)
  }
}

/***/ }),

/***/ "YnTr":
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__("i6vT");
if(typeof content === 'string') content = [[module.i, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var update = __webpack_require__("pFN4")("34ce8750", content, false, {});
// Hot Module Replacement
if(false) {
 // When the styles change, update the <style> tags
 if(!content.locals) {
   module.hot.accept("!!../../../node_modules/css-loader/index.js?{\"sourceMap\":true}!../../../node_modules/vue-loader/lib/style-compiler/index.js?{\"vue\":true,\"id\":\"data-v-1b80d924\",\"scoped\":true,\"hasInlineConfig\":false}!../../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./Form.vue", function() {
     var newContent = require("!!../../../node_modules/css-loader/index.js?{\"sourceMap\":true}!../../../node_modules/vue-loader/lib/style-compiler/index.js?{\"vue\":true,\"id\":\"data-v-1b80d924\",\"scoped\":true,\"hasInlineConfig\":false}!../../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./Form.vue");
     if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
     update(newContent);
   });
 }
 // When the module is disposed, remove the <style> tags
 module.hot.dispose(function() { update(); });
}

/***/ }),

/***/ "Ywka":
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__("Vmy+")(true);
// imports


// module
exports.push([module.i, "\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n", "", {"version":3,"sources":[],"names":[],"mappings":"","file":"Breadcrumb.vue","sourceRoot":""}]);

// exports


/***/ }),

/***/ "YyoH":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c(
    "div",
    {
      staticClass: "tree-node",
      class: { "empty-node": !_vm.node.name },
      attrs: { draggable: !!_vm.node.name && _vm.idx !== undefined },
      on: {
        dragover: function($event) {
          $event.preventDefault()
        },
        dragstart: function($event) {
          $event.stopPropagation()
          _vm.handleDragStart($event)
        },
        drop: function($event) {
          $event.stopPropagation()
          _vm.handleDrop($event)
        },
        dragenter: function($event) {
          $event.stopPropagation()
          _vm.handleDragEnter($event)
        },
        dragleave: function($event) {
          $event.stopPropagation()
          _vm.handleDragLeave($event)
        },
        dragend: function($event) {
          $event.preventDefault()
          _vm.handleDragEnd($event)
        }
      }
    },
    [
      _c(
        "div",
        {
          staticClass: "tree-node-name",
          class: [{ "has-name": _vm.node.name }, "idx_" + _vm.idx],
          style: { "padding-left": _vm.level * 16 + 10 + "px" }
        },
        [
          _c(
            "div",
            {
              on: {
                click: function($event) {
                  _vm.emitEvent("nodeRow")
                }
              }
            },
            [
              _c("span", [
                _c("span", { staticClass: "el-tree-node__label" }, [
                  !!_vm.node.__pg_slot__
                    ? _c("span", { staticStyle: { "font-size": "10px" } }, [
                        _vm._v("slot")
                      ])
                    : _vm._e(),
                  _vm._v("\n          " + _vm._s(_vm.node.name) + "\n        ")
                ]),
                _vm._v(" "),
                _vm.node.name && _vm.node.subCom && _vm.node.subCom.length > 0
                  ? _c("i", {
                      class: {
                        "el-icon-arrow-down": _vm.hideChildren,
                        "el-icon-arrow-up": !_vm.hideChildren
                      },
                      on: {
                        click: function($event) {
                          _vm.emitEvent("nodeName")
                        }
                      }
                    })
                  : _vm._e()
              ]),
              _vm._v(" "),
              _vm.node.name
                ? _c(
                    "span",
                    { staticClass: "tree-node-action" },
                    [
                      _c(
                        "el-popover",
                        {
                          attrs: { placement: "right-end", trigger: "click" },
                          model: {
                            value: _vm.showComlib,
                            callback: function($$v) {
                              _vm.showComlib = $$v
                            },
                            expression: "showComlib"
                          }
                        },
                        [
                          _c(
                            "div",
                            { staticClass: "com-lib" },
                            _vm._l(_vm.allComs, function(comType) {
                              return _c(
                                "div",
                                {
                                  key: comType,
                                  staticClass: "com-lib-item",
                                  on: {
                                    click: function($event) {
                                      _vm.emitEvent("addCom", {
                                        comType: comType,
                                        node: _vm.node
                                      })
                                    }
                                  }
                                },
                                [_vm._v(_vm._s(comType))]
                              )
                            })
                          ),
                          _vm._v(" "),
                          _c("i", {
                            staticClass: "el-icon-fa-plus",
                            attrs: { slot: "reference" },
                            on: {
                              click: function($event) {
                                $event.stopPropagation()
                                _vm.emitEvent("add")
                              }
                            },
                            slot: "reference"
                          })
                        ]
                      ),
                      _vm._v(" "),
                      _vm.idx !== undefined
                        ? _c("i", {
                            staticClass: "el-icon-delete",
                            on: {
                              click: function($event) {
                                _vm.emitEvent("delete")
                              }
                            }
                          })
                        : _vm._e()
                    ],
                    1
                  )
                : _vm._e()
            ]
          )
        ]
      ),
      _vm._v(" "),
      _c(
        "div",
        { staticClass: "tree-node-children" },
        _vm._l(_vm.children, function(child, $index) {
          return _c("tree-node", {
            directives: [
              {
                name: "show",
                rawName: "v-show",
                value: !_vm.hideChildren,
                expression: "!hideChildren"
              }
            ],
            key: $index,
            attrs: {
              node: child,
              idx: $index,
              level: _vm.level + 1,
              "all-coms": _vm.allComs,
              type: _vm.type
            },
            model: {
              value: _vm.valueModel,
              callback: function($$v) {
                _vm.valueModel = $$v
              },
              expression: "valueModel"
            }
          })
        })
      )
    ]
  )
}
var staticRenderFns = []
render._withStripped = true
var esExports = { render: render, staticRenderFns: staticRenderFns }
/* harmony default export */ __webpack_exports__["a"] = (esExports);
if (false) {
  module.hot.accept()
  if (module.hot.data) {
    require("vue-hot-reload-api")      .rerender("data-v-453d3eb3", esExports)
  }
}

/***/ }),

/***/ "Z4LF":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c("el-input", {
    attrs: { size: _vm.size, placeholder: "" },
    on: { change: _vm.valChange },
    model: {
      value: _vm.input,
      callback: function($$v) {
        _vm.input = $$v
      },
      expression: "input"
    }
  })
}
var staticRenderFns = []
render._withStripped = true
var esExports = { render: render, staticRenderFns: staticRenderFns }
/* harmony default export */ __webpack_exports__["a"] = (esExports);
if (false) {
  module.hot.accept()
  if (module.hot.data) {
    require("vue-hot-reload-api")      .rerender("data-v-ddc4c6f4", esExports)
  }
}

/***/ }),

/***/ "ZRUf":
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__("Vmy+")(true);
// imports


// module
exports.push([module.i, "\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n", "", {"version":3,"sources":[],"names":[],"mappings":"","file":"boolean.vue","sourceRoot":""}]);

// exports


/***/ }),

/***/ "ZsVe":
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__("Vmy+")(true);
// imports


// module
exports.push([module.i, "\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n", "", {"version":3,"sources":[],"names":[],"mappings":"","file":"Create.vue","sourceRoot":""}]);

// exports


/***/ }),

/***/ "a+xK":
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
//
//
//
//
//
//
//
//
//
//
//

exports.default = {
  name: "PG-Select",
  props: {
    value: {},
    options: Array,
    conf: Object,
    size: {
      default: 'small'
    }
  },
  data: function data() {
    return {
      input: this.value
    };
  },

  methods: {
    valChange: function valChange(input) {
      this.$emit('input', this.input);
    }
  },
  watch: {
    value: function value() {
      this.input = this.value;
    }
  }
};

/***/ }),

/***/ "b/82":
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.hasError = exports.input = undefined;

var _object = __webpack_require__("Kw4U");

var _object2 = _interopRequireDefault(_object);

var _scheme2Input = __webpack_require__("noFo");

var _scheme2Input2 = _interopRequireDefault(_scheme2Input);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var hasError = function hasError(conf) {};

var input = {
    component: _object2.default,
    propsLoader: function propsLoader(conf) {
        return {
            format: conf.format && (0, _scheme2Input2.default)(conf.format)
        };
    }
};

exports.input = input;
exports.hasError = hasError;

/***/ }),

/***/ "b5km":
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__("Vmy+")(true);
// imports


// module
exports.push([module.i, "\n.pg-dialog{\n  margin-left: 20px;\n}\n.pg-dialog-wrapper{\n  left: 220px;\n  right: 500px;\n}\n", "", {"version":3,"sources":["/Users/wang/vue-element-page-generator/src/Components/Components/Dialog/Dialog.vue"],"names":[],"mappings":";AA8CA;EACA,kBAAA;CACA;AACA;EACA,YAAA;EACA,aAAA;CACA","file":"Dialog.vue","sourcesContent":["<template>\n    <el-dialog \n    class=\"pg-dialog-wrapper\"\n    :title=\"title\" \n    :visible.sync=\"show\" \n    :modal=\"false\" \n    :modal-append-to-body=\"false\"\n    :lock-scroll=\"false\"\n    width=\"700px\"\n    top=\"100px\"\n    custom-class=\"pg-dialog\"\n    :close-on-click-modal=\"false\"\n    :close-on-press-escape=\"false\"\n    :show-close=\"false\"\n    :center=\"center\"\n    >\n    <slot></slot>\n    </el-dialog>\n</template>\n<script>\nexport default {\n  name: 'Dialog',\n  props:['title','center','active','subActive'],\n  data() {\n    return {\n      show:true\n    };\n  },\n  created(){\n      this.show = this.active || this.subActive;\n  },\n  methods:{\n     activate(){\n\n     }\n  },\n  watch:{\n    active(){\n      this.show = this.active || this.subActive;\n    },\n    subActive(){\n      this.show = this.active || this.subActive;\n    }\n  }\n};\n</script>\n<style>\n.pg-dialog{\n  margin-left: 20px;\n}\n.pg-dialog-wrapper{\n  left: 220px;\n  right: 500px;\n}\n</style>\n\n"],"sourceRoot":""}]);

// exports


/***/ }),

/***/ "bNZw":
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.hasError = exports.input = undefined;

var _typeof2 = __webpack_require__("WxTP");

var _typeof3 = _interopRequireDefault(_typeof2);

var _select = __webpack_require__("U82Y");

var _select2 = _interopRequireDefault(_select);

var _utils = __webpack_require__("F1cB");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var options = {
    loader: function loader(options) {
        /**
         * options有两种写法，[Object<key,value>]为标准写法，[String]为简写法
         * 实现简写->标准写法的转换
         * etc.['name1','name2'] => [{key,value}]
         */
        return options.reduce(function (arr, item) {
            if ((typeof item === 'undefined' ? 'undefined' : (0, _typeof3.default)(item)) != 'object') {
                arr.push({
                    key: item,
                    value: item
                });
            } else {
                arr.push(item);
            }
            return arr;
        }, []);
    },
    hasError: function hasError(options) {
        if (!Array.isArray(options)) {
            return "options 必须是数组";
        } else {
            var isObject = options.every(function (e) {
                return (0, _utils.isPlainObject)(e);
            });
            if (isObject) {
                var valid = options.every(function (e) {
                    return e.key && e.value;
                });
                if (!valid) {
                    return "options 参数缺少key或value";
                } else {
                    return false;
                }
            }
            return false;
        }
    }
};
var hasError = function hasError(conf) {
    if (conf.options) {
        return options.hasError(conf.options);
    } else {
        return "必须指定 options";
    }
    return false;
};

var input = {
    component: _select2.default,
    propsLoader: function propsLoader(conf) {
        return {
            options: options.loader(conf.options)
        };
    }
};

exports.input = input;
exports.hasError = hasError;

/***/ }),

/***/ "c+bf":
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__("Vmy+")(true);
// imports


// module
exports.push([module.i, "\n#app {\n  font-family: Helvetica, sans-serif;\n}\nbody {\n  margin: 0;\n  background: #f3f3f3;\n}\nul {\n  margin: 0;\n  padding: 0;\n}\n.header {\n  width: 100%;\n}\n.main {\n  box-sizing: border-box;\n  position: absolute;\n  top: 60px;\n  left: 200px;\n  right: 460px;\n  height: calc(100vh - 60px);\n  background-color: whitesmoke;\n  overflow: auto;\n}\n.save-btn {\n  float: right;\n}\n", "", {"version":3,"sources":["/Users/wang/vue-element-page-generator/src/gui/App.vue"],"names":[],"mappings":";AAqBA;EACA,mCAAA;CACA;AACA;EACA,UAAA;EACA,oBAAA;CACA;AACA;EACA,UAAA;EACA,WAAA;CACA;AACA;EACA,YAAA;CACA;AACA;EACA,uBAAA;EACA,mBAAA;EACA,UAAA;EACA,YAAA;EACA,aAAA;EACA,2BAAA;EACA,6BAAA;EACA,eAAA;CACA;AACA;EACA,aAAA;CACA","file":"App.vue","sourcesContent":["<template>\n  <div id=\"app\">\n    <div class=\"header\">\n      <el-menu default-active=\"1\" mode=\"horizontal\" background-color=\"#545c64\"\n  text-color=\"#fff\" active-text-color=\"#ffd04b\" router>\n        <el-menu-item index=\"/\">模板</el-menu-item>\n        <el-menu-item index=\"/create\" >编辑页面</el-menu-item>\n      </el-menu>\n    </div>\n    <router-view></router-view>\n  </div>\n</template>\n\n<script>\nexport default {\n  methods: {\n    \n  }\n};\n</script>\n\n<style>\n#app {\n  font-family: Helvetica, sans-serif;\n}\nbody {\n  margin: 0;\n  background: #f3f3f3;\n}\nul {\n  margin: 0;\n  padding: 0;\n}\n.header {\n  width: 100%;\n}\n.main {\n  box-sizing: border-box;\n  position: absolute;\n  top: 60px;\n  left: 200px;\n  right: 460px;\n  height: calc(100vh - 60px);\n  background-color: whitesmoke;\n  overflow: auto;\n}\n.save-btn {\n  float: right;\n}\n</style>\n"],"sourceRoot":""}]);

// exports


/***/ }),

/***/ "daC0":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c(
    "el-dialog",
    {
      staticClass: "pg-dialog-wrapper",
      attrs: {
        title: _vm.title,
        visible: _vm.show,
        modal: false,
        "modal-append-to-body": false,
        "lock-scroll": false,
        width: "700px",
        top: "100px",
        "custom-class": "pg-dialog",
        "close-on-click-modal": false,
        "close-on-press-escape": false,
        "show-close": false,
        center: _vm.center
      },
      on: {
        "update:visible": function($event) {
          _vm.show = $event
        }
      }
    },
    [_vm._t("default")],
    2
  )
}
var staticRenderFns = []
render._withStripped = true
var esExports = { render: render, staticRenderFns: staticRenderFns }
/* harmony default export */ __webpack_exports__["a"] = (esExports);
if (false) {
  module.hot.accept()
  if (module.hot.data) {
    require("vue-hot-reload-api")      .rerender("data-v-51437f64", esExports)
  }
}

/***/ }),

/***/ "dcAt":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c(
    _vm.comObj.com,
    _vm._b(
      {
        tag: "components",
        staticClass: "pg-com",
        attrs: {
          active: _vm.$store.state.activeComponent.pg === _vm.comObj.pg,
          subActive: _vm.subActive,
          pg: _vm.comObj.pg
        }
      },
      "components",
      _vm.comObj.props,
      false
    ),
    [
      _vm.comObj.subCom && _vm.comObj.subCom.length
        ? _vm._l(_vm.comObj.subCom, function(subCom) {
            return _c("pg-com", {
              key: subCom.pg,
              attrs: { "com-obj": subCom }
            })
          })
        : _vm._e()
    ],
    2
  )
}
var staticRenderFns = []
render._withStripped = true
var esExports = { render: render, staticRenderFns: staticRenderFns }
/* harmony default export */ __webpack_exports__["a"] = (esExports);
if (false) {
  module.hot.accept()
  if (module.hot.data) {
    require("vue-hot-reload-api")      .rerender("data-v-435d020f", esExports)
  }
}

/***/ }),

/***/ "e1Q+":
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__("7skA");
if(typeof content === 'string') content = [[module.i, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var update = __webpack_require__("pFN4")("ce30153c", content, false, {});
// Hot Module Replacement
if(false) {
 // When the styles change, update the <style> tags
 if(!content.locals) {
   module.hot.accept("!!../../../../node_modules/css-loader/index.js?{\"sourceMap\":true}!../../../../node_modules/vue-loader/lib/style-compiler/index.js?{\"vue\":true,\"id\":\"data-v-4259cc0a\",\"scoped\":true,\"hasInlineConfig\":false}!../../../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./Tool.vue", function() {
     var newContent = require("!!../../../../node_modules/css-loader/index.js?{\"sourceMap\":true}!../../../../node_modules/vue-loader/lib/style-compiler/index.js?{\"vue\":true,\"id\":\"data-v-4259cc0a\",\"scoped\":true,\"hasInlineConfig\":false}!../../../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./Tool.vue");
     if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
     update(newContent);
   });
 }
 // When the module is disposed, remove the <style> tags
 module.hot.dispose(function() { update(); });
}

/***/ }),

/***/ "e3gZ":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c("div", [
    _vm.format
      ? _c(
          "div",
          { key: "1" },
          [
            _c(
              "el-table",
              { attrs: { data: _vm.input, size: "mini" } },
              [
                _c("el-table-column", {
                  attrs: { label: "label", "min-width": "30" },
                  scopedSlots: _vm._u([
                    {
                      key: "default",
                      fn: function(scope) {
                        return _c("span", {}, [_vm._v(_vm._s(scope.row.label))])
                      }
                    }
                  ])
                }),
                _vm._v(" "),
                _c("el-table-column", {
                  attrs: { label: "value", "min-width": "40" },
                  scopedSlots: _vm._u([
                    {
                      key: "default",
                      fn: function(scope) {
                        return _c(
                          scope.row.com.input,
                          _vm._b(
                            {
                              tag: "component",
                              attrs: {
                                size: "mini",
                                conf: scope.row.com.conf,
                                "pg-child": ""
                              },
                              on: { input: _vm.handleChange },
                              model: {
                                value: scope.row.value,
                                callback: function($$v) {
                                  _vm.$set(scope.row, "value", $$v)
                                },
                                expression: "scope.row.value"
                              }
                            },
                            "component",
                            scope.row.com.props,
                            false
                          )
                        )
                      }
                    }
                  ])
                })
              ],
              1
            )
          ],
          1
        )
      : _c(
          "div",
          { key: "2" },
          [
            _c(
              "el-table",
              { attrs: { data: _vm.input, size: "mini" } },
              [
                _c("el-table-column", {
                  attrs: { width: "60" },
                  scopedSlots: _vm._u([
                    {
                      key: "default",
                      fn: function(scope) {
                        return _c(
                          "el-button",
                          {
                            attrs: { size: "mini", type: "danger" },
                            on: {
                              click: function($event) {
                                _vm.delRow(scope.$index)
                              }
                            }
                          },
                          [_vm._v(" - ")]
                        )
                      }
                    }
                  ])
                }),
                _vm._v(" "),
                _c("el-table-column", {
                  attrs: { label: "label", "min-width": "30" },
                  scopedSlots: _vm._u([
                    {
                      key: "default",
                      fn: function(scope) {
                        return _c("el-input", {
                          attrs: { size: "mini" },
                          on: { change: _vm.handleChange },
                          model: {
                            value: scope.row.name,
                            callback: function($$v) {
                              _vm.$set(scope.row, "name", $$v)
                            },
                            expression: "scope.row.name"
                          }
                        })
                      }
                    }
                  ])
                }),
                _vm._v(" "),
                _c("el-table-column", {
                  attrs: { label: "value", "min-width": "60" },
                  scopedSlots: _vm._u([
                    {
                      key: "default",
                      fn: function(scope) {
                        return _c("el-input", {
                          attrs: { size: "mini" },
                          on: { change: _vm.handleChange },
                          model: {
                            value: scope.row.value,
                            callback: function($$v) {
                              _vm.$set(scope.row, "value", $$v)
                            },
                            expression: "scope.row.value"
                          }
                        })
                      }
                    }
                  ])
                })
              ],
              1
            ),
            _vm._v(" "),
            _c("div", { staticClass: "add-row", on: { click: _vm.addRow } }, [
              _c("i", { staticClass: "el-icon-plus" })
            ])
          ],
          1
        )
  ])
}
var staticRenderFns = []
render._withStripped = true
var esExports = { render: render, staticRenderFns: staticRenderFns }
/* harmony default export */ __webpack_exports__["a"] = (esExports);
if (false) {
  module.hot.accept()
  if (module.hot.data) {
    require("vue-hot-reload-api")      .rerender("data-v-2d1c2e66", esExports)
  }
}

/***/ }),

/***/ "enBu":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_boolean_vue__ = __webpack_require__("Mbk5");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_boolean_vue___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_boolean_vue__);
/* harmony namespace reexport (unknown) */ for(var __WEBPACK_IMPORT_KEY__ in __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_boolean_vue__) if(__WEBPACK_IMPORT_KEY__ !== 'default') (function(key) { __webpack_require__.d(__webpack_exports__, key, function() { return __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_boolean_vue__[key]; }) }(__WEBPACK_IMPORT_KEY__));
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_6e215a50_hasScoped_true_transformToRequire_video_src_poster_source_src_img_src_image_xlink_href_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_boolean_vue__ = __webpack_require__("XDMU");
var disposed = false
function injectStyle (ssrContext) {
  if (disposed) return
  __webpack_require__("R8Qc")
}
var normalizeComponent = __webpack_require__("mUJo")
/* script */


/* template */

/* template functional */
var __vue_template_functional__ = false
/* styles */
var __vue_styles__ = injectStyle
/* scopeId */
var __vue_scopeId__ = "data-v-6e215a50"
/* moduleIdentifier (server only) */
var __vue_module_identifier__ = null
var Component = normalizeComponent(
  __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_boolean_vue___default.a,
  __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_6e215a50_hasScoped_true_transformToRequire_video_src_poster_source_src_img_src_image_xlink_href_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_boolean_vue__["a" /* default */],
  __vue_template_functional__,
  __vue_styles__,
  __vue_scopeId__,
  __vue_module_identifier__
)
Component.options.__file = "type_parser/boolean/boolean.vue"

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-6e215a50", Component.options)
  } else {
    hotAPI.reload("data-v-6e215a50", Component.options)
  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

/* harmony default export */ __webpack_exports__["default"] = (Component.exports);


/***/ }),

/***/ "fNr2":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_COM_vue__ = __webpack_require__("0Rvm");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_COM_vue___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_COM_vue__);
/* harmony namespace reexport (unknown) */ for(var __WEBPACK_IMPORT_KEY__ in __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_COM_vue__) if(__WEBPACK_IMPORT_KEY__ !== 'default') (function(key) { __webpack_require__.d(__webpack_exports__, key, function() { return __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_COM_vue__[key]; }) }(__WEBPACK_IMPORT_KEY__));
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_435d020f_hasScoped_false_transformToRequire_video_src_poster_source_src_img_src_image_xlink_href_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_COM_vue__ = __webpack_require__("dcAt");
var disposed = false
var normalizeComponent = __webpack_require__("mUJo")
/* script */


/* template */

/* template functional */
var __vue_template_functional__ = false
/* styles */
var __vue_styles__ = null
/* scopeId */
var __vue_scopeId__ = null
/* moduleIdentifier (server only) */
var __vue_module_identifier__ = null
var Component = normalizeComponent(
  __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_COM_vue___default.a,
  __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_435d020f_hasScoped_false_transformToRequire_video_src_poster_source_src_img_src_image_xlink_href_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_COM_vue__["a" /* default */],
  __vue_template_functional__,
  __vue_styles__,
  __vue_scopeId__,
  __vue_module_identifier__
)
Component.options.__file = "Create/DrawBoard/COM.vue"

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-435d020f", Component.options)
  } else {
    hotAPI.reload("data-v-435d020f", Component.options)
  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

/* harmony default export */ __webpack_exports__["default"] = (Component.exports);


/***/ }),

/***/ "gaHL":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_Input_vue__ = __webpack_require__("2UTb");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_Input_vue___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_Input_vue__);
/* harmony namespace reexport (unknown) */ for(var __WEBPACK_IMPORT_KEY__ in __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_Input_vue__) if(__WEBPACK_IMPORT_KEY__ !== 'default') (function(key) { __webpack_require__.d(__webpack_exports__, key, function() { return __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_Input_vue__[key]; }) }(__WEBPACK_IMPORT_KEY__));
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_6fe728ba_hasScoped_true_transformToRequire_video_src_poster_source_src_img_src_image_xlink_href_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_Input_vue__ = __webpack_require__("yF26");
var disposed = false
function injectStyle (ssrContext) {
  if (disposed) return
  __webpack_require__("SAAC")
}
var normalizeComponent = __webpack_require__("mUJo")
/* script */


/* template */

/* template functional */
var __vue_template_functional__ = false
/* styles */
var __vue_styles__ = injectStyle
/* scopeId */
var __vue_scopeId__ = "data-v-6fe728ba"
/* moduleIdentifier (server only) */
var __vue_module_identifier__ = null
var Component = normalizeComponent(
  __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_Input_vue___default.a,
  __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_6fe728ba_hasScoped_true_transformToRequire_video_src_poster_source_src_img_src_image_xlink_href_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_Input_vue__["a" /* default */],
  __vue_template_functional__,
  __vue_styles__,
  __vue_scopeId__,
  __vue_module_identifier__
)
Component.options.__file = "Components/Input/Input.vue"

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-6fe728ba", Component.options)
  } else {
    hotAPI.reload("data-v-6fe728ba", Component.options)
  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

/* harmony default export */ __webpack_exports__["default"] = (Component.exports);


/***/ }),

/***/ "hGph":
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__("Vmy+")(true);
// imports


// module
exports.push([module.i, "\n.main-board {\n  width: 400px;\n  height: 500px;\n  margin:100px auto 0;\n  background-color: white;\n}\n.dialog-board {\n  position: absolute;\n  left: 850px;\n  width: 400px;\n  height: 300px;\n  background-color: white;\n}\n", "", {"version":3,"sources":["/Users/wang/vue-element-page-generator/src/gui/Create/DrawBoard/Create/DrawBoard/DrawBoard.vue"],"names":[],"mappings":";AAwBA;EACA,aAAA;EACA,cAAA;EACA,oBAAA;EACA,wBAAA;CACA;AACA;EACA,mBAAA;EACA,YAAA;EACA,aAAA;EACA,cAAA;EACA,wBAAA;CACA","file":"DrawBoard.vue","sourcesContent":["<template>\n<div class=\"board-wrapper\">\n  <div class=\"main-board\">\n      <pg-com :com-obj=\"comObj\" v-for=\"comObj in $store.getters.components\" :key=\"comObj.pg\"></pg-com>\n  </div>\n\n  <!-- Dialogs -->\n  <pg-com :com-obj=\"comObj\"  v-for=\"comObj in $store.getters.dialogs\" :key=\"comObj.pg\"></pg-com>\n</div>\n</template>\n\n<script>\nimport COM from \"./COM.vue\";\nimport {on,off} from \"element-ui/src/utils/dom\";\nexport default {\n  components: {\n    pgCom: COM\n  },\n  data() {\n    return {};\n  }\n};\n</script>\n\n<style>\n.main-board {\n  width: 400px;\n  height: 500px;\n  margin:100px auto 0;\n  background-color: white;\n}\n.dialog-board {\n  position: absolute;\n  left: 850px;\n  width: 400px;\n  height: 300px;\n  background-color: white;\n}\n</style>\n"],"sourceRoot":""}]);

// exports


/***/ }),

/***/ "hjkg":
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__("Vmy+")(true);
// imports


// module
exports.push([module.i, "\n.item {\n    cursor: pointer;\n}\n.bold {\n    font-weight: bold;\n}\n.treeNodeText {\n    margin: 2px;\n    padding: 0.2rem 0.5rem;\n    width: fit-content;\n    background: #F9FAFC;\n    font-size: 18px;\n    color: #324057;\n}\n.treeMargin {\n    margin-left: 2rem;\n}\n.changeTree {\n    width: 1rem;\n    color: #324057;\n}\n.vue-drag-node-icon {\n    display: inline-block;\n    width: 0;\n    height: 0;\n    padding-right: 3px;\n    border-left: 6px solid black;\n    border-top: 6px solid transparent;\n    border-bottom: 6px solid transparent;\n    border-right: 0 solid yellow;\n    transition: transform .3s ease-in-out;\n}\n.nodeClicked {\n    transform: rotate(90deg);\n}\n", "", {"version":3,"sources":["/Users/wang/vue-element-page-generator/node_modules/node_modules/vue-drag-tree/src/vue-drag-tree.vue"],"names":[],"mappings":";AA2PA;IACA,gBAAA;CACA;AAEA;IACA,kBAAA;CACA;AAEA;IACA,YAAA;IACA,uBAAA;IACA,mBAAA;IACA,oBAAA;IACA,gBAAA;IACA,eAAA;CACA;AAEA;IACA,kBAAA;CACA;AAEA;IACA,YAAA;IACA,eAAA;CACA;AAEA;IACA,sBAAA;IACA,SAAA;IACA,UAAA;IACA,mBAAA;IACA,6BAAA;IACA,kCAAA;IACA,qCAAA;IACA,6BAAA;IACA,sCAAA;CACA;AAEA;IACA,yBAAA;CACA","file":"vue-drag-tree.vue","sourcesContent":["<template>\n    <div>\n        <div :id='model.id' @click=\"toggle\" @dblclick=\"changeType\" draggable='true' @dragstart='dragStart' @dragover='dragOver' @dragenter='dragEnter' @dragleave='dragLeave' @drop='drop' @dragend='dragEnd' class='treeNodeText' @mouseover='mouseOver' @mouseout='mouseOut' :style='styleObj'>\n            <span :class=\"[isClicked ? 'nodeClicked' : '','vue-drag-node-icon']\"></span>\n            {{model.name}}\n            <span @click=\"removeChild(model.id)\" v-if='model.id !=\"0\"'>&nbsp;x</span>\n        </div>\n        <div class='treeMargin' v-show=\"open\" v-if=\"isFolder\">\n            <vue-drag-tree-com42 v-for=\"model in model.children\" :model=\"model\" :key='model.id' :current-highlight='currentHighlight' :default-text='defaultText' 　:hover-color='hoverColor' :highlight-color='highlightColor'>\n            </vue-drag-tree-com42>\n            <div class='changeTree' @click=\"addChild\" @drop='dropPlus' @dragover='dragOverPlus' @dragenter='dragEnterPlus'>+</div>\n        </div>\n    </div>\n</template>\n\n<script>\nlet id = 1000\nlet fromData = ''\nlet toData = ''\nlet fromParentModelChildren = ''  // from 节点的父组件的model\nlet nodeClicked = undefined   // Attention: 递归的所有组件共享同一个＂顶级作用域＂（这个词或许不太正确，但就这个意思）．即：共享上面这几个let变量．这为实现当前节点的高亮提供了基础．\n\nexport default {\n    name: 'VueDragTreeCom42',\n    data: function () {\n        return {\n            open: false,\n            isClicked: false,\n            styleObj: {\n                background: 'white',\n            }\n        }\n    },\n    props: {\n        model: Object,\n        'default-text': String, // 填加节点时显示的默认文本．\n        'current-highlight': Boolean, // 当前节点高亮\n        'hover-color': String,\n        'highlight-color': String,\n    },\n    computed: {\n        isFolder() {\n            return this.model.children &&\n                this.model.children.length\n        },\n    },\n    methods: {\n        toggle() {\n            if (this.isFolder) {\n                this.open = !this.open\n            }\n            // 调用vue-drag-tree的父组件中的方法,以传递出当前被点击的节点的id值\n            let rootTree = this.findRoot()\n            //　API: 对外开放的当前被点击节点的信息\n            rootTree.$parent.curNodeClicked(this.model, this)\n\n            // 纪录节点被点击的状态\n            this.isClicked = !this.isClicked\n\n            // 用户需要节点高亮？　-->　this.currentHighlight ? 高亮 : 不高亮\n            if (this.currentHighlight) {\n                // 第一次点击当前节点．当前节点高亮，遍历重置其他节点的样式\n                if (nodeClicked != this.model.id) {\n                    let treeParent = rootTree.$parent\n\n                    // 遍历重置所有树组件的高亮样式\n                    let nodeStack = [treeParent.$children[0]]\n                    while (nodeStack.length != 0) {\n                        let item = nodeStack.shift()\n                        item.styleObj.background = 'white'\n                        if (item.$children && item.$children.length > 0) {\n                            nodeStack = nodeStack.concat(item.$children)\n                        }\n                    }\n                    // 然后把当前节点的样式设置为高亮\n                    this.styleObj.background = this.highlightColor ? this.highlightColor : '#99A9BF'\n\n                    // 设置为当前节点\n                    nodeClicked = this.model.id\n                }\n            }\n        },\n        exchangeData(rootCom, from, to) {\n            //如果drag的目的地是 + - 符号的话，退出。\n            if (!to || !from || typeof to == 'string' || from.id == to.id) {\n                return\n            }\n\n            from = JSON.parse(JSON.stringify(from))\n            to = JSON.parse(JSON.stringify(to))\n            // copy一个,最后再赋值给state.treeData.这样能保证值的变化都会触发视图刷新(因为JS判断引用类型是否相同是根据内存地址.)\n            let treeData = JSON.parse(JSON.stringify(this.model))\n            let nodeStack = [treeData]\n            let status = 0\n\n            // 如果from或者to节点存在父子/祖辈关系，会报id of undefined的错。这种情况不考虑拖拽功能，所以catch住，返回/return就行\n            try {\n                // 广度优先遍历,找到涉及数据交换的两个对象.然后交换数据.\n                while (!(status === 2)) {\n                    let item = nodeStack.shift()\n                    if (item.id == from.id) {\n                        item.id = to.id\n                        item.name = to.name\n                        if (to.children && to.children.length > 0) {\n                            item['children'] = to.children\n                        } else {\n                            item.children = []\n                        }\n                        status++\n                        //找到后,跳出当前循环.\n                        continue;\n                    }\n                    if (item.id == to.id) {\n                        item.id = from.id\n                        item.name = from.name\n                        if (from.children && from.children.length > 0) {\n                            item['children'] = from.children\n                        } else {\n                            item.children = []\n                        }\n                        status++\n                        //找到后,跳出当前循环.\n                        continue;\n                    }\n                    if (item.children && item.children.length > 0) {\n                        nodeStack = nodeStack.concat(item.children)\n                    }\n                }\n            } catch (e) {\n                return\n            }\n            //API: 对外开放交换后的数据的赋值操作\n            rootCom.assignData(treeData)\n        },\n        changeType() {\n            // 用户需要高亮-->才纪录当前被点击节点\n            if (this.currentHighlight) {\n                nodeClicked = this.model.id\n            }\n            if (!this.isFolder) {\n                this.$set(this.model, 'children', [])\n                this.addChild()\n                this.open = true\n                this.isClicked = true\n            }\n        },\n        mouseOver(e) {\n            if ((this.styleObj.background != '#99A9BF' || this.styleObj.background != this.hightlightColor) && e.target.className === 'treeNodeText') {\n                e.target.style.background = this.hoverColor ? this.hoverColor : '#E5E9F2'\n            }\n        },\n        mouseOut(e) {\n            if ((this.styleObj.background != '#99A9BF' || this.styleObj.background != this.hightlightColor) && e.target.className === 'treeNodeText') {\n                e.target.style.background = 'white'\n            }\n        },\n        findRoot() {\n            // 返回Tree的根,即递归Tree时的最顶层那个vue-drag-tree组件\n            let ok = false\n            let that = this\n            while (!ok) {\n                // 如果父组件有data属性，说明当前组件是Tree组件递归调用发生时的第一个组件。\n                // Warning: 因为是判断data属性是否存在，所有在别人使用该组件时，属性名必须得是data\n                // v1.0.9-update: add another judgement method.\n                if (!/VueDragTreeCom42/.test(that.$parent.$vnode.tag) || that.$parent.data) {\n                    ok = true\n                    // 交换两者的数据 \n                    break\n                }\n                that = that.$parent\n            }\n            return that\n        },\n        addChild() {\n            this.model.children.push({\n                name: this.defaultText ? this.defaultText : 'New Node',\n                id: id++\n            })\n        },\n        removeChild(id) {\n            // 获取父组件的model.children\n            let parent_model_children = this.$parent.model.children\n\n            // 在父组件model.children里删除\n            for (let index in parent_model_children) {\n                // 找到该删的id\n                if (parent_model_children[index].id == id) {\n                    parent_model_children = parent_model_children.splice(index, 1)\n                    break\n                }\n            }\n        },\n        dragStart(e) {\n            // fromData = this.model\n            e.dataTransfer.effectAllowed = \"move\";\n            e.dataTransfer.setData(\"nottext\", e.target.innerHTML);\n            return true\n        },\n        dragEnd(e) {\n            fromData = undefined\n            toData = undefined\n            fromParentModelChildren = undefined\n        },\n        dragOver(e) {\n            e.preventDefault()\n            return true\n        },\n        dragOverPlus(e) {\n            e.preventDefault()\n        },\n        dragEnterPlus(e) {\n        },\n        dragEnter(e) {\n            toData = this.model\n            let rootTree = this.findRoot()\n            rootTree.exchangeData(rootTree.$parent, fromData, toData)\n        },\n        dragLeave(e) {\n            fromData = this.model\n            fromParentModelChildren = this.$parent.model.children\n            // e.target.style.background = '#7B1FA2'\n        },\n        drop(e) {\n            // toData = this.model\n            // e.target.style.background = '#7B1FA2'\n        },\n        dropPlus(e) {\n            // 把from节点插入到当前层级节点的最后一个\n            if (this.model.hasOwnProperty('children')) {\n                this.model.children.push(fromData)\n            } else {\n                this.model.children = [fromData]\n            }\n\n            // 把from节点从之前的节点删除\n            for (let i in fromParentModelChildren) {\n                if (fromParentModelChildren[i].id == fromData.id) {\n                    fromParentModelChildren.splice(i, 1)\n                }\n            }\n        }\n    },\n    beforeCreate() {\n        this.$options.components.item = require('./vue-drag-tree')\n    },\n    created() {\n        // console.log('this.hig', this.highlightColor, '|', this.hoverColor)\n    },\n}\n</script>\n\n<style>\n.item {\n    cursor: pointer;\n}\n\n.bold {\n    font-weight: bold;\n}\n\n.treeNodeText {\n    margin: 2px;\n    padding: 0.2rem 0.5rem;\n    width: fit-content;\n    background: #F9FAFC;\n    font-size: 18px;\n    color: #324057;\n}\n\n.treeMargin {\n    margin-left: 2rem;\n}\n\n.changeTree {\n    width: 1rem;\n    color: #324057;\n}\n\n.vue-drag-node-icon {\n    display: inline-block;\n    width: 0;\n    height: 0;\n    padding-right: 3px;\n    border-left: 6px solid black;\n    border-top: 6px solid transparent;\n    border-bottom: 6px solid transparent;\n    border-right: 0 solid yellow;\n    transition: transform .3s ease-in-out;\n}\n\n.nodeClicked {\n    transform: rotate(90deg);\n}\n</style>\n\n"],"sourceRoot":""}]);

// exports


/***/ }),

/***/ "i6vT":
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__("Vmy+")(true);
// imports


// module
exports.push([module.i, "\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n", "", {"version":3,"sources":[],"names":[],"mappings":"","file":"Form.vue","sourceRoot":""}]);

// exports


/***/ }),

/***/ "ikPJ":
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__("Vmy+")(true);
// imports


// module
exports.push([module.i, "\n.row {\n  display: flex;\n  flex-flow: row wrap;\n  align-items: stretch;\n  width: 100%;\n}\n.col {\n  flex: 0 0 calc(100% / 2 - 1px);\n  box-sizing: border-box;\n  padding-right: 10px;\n}\n.add {\n  position: relative;\n  transition: all 0.5s ease;\n  cursor: pointer;\n  height: 100px;\n}\n.add:hover {\n  background-color: whitesmoke;\n}\n.add i {\n  font-size: 20px;\n  position: absolute;\n  top: 50%;\n  left: 50%;\n  transform: translate(-50%, -50%);\n}\n.pg-table-cell .cell {\n  padding: 0 3px;\n}\n", "", {"version":3,"sources":["/Users/wang/vue-element-page-generator/src/type_parser/type_parser/array/array.vue"],"names":[],"mappings":";AA+FA;EACA,cAAA;EACA,oBAAA;EACA,qBAAA;EACA,YAAA;CACA;AAEA;EACA,+BAAA;EACA,uBAAA;EACA,oBAAA;CACA;AAEA;EACA,mBAAA;EACA,0BAAA;EACA,gBAAA;EACA,cAAA;CACA;AAEA;EACA,6BAAA;CACA;AAEA;EACA,gBAAA;EACA,mBAAA;EACA,SAAA;EACA,UAAA;EACA,iCAAA;CACA;AAEA;EACA,eAAA;CACA","file":"array.vue","sourcesContent":["<template>\n  <div>\n    <el-table :data=\"input\" size=\"mini\" cell-class-name=\"pg-table-cell\" row-key=\"__id__\">\n      <el-table-column width=\"60\">\n        <el-button slot-scope=\"scope\" size=\"mini\" type=\"danger\" @click=\"delRow(scope.$index)\"> - </el-button>\n      </el-table-column>\n      <el-table-column v-for=\"col in _itemCOM\" :label=\"col.label\" :key=\"col.name\">\n        <component \n            slot-scope=\"scope\"\n            :is=\"col.input\" \n            v-bind=\"col.props\" \n            :conf=\"col.conf\" \n            size=\"mini\"\n            v-model=\"scope.row[col.name]\"\n            @input=\"handleChange\">\n        </component>\n      </el-table-column>\n    </el-table>\n    <div class=\"col add\" @click=\"add\"><i class=\"el-icon-plus\"></i></div>\n  </div>\n</template>\n\n<script>\nlet defaultValue;\nexport default {\n  name: \"Array\",\n  props: {\n    conf: {},\n    value: Array,\n    _itemCOM: Array,\n    arrItem: {}\n  },\n  data() {\n    return {\n      cols: [],\n      input: this.value,\n      uuid: 0\n    };\n  },\n  created() {\n    this.input = this.input2Obj(this.value);\n  },\n  methods: {\n    input2Obj(value) {\n      if (this.conf.value[0] === \"object\") {\n        return value.map(e => {\n          return {\n            ...e,\n            __id__: this.uuid++\n          };\n        });\n      } else {\n        return value.map(e => {\n          return {\n            [_itemCOM.name]: e,\n            __id__: this.uuid++\n          };\n        });\n      }\n    },\n    objTOInput(input) {\n      if (this.conf.value[0] === \"object\") {\n        return input.map(e => {\n          e = JSON.parse(JSON.stringify(e));\n          delete e.__id__;\n          return e;\n        });\n      } else {\n        return input.map(e => {\n          return e[_itemCOM.name];\n        });\n      }\n    },\n    add() {\n      this.input.push(\n        this.input2Obj([JSON.parse(JSON.stringify(this.arrItem))])[0]\n      );\n      this.handleChange();\n    },\n    handleChange() {\n      this.$emit(\"input\", this.objTOInput(this.input));\n    },\n    delRow(index) {\n      this.input.splice(index, 1);\n      this.handleChange();\n    }\n  },\n  watch: {\n    value() {\n      this.input = this.input2Obj(this.value);\n    }\n  }\n};\n</script>\n\n<style>\n.row {\n  display: flex;\n  flex-flow: row wrap;\n  align-items: stretch;\n  width: 100%;\n}\n\n.col {\n  flex: 0 0 calc(100% / 2 - 1px);\n  box-sizing: border-box;\n  padding-right: 10px;\n}\n\n.add {\n  position: relative;\n  transition: all 0.5s ease;\n  cursor: pointer;\n  height: 100px;\n}\n\n.add:hover {\n  background-color: whitesmoke;\n}\n\n.add i {\n  font-size: 20px;\n  position: absolute;\n  top: 50%;\n  left: 50%;\n  transform: translate(-50%, -50%);\n}\n\n.pg-table-cell .cell {\n  padding: 0 3px;\n}\n</style>\n\n"],"sourceRoot":""}]);

// exports


/***/ }),

/***/ "jIOo":
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__("Vmy+")(true);
// imports


// module
exports.push([module.i, "\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n", "", {"version":3,"sources":[],"names":[],"mappings":"","file":"Tag.vue","sourceRoot":""}]);

// exports


/***/ }),

/***/ "k1P6":
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),

/***/ "k3QP":
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = {
    "name": 'button',
    "props": [{
        "name": "dialog",
        "label": "打开对话框-选择组件",
        "value": "refer-component"
    }, {
        "name": "title",
        "label": "文本",
        "value": "string"
    }, {
        "name": "size",
        "label": "尺寸",
        "value": "select",
        "options": ["medium", "small", "mini"]
    }, {
        "name": "type",
        "label": "类型",
        "value": "select",
        "options": ["primary", "success", "warning", "danger", "info", "text"]
    }, {
        "name": "plain",
        "label": "是否朴素按钮",
        "value": "boolean"
    }, {
        "name": "round",
        "label": "是否圆形按钮",
        "value": "boolean"
    }, {
        "name": "disabled",
        "label": "是否禁用状态",
        "value": "boolean"
    }, {
        "name": "icon",
        "label": "图标类名",
        "value": "string"
    }]
};

/***/ }),

/***/ "kgg8":
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
//
//
//
//
//
//
//

exports.default = {
  props: {
    conf: {},
    value: String,
    size: {
      default: "small"
    },
    name: String
  },
  data: function data() {
    return {
      input: this.value
    };
  },
  created: function created() {},

  methods: {
    valChange: function valChange(input) {
      this.$emit('input', input);
    }
  },
  watch: {
    value: function value() {
      this.input = this.value;
    }
  }
};

/***/ }),

/***/ "kplG":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_DrawBoard_vue__ = __webpack_require__("rCfX");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_DrawBoard_vue___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_DrawBoard_vue__);
/* harmony namespace reexport (unknown) */ for(var __WEBPACK_IMPORT_KEY__ in __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_DrawBoard_vue__) if(__WEBPACK_IMPORT_KEY__ !== 'default') (function(key) { __webpack_require__.d(__webpack_exports__, key, function() { return __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_DrawBoard_vue__[key]; }) }(__WEBPACK_IMPORT_KEY__));
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_1d86a790_hasScoped_false_transformToRequire_video_src_poster_source_src_img_src_image_xlink_href_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_DrawBoard_vue__ = __webpack_require__("wGLg");
var disposed = false
function injectStyle (ssrContext) {
  if (disposed) return
  __webpack_require__("nY6j")
}
var normalizeComponent = __webpack_require__("mUJo")
/* script */


/* template */

/* template functional */
var __vue_template_functional__ = false
/* styles */
var __vue_styles__ = injectStyle
/* scopeId */
var __vue_scopeId__ = null
/* moduleIdentifier (server only) */
var __vue_module_identifier__ = null
var Component = normalizeComponent(
  __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_DrawBoard_vue___default.a,
  __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_1d86a790_hasScoped_false_transformToRequire_video_src_poster_source_src_img_src_image_xlink_href_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_DrawBoard_vue__["a" /* default */],
  __vue_template_functional__,
  __vue_styles__,
  __vue_scopeId__,
  __vue_module_identifier__
)
Component.options.__file = "Create/DrawBoard/DrawBoard.vue"

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-1d86a790", Component.options)
  } else {
    hotAPI.reload("data-v-1d86a790", Component.options)
  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

/* harmony default export */ __webpack_exports__["default"] = (Component.exports);


/***/ }),

/***/ "lfoz":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c("el-button", _vm._b({}, "el-button", _vm.$props, false), [
    _vm._v(_vm._s(_vm.title))
  ])
}
var staticRenderFns = []
render._withStripped = true
var esExports = { render: render, staticRenderFns: staticRenderFns }
/* harmony default export */ __webpack_exports__["a"] = (esExports);
if (false) {
  module.hot.accept()
  if (module.hot.data) {
    require("vue-hot-reload-api")      .rerender("data-v-ca73f7b8", esExports)
  }
}

/***/ }),

/***/ "luRR":
/***/ (function(module, exports, __webpack_require__) {

"use strict";


//Table
module.exports = {
    "name": "tag",
    "props": [{
        "name": "title",
        "label": "文本",
        "value": "string"
    }, {
        "name": "type",
        "label": "主题",
        "value": "select",
        "options": ["success", "info", "warning", "danger"]
    }, {
        "name": "color",
        "label": "背景色",
        "value": "string"
    }, {
        "name": "hit",
        "label": "是否有边框描边",
        "value": "boolean"
    }, {
        "name": "size",
        "label": "尺寸",
        "value": "select",
        "options": ["medium", "small", "mini"]
    }]
};

/***/ }),

/***/ "mlcZ":
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

exports.default = {
  name: "Object",
  props: {
    value: Object,
    format: Array,
    conf: {}
  },
  data: function data() {
    return {
      input: []
    };
  },
  created: function created() {
    if (this.format) {
      this.input = this.obj2Array(this.value);
    }
  },

  methods: {
    obj2Array: function obj2Array(obj) {
      var _this = this;

      var arr = [];

      var _loop = function _loop(key) {
        var arrItem = {
          label: key,
          name: key,
          value: obj[key]
        };
        if (_this.format) {
          _this.format.some(function (item) {
            if (arrItem.name === item.name) {
              arrItem.label = item.label;
              arrItem.com = item;
              return true;
            }
          });
        }
        arr.push(arrItem);
      };

      for (var key in obj) {
        _loop(key);
      }
      return arr;
    },
    arr2Obj: function arr2Obj(arr) {
      return arr.reduce(function (obj, arrItem) {
        obj[arrItem.name] = arrItem.value;
        return obj;
      }, {});
    },

    //自由格式对象
    addRow: function addRow() {
      this.input.push({
        label: "",
        name: "",
        value: ""
      });
    },

    //自由格式对象
    delRow: function delRow(index) {
      this.input.splice(index, 1);
      this.inputArg();
    },
    handleChange: function handleChange() {
      this.inputArg();
    },
    inputArg: function inputArg() {
      this.$emit("input", this.arr2Obj(this.input));
    }
  },
  watch: {
    value: function value() {
      if (this.format) {
        this.input = this.obj2Array(this.value);
      }
    }
  }
};

/***/ }),

/***/ "nY6j":
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__("hGph");
if(typeof content === 'string') content = [[module.i, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var update = __webpack_require__("pFN4")("75d097ae", content, false, {});
// Hot Module Replacement
if(false) {
 // When the styles change, update the <style> tags
 if(!content.locals) {
   module.hot.accept("!!../../../../node_modules/css-loader/index.js?{\"sourceMap\":true}!../../../../node_modules/vue-loader/lib/style-compiler/index.js?{\"vue\":true,\"id\":\"data-v-1d86a790\",\"scoped\":false,\"hasInlineConfig\":false}!../../../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./DrawBoard.vue", function() {
     var newContent = require("!!../../../../node_modules/css-loader/index.js?{\"sourceMap\":true}!../../../../node_modules/vue-loader/lib/style-compiler/index.js?{\"vue\":true,\"id\":\"data-v-1d86a790\",\"scoped\":false,\"hasInlineConfig\":false}!../../../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./DrawBoard.vue");
     if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
     update(newContent);
   });
 }
 // When the module is disposed, remove the <style> tags
 module.hot.dispose(function() { update(); });
}

/***/ }),

/***/ "noFo":
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

exports.default = function (config) {
    var inputs = [];
    config.forEach(function (conf) {
        var input = getInput(conf.value);
        inputs = inputs.concat({
            name: conf.name,
            label: conf.label,
            input: input.component,
            props: input.propsLoader(conf),
            conf: conf
        });
    });
    return inputs;
};

var _string = __webpack_require__("Ehk1");

var _boolean = __webpack_require__("A/U0");

var _object = __webpack_require__("b/82");

var _array = __webpack_require__("UNOE");

var _select = __webpack_require__("bNZw");

var _number = __webpack_require__("OSsu");

var _slotComponent = __webpack_require__("9K0A");

var _referComponent = __webpack_require__("x/c1");

var TYPES = {
    string: _string.input,
    boolean: _boolean.input,
    object: _object.input,
    array: _array.input,
    select: _select.input,
    number: _number.input,
    slot_component: _slotComponent.input,
    refer_component: _referComponent.input
};

/**
 * @param {*} type 输入类型
 * @return Loader
 */
function getInput(type) {
    if (typeof type == 'string' && TYPES[type]) {
        return TYPES[type];
    } else if (type == 'slot-component') {
        return TYPES.slot_component;
    } else if (type == 'refer-component') {
        return TYPES.refer_component;
    } else if (Array.isArray(type) && type.length == 1) {
        return TYPES.array;
    }
}

/***/ }),

/***/ "nsKq":
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

exports.default = {
  name: "PG-REFER-COMPONENT",
  props: {
    value: Object,
    options: Array,
    conf: Object,
    size: {
      default: "small"
    }
  },
  data: function data() {
    return {
      input: ""
    };
  },
  created: function created() {
    this.input = this.val2inp(this.value);
  },

  methods: {
    val2inp: function val2inp(val) {
      return val.value;
    },
    inp2val: function inp2val(inp) {
      return {
        type: "__pg_type_refer_component__",
        value: inp
      };
    },
    valChange: function valChange(input) {
      this.$emit("input", this.inp2val(this.input));
    }
  },
  watch: {
    value: function value() {
      this.input = this.val2inp(this.value);
    }
  }
};

/***/ }),

/***/ "oMFZ":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c(
    "div",
    { staticClass: "setting" },
    [
      _vm.$store.state.activeComponent
        ? _c(
            "el-form",
            {
              key: _vm.$store.state.activeComponent.pg,
              attrs: {
                "label-suffix": ":",
                "label-position": "left",
                "label-width": "80px"
              }
            },
            [
              _c(
                "el-form-item",
                { attrs: { label: "组件名称" } },
                [
                  _c(_vm.StringInput, {
                    tag: "component",
                    attrs: {
                      name: "name",
                      value: _vm.$store.state.activeComponent.props["name"]
                    },
                    on: {
                      input: function($event) {
                        _vm.handleInput("name", $event)
                      }
                    }
                  })
                ],
                1
              ),
              _vm._v(" "),
              _vm._l(_vm.$store.getters.activeComponentSetting, function(
                item,
                idx
              ) {
                return [
                  _c(
                    "el-form-item",
                    { key: idx, attrs: { label: item.label } },
                    [
                      _c(
                        item.input,
                        _vm._b(
                          {
                            tag: "component",
                            attrs: {
                              arrItem:
                                _vm.$store.state.activeComponent.props[
                                  "_" + item.name
                                ],
                              value:
                                _vm.$store.state.activeComponent.props[
                                  item.name
                                ],
                              conf: item.conf
                            },
                            on: {
                              input: function($event) {
                                _vm.handleInput(item.name, $event)
                              }
                            }
                          },
                          "component",
                          item.props,
                          false
                        )
                      )
                    ],
                    1
                  ),
                  _vm._v(" "),
                  item.props.subInput &&
                  item.props.subInput.length &&
                  _vm.$store.state.activeComponent.props[item.name]
                    ? _c(
                        "div",
                        { key: idx + "expand", staticClass: "expand" },
                        _vm._l(item.props.subInput, function(subInput, idx) {
                          return _c(
                            "el-form-item",
                            { key: idx, attrs: { label: subInput.label } },
                            [
                              _c(
                                subInput.input,
                                _vm._b(
                                  {
                                    tag: "component",
                                    attrs: {
                                      arrItem:
                                        _vm.$store.state.activeComponent.props[
                                          "_" + subInput.name
                                        ],
                                      value:
                                        _vm.$store.state.activeComponent.props[
                                          subInput.name
                                        ],
                                      conf: subInput.conf
                                    },
                                    on: {
                                      input: function($event) {
                                        _vm.handleInput(subInput.name, $event)
                                      }
                                    }
                                  },
                                  "component",
                                  subInput.props,
                                  false
                                )
                              )
                            ],
                            1
                          )
                        })
                      )
                    : _vm._e()
                ]
              })
            ],
            2
          )
        : _vm._e()
    ],
    1
  )
}
var staticRenderFns = []
render._withStripped = true
var esExports = { render: render, staticRenderFns: staticRenderFns }
/* harmony default export */ __webpack_exports__["a"] = (esExports);
if (false) {
  module.hot.accept()
  if (module.hot.data) {
    require("vue-hot-reload-api")      .rerender("data-v-a888106c", esExports)
  }
}

/***/ }),

/***/ "oZM6":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c(
    "div",
    [
      _c("setting-board"),
      _vm._v(" "),
      _c(
        "div",
        { staticClass: "main" },
        [
          _c(
            "el-button",
            { staticClass: "save-btn", on: { click: _vm.save } },
            [_vm._v("save")]
          ),
          _vm._v(" "),
          _c("draw-board")
        ],
        1
      ),
      _vm._v(" "),
      _c("my-tool")
    ],
    1
  )
}
var staticRenderFns = []
render._withStripped = true
var esExports = { render: render, staticRenderFns: staticRenderFns }
/* harmony default export */ __webpack_exports__["a"] = (esExports);
if (false) {
  module.hot.accept()
  if (module.hot.data) {
    require("vue-hot-reload-api")      .rerender("data-v-31e3ab51", esExports)
  }
}

/***/ }),

/***/ "p3wj":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_Dialog_vue__ = __webpack_require__("qvg0");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_Dialog_vue___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_Dialog_vue__);
/* harmony namespace reexport (unknown) */ for(var __WEBPACK_IMPORT_KEY__ in __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_Dialog_vue__) if(__WEBPACK_IMPORT_KEY__ !== 'default') (function(key) { __webpack_require__.d(__webpack_exports__, key, function() { return __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_Dialog_vue__[key]; }) }(__WEBPACK_IMPORT_KEY__));
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_51437f64_hasScoped_false_transformToRequire_video_src_poster_source_src_img_src_image_xlink_href_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_Dialog_vue__ = __webpack_require__("daC0");
var disposed = false
function injectStyle (ssrContext) {
  if (disposed) return
  __webpack_require__("Is3s")
}
var normalizeComponent = __webpack_require__("mUJo")
/* script */


/* template */

/* template functional */
var __vue_template_functional__ = false
/* styles */
var __vue_styles__ = injectStyle
/* scopeId */
var __vue_scopeId__ = null
/* moduleIdentifier (server only) */
var __vue_module_identifier__ = null
var Component = normalizeComponent(
  __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_Dialog_vue___default.a,
  __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_51437f64_hasScoped_false_transformToRequire_video_src_poster_source_src_img_src_image_xlink_href_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_Dialog_vue__["a" /* default */],
  __vue_template_functional__,
  __vue_styles__,
  __vue_scopeId__,
  __vue_module_identifier__
)
Component.options.__file = "Components/Dialog/Dialog.vue"

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-51437f64", Component.options)
  } else {
    hotAPI.reload("data-v-51437f64", Component.options)
  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

/* harmony default export */ __webpack_exports__["default"] = (Component.exports);


/***/ }),

/***/ "qUYg":
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__("Vmy+")(true);
// imports


// module
exports.push([module.i, "\n@charset \"UTF-8\";\n.tree-node[data-v-453d3eb3] {\n  /* 普通节点 */\n  /*display: list-item;*/\n  /*list-style: none;*/\n  /*border-left: 1px dashed #ccc;*/\n}\n.tree-node.empty-node[data-v-453d3eb3] {\n  /* 空节点 */\n  height: 5px;\n  list-style-type: none;\n}\n.tree-node-name.has-name[data-v-453d3eb3] {\n  min-height: 16px;\n  position: relative;\n}\n.tree-node-name.has-name.idx_undefined .tree-node-action[data-v-453d3eb3] {\n    display: inline-block !important;\n}\n.tree-node-name.has-name .tree-node-action[data-v-453d3eb3] {\n    margin-left: 15px;\n    font-size: 14px;\n    display: none;\n}\n.tree-node-name.has-name .tree-node-action i[data-v-453d3eb3] {\n      cursor: pointer;\n      color: #1ab394;\n      margin-right: 15px;\n}\n.tree-node-name.has-name .tree-node-action i.el-icon-iconfont-tianjia[data-v-453d3eb3] {\n        font-size: 16px !important;\n}\n.tree-node-name.has-name[data-v-453d3eb3]:hover:not(.idx_undefined) {\n    background: rgba(26, 179, 148, 0.1);\n    box-shadow: 0 2px 10px -2px rgba(26, 179, 148, 0.3);\n}\n.tree-node-name.has-name:hover:not(.idx_undefined) .tree-node-action[data-v-453d3eb3] {\n      display: inline-block;\n      height: 14px;\n}\n.tree-node-name.has-name .el-tree-node__label[data-v-453d3eb3] {\n    margin-left: 5px;\n    line-height: 28px;\n}\n.el-icon-arrow-down[data-v-453d3eb3],\n.el-icon-arrow-up[data-v-453d3eb3] {\n  line-height: 34px;\n}\n.el-icon-arrow-down[data-v-453d3eb3]:before,\n  .el-icon-arrow-up[data-v-453d3eb3]:before {\n    font-size: 12px !important;\n    color: #999;\n}\n.com-lib[data-v-453d3eb3] {\n  width: 150px;\n}\n.com-lib-item[data-v-453d3eb3] {\n  display: inline-block;\n  width: 75px;\n  height: 75px;\n  line-height: 75px;\n  text-align: center;\n  border-radius: 10px;\n}\n.com-lib-item[data-v-453d3eb3]:hover {\n  background-color: whitesmoke;\n}\n", "", {"version":3,"sources":["/Users/wang/vue-element-page-generator/src/gui/Create/Tool/Hierarchy.vue","/Users/wang/vue-element-page-generator/src/gui/Create/Tool/Hierarchy.vue"],"names":[],"mappings":";AAAA,iBAAiB;ACyRjB;EACE,UAAA;EACA,uBAAuB;EACvB,qBAAqB;EACrB,iCAAiC;CAClC;AACD;EACE,SAAA;EACA,YAAW;EACX,sBAAqB;CACtB;AACD;EACE,iBAAgB;EAChB,mBAAkB;CAgCnB;AAlCD;IAKM,iCAAgC;CACjC;AANL;IASI,kBAAiB;IACjB,gBAAe;IACf,cAAa;CASd;AApBH;MAaM,gBAAe;MACf,eA3BiB;MA4BjB,mBAAkB;CAInB;AAnBL;QAiBQ,2BAA0B;CAC3B;AAlBP;IAsBI,oCAAmC;IAEnC,oDAAmD;CAKpD;AA7BH;MA0BM,sBAAqB;MACrB,aAAY;CACb;AA5BL;IA+BI,iBAAgB;IAChB,kBAAiB;CAClB;AAEH;;EAEE,kBAAiB;CAKlB;AAPD;;IAII,2BAA0B;IAC1B,YApD0B;CAqD3B;AAEH;EACE,aAAY;CACb;AACD;EACE,sBAAqB;EACrB,YAAW;EACX,aAAY;EACZ,kBAAiB;EACjB,mBAAkB;EAClB,oBAAmB;CACpB;AACD;EACE,6BAA4B;CAC7B","file":"Hierarchy.vue","sourcesContent":["@charset \"UTF-8\";\n.tree-node {\n  /* 普通节点 */\n  /*display: list-item;*/\n  /*list-style: none;*/\n  /*border-left: 1px dashed #ccc;*/ }\n\n.tree-node.empty-node {\n  /* 空节点 */\n  height: 5px;\n  list-style-type: none; }\n\n.tree-node-name.has-name {\n  min-height: 16px;\n  position: relative; }\n  .tree-node-name.has-name.idx_undefined .tree-node-action {\n    display: inline-block !important; }\n  .tree-node-name.has-name .tree-node-action {\n    margin-left: 15px;\n    font-size: 14px;\n    display: none; }\n    .tree-node-name.has-name .tree-node-action i {\n      cursor: pointer;\n      color: #1ab394;\n      margin-right: 15px; }\n      .tree-node-name.has-name .tree-node-action i.el-icon-iconfont-tianjia {\n        font-size: 16px !important; }\n  .tree-node-name.has-name:hover:not(.idx_undefined) {\n    background: rgba(26, 179, 148, 0.1);\n    box-shadow: 0 2px 10px -2px rgba(26, 179, 148, 0.3); }\n    .tree-node-name.has-name:hover:not(.idx_undefined) .tree-node-action {\n      display: inline-block;\n      height: 14px; }\n  .tree-node-name.has-name .el-tree-node__label {\n    margin-left: 5px;\n    line-height: 28px; }\n\n.el-icon-arrow-down,\n.el-icon-arrow-up {\n  line-height: 34px; }\n  .el-icon-arrow-down:before,\n  .el-icon-arrow-up:before {\n    font-size: 12px !important;\n    color: #999; }\n\n.com-lib {\n  width: 150px; }\n\n.com-lib-item {\n  display: inline-block;\n  width: 75px;\n  height: 75px;\n  line-height: 75px;\n  text-align: center;\n  border-radius: 10px; }\n\n.com-lib-item:hover {\n  background-color: whitesmoke; }\n","\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n$color-primary: #1ab394;\n$color-extra-light-black: #999;\n.tree-node {\n  /* 普通节点 */\n  /*display: list-item;*/\n  /*list-style: none;*/\n  /*border-left: 1px dashed #ccc;*/\n}\n.tree-node.empty-node {\n  /* 空节点 */\n  height: 5px;\n  list-style-type: none;\n}\n.tree-node-name.has-name {\n  min-height: 16px;\n  position: relative;\n  &.idx_undefined {\n    .tree-node-action {\n      display: inline-block !important;\n    }\n  }\n  .tree-node-action {\n    margin-left: 15px;\n    font-size: 14px;\n    display: none;\n    i {\n      cursor: pointer;\n      color: $color-primary;\n      margin-right: 15px;\n      &.el-icon-iconfont-tianjia {\n        font-size: 16px !important;\n      }\n    }\n  }\n  &:hover:not(.idx_undefined) {\n    background: rgba(26, 179, 148, 0.1);\n    // color: $color-primary;\n    box-shadow: 0 2px 10px -2px rgba(26, 179, 148, 0.3);\n    .tree-node-action {\n      display: inline-block;\n      height: 14px;\n    }\n  }\n  .el-tree-node__label {\n    margin-left: 5px;\n    line-height: 28px;\n  }\n}\n.el-icon-arrow-down,\n.el-icon-arrow-up {\n  line-height: 34px;\n  &:before {\n    font-size: 12px !important;\n    color: $color-extra-light-black;\n  }\n}\n.com-lib {\n  width: 150px;\n}\n.com-lib-item {\n  display: inline-block;\n  width: 75px;\n  height: 75px;\n  line-height: 75px;\n  text-align: center;\n  border-radius: 10px;\n}\n.com-lib-item:hover {\n  background-color: whitesmoke;\n}\n"],"sourceRoot":""}]);

// exports


/***/ }),

/***/ "qqo4":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_SettingBoard_vue__ = __webpack_require__("Ksto");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_SettingBoard_vue___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_SettingBoard_vue__);
/* harmony namespace reexport (unknown) */ for(var __WEBPACK_IMPORT_KEY__ in __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_SettingBoard_vue__) if(__WEBPACK_IMPORT_KEY__ !== 'default') (function(key) { __webpack_require__.d(__webpack_exports__, key, function() { return __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_SettingBoard_vue__[key]; }) }(__WEBPACK_IMPORT_KEY__));
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_a888106c_hasScoped_true_transformToRequire_video_src_poster_source_src_img_src_image_xlink_href_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_SettingBoard_vue__ = __webpack_require__("oMFZ");
var disposed = false
function injectStyle (ssrContext) {
  if (disposed) return
  __webpack_require__("119C")
}
var normalizeComponent = __webpack_require__("mUJo")
/* script */


/* template */

/* template functional */
var __vue_template_functional__ = false
/* styles */
var __vue_styles__ = injectStyle
/* scopeId */
var __vue_scopeId__ = "data-v-a888106c"
/* moduleIdentifier (server only) */
var __vue_module_identifier__ = null
var Component = normalizeComponent(
  __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_SettingBoard_vue___default.a,
  __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_a888106c_hasScoped_true_transformToRequire_video_src_poster_source_src_img_src_image_xlink_href_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_SettingBoard_vue__["a" /* default */],
  __vue_template_functional__,
  __vue_styles__,
  __vue_scopeId__,
  __vue_module_identifier__
)
Component.options.__file = "Create/SettingBoard/SettingBoard.vue"

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-a888106c", Component.options)
  } else {
    hotAPI.reload("data-v-a888106c", Component.options)
  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

/* harmony default export */ __webpack_exports__["default"] = (Component.exports);


/***/ }),

/***/ "qvg0":
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

exports.default = {
  name: 'Dialog',
  props: ['title', 'center', 'active', 'subActive'],
  data: function data() {
    return {
      show: true
    };
  },
  created: function created() {
    this.show = this.active || this.subActive;
  },

  methods: {
    activate: function activate() {}
  },
  watch: {
    active: function active() {
      this.show = this.active || this.subActive;
    },
    subActive: function subActive() {
      this.show = this.active || this.subActive;
    }
  }
};

/***/ }),

/***/ "qyNe":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c(
    "div",
    [
      _c(
        "el-table",
        {
          attrs: {
            data: _vm.input,
            size: "mini",
            "cell-class-name": "pg-table-cell",
            "row-key": "__id__"
          }
        },
        [
          _c("el-table-column", {
            attrs: { width: "60" },
            scopedSlots: _vm._u([
              {
                key: "default",
                fn: function(scope) {
                  return _c(
                    "el-button",
                    {
                      attrs: { size: "mini", type: "danger" },
                      on: {
                        click: function($event) {
                          _vm.delRow(scope.$index)
                        }
                      }
                    },
                    [_vm._v(" - ")]
                  )
                }
              }
            ])
          }),
          _vm._v(" "),
          _vm._l(_vm._itemCOM, function(col) {
            return _c("el-table-column", {
              key: col.name,
              attrs: { label: col.label },
              scopedSlots: _vm._u([
                {
                  key: "default",
                  fn: function(scope) {
                    return _c(
                      col.input,
                      _vm._b(
                        {
                          tag: "component",
                          attrs: { conf: col.conf, size: "mini" },
                          on: { input: _vm.handleChange },
                          model: {
                            value: scope.row[col.name],
                            callback: function($$v) {
                              _vm.$set(scope.row, col.name, $$v)
                            },
                            expression: "scope.row[col.name]"
                          }
                        },
                        "component",
                        col.props,
                        false
                      )
                    )
                  }
                }
              ])
            })
          })
        ],
        2
      ),
      _vm._v(" "),
      _c("div", { staticClass: "col add", on: { click: _vm.add } }, [
        _c("i", { staticClass: "el-icon-plus" })
      ])
    ],
    1
  )
}
var staticRenderFns = []
render._withStripped = true
var esExports = { render: render, staticRenderFns: staticRenderFns }
/* harmony default export */ __webpack_exports__["a"] = (esExports);
if (false) {
  module.hot.accept()
  if (module.hot.data) {
    require("vue-hot-reload-api")      .rerender("data-v-6a437f3a", esExports)
  }
}

/***/ }),

/***/ "rA6G":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_Create_vue__ = __webpack_require__("UL2/");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_Create_vue___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_Create_vue__);
/* harmony namespace reexport (unknown) */ for(var __WEBPACK_IMPORT_KEY__ in __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_Create_vue__) if(__WEBPACK_IMPORT_KEY__ !== 'default') (function(key) { __webpack_require__.d(__webpack_exports__, key, function() { return __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_Create_vue__[key]; }) }(__WEBPACK_IMPORT_KEY__));
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_31e3ab51_hasScoped_true_transformToRequire_video_src_poster_source_src_img_src_image_xlink_href_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_Create_vue__ = __webpack_require__("oZM6");
var disposed = false
function injectStyle (ssrContext) {
  if (disposed) return
  __webpack_require__("VacL")
}
var normalizeComponent = __webpack_require__("mUJo")
/* script */


/* template */

/* template functional */
var __vue_template_functional__ = false
/* styles */
var __vue_styles__ = injectStyle
/* scopeId */
var __vue_scopeId__ = "data-v-31e3ab51"
/* moduleIdentifier (server only) */
var __vue_module_identifier__ = null
var Component = normalizeComponent(
  __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_Create_vue___default.a,
  __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_31e3ab51_hasScoped_true_transformToRequire_video_src_poster_source_src_img_src_image_xlink_href_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_Create_vue__["a" /* default */],
  __vue_template_functional__,
  __vue_styles__,
  __vue_scopeId__,
  __vue_module_identifier__
)
Component.options.__file = "Create/Create.vue"

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-31e3ab51", Component.options)
  } else {
    hotAPI.reload("data-v-31e3ab51", Component.options)
  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

/* harmony default export */ __webpack_exports__["default"] = (Component.exports);


/***/ }),

/***/ "rCfX":
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _COM = __webpack_require__("fNr2");

var _COM2 = _interopRequireDefault(_COM);

var _dom = __webpack_require__("Bq9f");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

//
//
//
//
//
//
//
//
//
//
//

exports.default = {
  components: {
    pgCom: _COM2.default
  },
  data: function data() {
    return {};
  }
};

/***/ }),

/***/ "rSE8":
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _vue = __webpack_require__("X9e9");

var _vue2 = _interopRequireDefault(_vue);

var _vueRouter = __webpack_require__("Gegd");

var _vueRouter2 = _interopRequireDefault(_vueRouter);

var _Templates = __webpack_require__("22Ya");

var _Templates2 = _interopRequireDefault(_Templates);

var _Create = __webpack_require__("rA6G");

var _Create2 = _interopRequireDefault(_Create);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_vue2.default.use(_vueRouter2.default);

exports.default = new _vueRouter2.default({
  routes: [{
    path: '/',
    name: 'templates',
    component: _Templates2.default
  }, {
    path: '/create/:template?',
    name: 'create',
    component: _Create2.default
  }]
});

/***/ }),

/***/ "riBw":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_Table_vue__ = __webpack_require__("7n1y");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_Table_vue___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_Table_vue__);
/* harmony namespace reexport (unknown) */ for(var __WEBPACK_IMPORT_KEY__ in __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_Table_vue__) if(__WEBPACK_IMPORT_KEY__ !== 'default') (function(key) { __webpack_require__.d(__webpack_exports__, key, function() { return __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_Table_vue__[key]; }) }(__WEBPACK_IMPORT_KEY__));
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_2405cc7c_hasScoped_true_transformToRequire_video_src_poster_source_src_img_src_image_xlink_href_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_Table_vue__ = __webpack_require__("Njca");
var disposed = false
function injectStyle (ssrContext) {
  if (disposed) return
  __webpack_require__("syAY")
}
var normalizeComponent = __webpack_require__("mUJo")
/* script */


/* template */

/* template functional */
var __vue_template_functional__ = false
/* styles */
var __vue_styles__ = injectStyle
/* scopeId */
var __vue_scopeId__ = "data-v-2405cc7c"
/* moduleIdentifier (server only) */
var __vue_module_identifier__ = null
var Component = normalizeComponent(
  __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_Table_vue___default.a,
  __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_2405cc7c_hasScoped_true_transformToRequire_video_src_poster_source_src_img_src_image_xlink_href_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_Table_vue__["a" /* default */],
  __vue_template_functional__,
  __vue_styles__,
  __vue_scopeId__,
  __vue_module_identifier__
)
Component.options.__file = "Components/Table/Table.vue"

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-2405cc7c", Component.options)
  } else {
    hotAPI.reload("data-v-2405cc7c", Component.options)
  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

/* harmony default export */ __webpack_exports__["default"] = (Component.exports);


/***/ }),

/***/ "sKOe":
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__("PVA4");
if(typeof content === 'string') content = [[module.i, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var update = __webpack_require__("pFN4")("44edb44f", content, false, {});
// Hot Module Replacement
if(false) {
 // When the styles change, update the <style> tags
 if(!content.locals) {
   module.hot.accept("!!../../../node_modules/css-loader/index.js?{\"sourceMap\":true}!../../../node_modules/vue-loader/lib/style-compiler/index.js?{\"vue\":true,\"id\":\"data-v-7077c805\",\"scoped\":true,\"hasInlineConfig\":false}!../../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./Templates.vue", function() {
     var newContent = require("!!../../../node_modules/css-loader/index.js?{\"sourceMap\":true}!../../../node_modules/vue-loader/lib/style-compiler/index.js?{\"vue\":true,\"id\":\"data-v-7077c805\",\"scoped\":true,\"hasInlineConfig\":false}!../../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./Templates.vue");
     if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
     update(newContent);
   });
 }
 // When the module is disposed, remove the <style> tags
 module.hot.dispose(function() { update(); });
}

/***/ }),

/***/ "sM2O":
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__("5txc");
if(typeof content === 'string') content = [[module.i, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var update = __webpack_require__("pFN4")("35866563", content, false, {});
// Hot Module Replacement
if(false) {
 // When the styles change, update the <style> tags
 if(!content.locals) {
   module.hot.accept("!!../../../node_modules/css-loader/index.js?{\"sourceMap\":true}!../../../node_modules/vue-loader/lib/style-compiler/index.js?{\"vue\":true,\"id\":\"data-v-ca73f7b8\",\"scoped\":true,\"hasInlineConfig\":false}!../../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./Button.vue", function() {
     var newContent = require("!!../../../node_modules/css-loader/index.js?{\"sourceMap\":true}!../../../node_modules/vue-loader/lib/style-compiler/index.js?{\"vue\":true,\"id\":\"data-v-ca73f7b8\",\"scoped\":true,\"hasInlineConfig\":false}!../../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./Button.vue");
     if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
     update(newContent);
   });
 }
 // When the module is disposed, remove the <style> tags
 module.hot.dispose(function() { update(); });
}

/***/ }),

/***/ "syAY":
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__("7kUT");
if(typeof content === 'string') content = [[module.i, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var update = __webpack_require__("pFN4")("c8e1a5a2", content, false, {});
// Hot Module Replacement
if(false) {
 // When the styles change, update the <style> tags
 if(!content.locals) {
   module.hot.accept("!!../../../node_modules/css-loader/index.js?{\"sourceMap\":true}!../../../node_modules/vue-loader/lib/style-compiler/index.js?{\"vue\":true,\"id\":\"data-v-2405cc7c\",\"scoped\":true,\"hasInlineConfig\":false}!../../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./Table.vue", function() {
     var newContent = require("!!../../../node_modules/css-loader/index.js?{\"sourceMap\":true}!../../../node_modules/vue-loader/lib/style-compiler/index.js?{\"vue\":true,\"id\":\"data-v-2405cc7c\",\"scoped\":true,\"hasInlineConfig\":false}!../../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./Table.vue");
     if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
     update(newContent);
   });
 }
 // When the module is disposed, remove the <style> tags
 module.hot.dispose(function() { update(); });
}

/***/ }),

/***/ "uB5r":
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
//
//
//
//
//
//
//

exports.default = {
  props: {
    conf: {},
    value: String,
    size: {
      default: "small"
    }
  },
  data: function data() {
    return {
      input: this.value
    };
  },
  created: function created() {},

  methods: {
    valChange: function valChange(input) {
      this.$emit('input', input);
    }
  },
  watch: {
    value: function value() {
      this.input = this.value;
    }
  }
};

/***/ }),

/***/ "va7i":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_Hierarchy_vue__ = __webpack_require__("wpJ8");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_Hierarchy_vue___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_Hierarchy_vue__);
/* harmony namespace reexport (unknown) */ for(var __WEBPACK_IMPORT_KEY__ in __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_Hierarchy_vue__) if(__WEBPACK_IMPORT_KEY__ !== 'default') (function(key) { __webpack_require__.d(__webpack_exports__, key, function() { return __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_Hierarchy_vue__[key]; }) }(__WEBPACK_IMPORT_KEY__));
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_453d3eb3_hasScoped_true_transformToRequire_video_src_poster_source_src_img_src_image_xlink_href_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_Hierarchy_vue__ = __webpack_require__("YyoH");
var disposed = false
function injectStyle (ssrContext) {
  if (disposed) return
  __webpack_require__("OnC2")
}
var normalizeComponent = __webpack_require__("mUJo")
/* script */


/* template */

/* template functional */
var __vue_template_functional__ = false
/* styles */
var __vue_styles__ = injectStyle
/* scopeId */
var __vue_scopeId__ = "data-v-453d3eb3"
/* moduleIdentifier (server only) */
var __vue_module_identifier__ = null
var Component = normalizeComponent(
  __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_Hierarchy_vue___default.a,
  __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_453d3eb3_hasScoped_true_transformToRequire_video_src_poster_source_src_img_src_image_xlink_href_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_Hierarchy_vue__["a" /* default */],
  __vue_template_functional__,
  __vue_styles__,
  __vue_scopeId__,
  __vue_module_identifier__
)
Component.options.__file = "Create/Tool/Hierarchy.vue"

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-453d3eb3", Component.options)
  } else {
    hotAPI.reload("data-v-453d3eb3", Component.options)
  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

/* harmony default export */ __webpack_exports__["default"] = (Component.exports);


/***/ }),

/***/ "vdRI":
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends2 = __webpack_require__("AGn3");

var _extends3 = _interopRequireDefault(_extends2);

var _stringify = __webpack_require__("hoiv");

var _stringify2 = _interopRequireDefault(_stringify);

var _slicedToArray2 = __webpack_require__("+vUa");

var _slicedToArray3 = _interopRequireDefault(_slicedToArray2);

var _vue = __webpack_require__("X9e9");

var _vue2 = _interopRequireDefault(_vue);

var _vuex = __webpack_require__("Ki8f");

var _vuex2 = _interopRequireDefault(_vuex);

var _config = __webpack_require__("VJeK");

var _config2 = _interopRequireDefault(_config);

var _config3 = __webpack_require__("WEJo");

var _config4 = _interopRequireDefault(_config3);

var _config5 = __webpack_require__("JcYZ");

var _config6 = _interopRequireDefault(_config5);

var _config7 = __webpack_require__("k3QP");

var _config8 = _interopRequireDefault(_config7);

var _config9 = __webpack_require__("BKqd");

var _config10 = _interopRequireDefault(_config9);

var _config11 = __webpack_require__("luRR");

var _config12 = _interopRequireDefault(_config11);

var _config13 = __webpack_require__("zFpU");

var _config14 = _interopRequireDefault(_config13);

var _Table = __webpack_require__("riBw");

var _Table2 = _interopRequireDefault(_Table);

var _Dialog = __webpack_require__("p3wj");

var _Dialog2 = _interopRequireDefault(_Dialog);

var _Form = __webpack_require__("JebD");

var _Form2 = _interopRequireDefault(_Form);

var _Button = __webpack_require__("6ull");

var _Button2 = _interopRequireDefault(_Button);

var _Input = __webpack_require__("gaHL");

var _Input2 = _interopRequireDefault(_Input);

var _Tag = __webpack_require__("WWVw");

var _Tag2 = _interopRequireDefault(_Tag);

var _Breadcrumb = __webpack_require__("BoSz");

var _Breadcrumb2 = _interopRequireDefault(_Breadcrumb);

var _scheme2Default = __webpack_require__("MtiE");

var _scheme2Default2 = _interopRequireDefault(_scheme2Default);

var _scheme2Input = __webpack_require__("noFo");

var _scheme2Input2 = _interopRequireDefault(_scheme2Input);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var SLOT_TYPE = '__pg_type_slot_component__';
var REFER_TYPE = '__pg_type_refer_component__';

_vue2.default.use(_vuex2.default);

var getName = function () {
    var counter = {};
    return function (name) {
        if (counter[name]) {
            return name + counter[name]++;
        } else {
            counter[name] = 1;
            return name;
        }
    };
}();

var allComsConfig = {
    Table: _config2.default,
    Dialog: _config4.default,
    Form: _config6.default,
    Button: _config8.default,
    Input: _config10.default,
    Tag: _config12.default,
    Breadcrumb: _config14.default
};

var allComs = {
    Table: _Table2.default,
    Dialog: _Dialog2.default,
    Form: _Form2.default,
    Button: _Button2.default,
    Input: _Input2.default,
    Tag: _Tag2.default,
    Breadcrumb: _Breadcrumb2.default
};

var uuid = 1;

var store = new _vuex2.default.Store({
    state: {
        components: [],
        activeComponent: null,
        dialogs: []
    },
    getters: {
        components: function components(state) {
            return state.components;
        },
        dialogs: function dialogs(state) {
            return state.dialogs;
        },
        data: function data(state) {
            return state.components.concat(state.dialogs);
        },
        activeComponentSetting: function activeComponentSetting(state) {
            return state.activeComponent && (0, _scheme2Input2.default)(allComsConfig[state.activeComponent.type].props);
        },

        /**
         * 获取所有component（非对话框）的
         */
        allComsType: function allComsType() {
            var target = [];
            for (var key in allComsConfig) {
                if (!allComsConfig[key].isDialog) {
                    target.push(key);
                }
            }
            return target;
        },
        allDialogsType: function allDialogsType() {
            var target = [];
            for (var key in allComsConfig) {
                if (allComsConfig[key].isDialog) {
                    target.push(key);
                }
            }
            return target;
        },

        /**
         * 获取所有组件可引用属性的map
         * @return {
         *     comName1:['varName1','varName2'],
         *      .
         *      .
         *      .
         * }
         */
        allExposeMap: function allExposeMap(state) {
            var list = state.components.concat(state.dialogs);
            var map = {};

            function traverse(list) {
                list.forEach(function (item) {
                    var config = allComsConfig[item.type];
                    if (config.expose && config.expose.length) {
                        map[item.name] = config.expose;
                    }
                    traverse(item.children);
                });
            }
            return map;
        },

        /**
         * @return {Array}  所有已创建组件（包括子组件）
         */
        componentNameList: function componentNameList(state) {
            var names = [];
            (function traverse(list) {
                if (!list) return;
                list.forEach(function (item) {
                    if (item !== state.activeComponent) {
                        names.push(item.name);
                    }
                    traverse(item.children);
                });
            })(state.components.concat(state.dialogs));
            return names;
        }
    },
    mutations: {
        /**
         * 
         * @param { {p,i} } drag 被拖拽对象
         * @param { {p,i} } drop 目标对象
         */
        nodeChange: function nodeChange(state, _ref) {
            var drag = _ref.drag,
                drop = _ref.drop;

            var holder = {};

            var _drag$p$subCom$splice = drag.p.subCom.splice(drag.i, 1, holder),
                _drag$p$subCom$splice2 = (0, _slicedToArray3.default)(_drag$p$subCom$splice, 1),
                comObj = _drag$p$subCom$splice2[0];

            drop.p.subCom.splice(drop.i, 0, comObj);
            drag.p.subCom.splice(drag.p.subCom.indexOf(holder), 1);
        },


        /**
         * 删除组件
         * @param { comObj } list 父对象
         * @param { comObj } node 要删除的子对象
         */
        delComponent: function delComponent(state, _ref2) {
            var list = _ref2.list,
                node = _ref2.node;

            function del(list, node) {
                if (!list) return;
                if (~list.indexOf(node)) {
                    list.splice(list.indexOf(node), 1);
                    return true;
                } else {
                    list.some(function (e) {
                        return del(e.subCom, node);
                    });
                }
            }
            del(list.subCom, node);

            //删除组件名引用
            (function traverse(list) {
                if (!list) return;
                for (var i = 0, len = list.length; i < len; i++) {
                    var props = list[i].props;
                    list[i].props = JSON.parse((0, _stringify2.default)(props), function (k, v) {
                        if (this.type === SLOT_TYPE) {
                            this.value = this.value.map(function (e) {
                                return e !== node.name;
                            });
                        } else if (this.type === REFER_TYPE) {
                            if (this.value === node.name) {
                                this.value = '';
                            }
                        }
                        return v;
                    });
                    traverse(list[i].subCom);
                }
            })(state.components.concat(state.dialogs));
        },


        /**
         * 添加组件
         * @param { comObj } node 父对象
         * @param { vm } comVm 要添加的组件实例
         */
        addComponent: function addComponent(state, _ref3) {
            var node = _ref3.node,
                type = _ref3.comType;

            var config = allComsConfig[type];
            var comVm = allComs[type];
            var name = getName(config.name);

            var comObj = {
                pg: uuid++,
                name: name,
                type: type,
                isDialog: config.isDialog,
                props: (0, _extends3.default)({}, (0, _scheme2Default2.default)(config.props), {
                    name: name
                }),
                com: comVm,
                subCom: [],
                __pg_slot__: false //是否成为slot
            };

            node.subCom.push(comObj);

            this.commit('activateComponent', {
                comObj: comObj
            });
        },


        /**
         * 激活组件
         * @param { comObj } comObj 要激活的对象
         */
        activateComponent: function activateComponent(state, _ref4) {
            var comObj = _ref4.comObj;

            state.activeComponent = comObj;
        },


        /**
         * 输入setting参数
         * @param { String } name 字段名称
         * @param { Any } value 字段值
         */
        input: function input(state, _ref5) {
            var name = _ref5.name,
                value = _ref5.value;


            function getComponent(comName) {
                var list = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : state.components.concat(state.dialogs);

                var ret = null;

                function find(list) {
                    if (!list) return;
                    for (var i = 0, len = list.length; i < len; i++) {
                        if (list[i].name === comName) {
                            return ret = list[i];
                        } else {
                            find(list[i].subCom);
                        }
                    }
                }
                find(list);
                return ret;
            }

            //清除该变量名下子组件的所有slot标识
            state.activeComponent.subCom.forEach(function (com) {
                if (com.__pg_slot__ && com.__pg_slot__.startsWith(name)) {
                    com.__pg_slot__ = false;
                }
            });

            /**
             * @return [
             *  0:['form1','form2'],
             *  1:['table1']
             * ]
             */
            var slots = []; //TODO:JSON.parse遍历参数循环两次的问题

            value = JSON.parse((0, _stringify2.default)(value), function (k, v) {
                var _this = this;

                if (this.type === SLOT_TYPE) {
                    //去重
                    this.value = this.value.filter(function (e, idx) {
                        return _this.value.indexOf(e) == idx;
                    });
                    //过滤非直接子组件以及已经成为slot的子组件
                    this.value = this.value.filter(function (e) {
                        return state.activeComponent.subCom.some(function (subCom) {
                            return e === subCom.name && !subCom.__pg_slot__;
                        }) && slots.every(function (slot) {
                            return slot.every(function (slot) {
                                return e !== slot;
                            });
                        });
                    });

                    slots.push(this.value);
                } else if (this.type === REFER_TYPE) {
                    //过滤不存在的组件以及自身组件
                    if (!getComponent(this.value) || this.value === state.activeComponent.name) {
                        this.value = '';
                    }
                }
                return v;
            });

            //为子组件添加slot标识
            slots.forEach(function (slotsName, slotIdx) {
                state.activeComponent.subCom.forEach(function (subCom) {
                    if (slotsName.includes(subCom.name)) {
                        subCom.__pg_slot__ = name + (slotIdx + 1);
                        subCom.props.__pg_slot__ = name + (slotIdx + 1);
                    }
                });
            });

            if (name === 'name') {

                //组件名称引用联动
                var oldName = state.activeComponent.name;
                (function traverse(list) {
                    if (!list) return;
                    for (var i = 0, len = list.length; i < len; i++) {
                        var props = list[i].props;
                        list[i].props = JSON.parse((0, _stringify2.default)(props), function (k, v) {
                            if (this.type === SLOT_TYPE) {
                                this.value = this.value.map(function (e) {
                                    if (e === oldName) {
                                        return value;
                                    } else {
                                        return e;
                                    }
                                });
                            } else if (this.type === REFER_TYPE) {
                                if (this.value === oldName) {
                                    this.value = value;
                                }
                            }
                            return v;
                        });
                        traverse(list[i].subCom);
                    }
                })(state.components.concat(state.dialogs));

                state.activeComponent.name = value;
            }

            _vue2.default.set(state.activeComponent.props, name, value);
        }
    },
    actions: {
        save: function save(state, _ref6) {
            var vm = _ref6.vm;

            vm.$http.post("/save", state.getters.data);
        }
    }
});
exports.default = store;

/***/ }),

/***/ "vi+0":
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),

/***/ "vmF+":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_vue_loader_lib_selector_type_script_index_0_vue_drag_tree_vue__ = __webpack_require__("+atQ");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_vue_loader_lib_selector_type_script_index_0_vue_drag_tree_vue___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__babel_loader_vue_loader_lib_selector_type_script_index_0_vue_drag_tree_vue__);
/* harmony namespace reexport (unknown) */ for(var __WEBPACK_IMPORT_KEY__ in __WEBPACK_IMPORTED_MODULE_0__babel_loader_vue_loader_lib_selector_type_script_index_0_vue_drag_tree_vue__) if(__WEBPACK_IMPORT_KEY__ !== 'default') (function(key) { __webpack_require__.d(__webpack_exports__, key, function() { return __WEBPACK_IMPORTED_MODULE_0__babel_loader_vue_loader_lib_selector_type_script_index_0_vue_drag_tree_vue__[key]; }) }(__WEBPACK_IMPORT_KEY__));
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__vue_loader_lib_template_compiler_index_id_data_v_029b3b2f_hasScoped_false_transformToRequire_video_src_poster_source_src_img_src_image_xlink_href_buble_transforms_vue_loader_lib_selector_type_template_index_0_vue_drag_tree_vue__ = __webpack_require__("Ut9Q");
var disposed = false
function injectStyle (ssrContext) {
  if (disposed) return
  __webpack_require__("Is/d")
}
var normalizeComponent = __webpack_require__("mUJo")
/* script */


/* template */

/* template functional */
var __vue_template_functional__ = false
/* styles */
var __vue_styles__ = injectStyle
/* scopeId */
var __vue_scopeId__ = null
/* moduleIdentifier (server only) */
var __vue_module_identifier__ = null
var Component = normalizeComponent(
  __WEBPACK_IMPORTED_MODULE_0__babel_loader_vue_loader_lib_selector_type_script_index_0_vue_drag_tree_vue___default.a,
  __WEBPACK_IMPORTED_MODULE_1__vue_loader_lib_template_compiler_index_id_data_v_029b3b2f_hasScoped_false_transformToRequire_video_src_poster_source_src_img_src_image_xlink_href_buble_transforms_vue_loader_lib_selector_type_template_index_0_vue_drag_tree_vue__["a" /* default */],
  __vue_template_functional__,
  __vue_styles__,
  __vue_scopeId__,
  __vue_module_identifier__
)
Component.options.__file = "node_modules/vue-drag-tree/src/vue-drag-tree.vue"

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-029b3b2f", Component.options)
  } else {
    hotAPI.reload("data-v-029b3b2f", Component.options)
  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

/* harmony default export */ __webpack_exports__["default"] = (Component.exports);


/***/ }),

/***/ "wGLg":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c(
    "div",
    { staticClass: "board-wrapper" },
    [
      _c(
        "div",
        { staticClass: "main-board" },
        _vm._l(_vm.$store.getters.components, function(comObj) {
          return _c("pg-com", { key: comObj.pg, attrs: { "com-obj": comObj } })
        })
      ),
      _vm._v(" "),
      _vm._l(_vm.$store.getters.dialogs, function(comObj) {
        return _c("pg-com", { key: comObj.pg, attrs: { "com-obj": comObj } })
      })
    ],
    2
  )
}
var staticRenderFns = []
render._withStripped = true
var esExports = { render: render, staticRenderFns: staticRenderFns }
/* harmony default export */ __webpack_exports__["a"] = (esExports);
if (false) {
  module.hot.accept()
  if (module.hot.data) {
    require("vue-hot-reload-api")      .rerender("data-v-1d86a790", esExports)
  }
}

/***/ }),

/***/ "wpJ8":
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _vue = __webpack_require__("X9e9");

var _vue2 = _interopRequireDefault(_vue);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = {
  name: "tree-node", // 递归组件需指明 name
  props: {
    value: Object, // 正在拖动的节点实例（TreeNode 组件通用，须双向绑定）
    node: Object, // 节点数据，形如 { name: 'xxx', children: [] }
    idx: Number, // v-for 的索引，用于相邻节点的判别
    level: {
      type: Number,
      default: 0
    }, // 层级
    allComs: {},
    type: String
  },
  data: function data() {
    return {
      hideChildren: false,
      unwatchRootNode: function unwatchRootNode() {},
      showComlib: false
    };
  },
  beforeDestroy: function beforeDestroy() {
    if (typeof this.idx === "undefined") {
      this.unwatchRootNode();
    }
  },

  computed: {
    valueModel: {
      get: function get() {
        return this.value;
      },
      set: function set(val) {
        this.$emit("input", val);
      }
    },
    children: function children() {
      // 为每个子节点前后都生成空节点，便于实现兄弟节点间的“插入排序”
      // 举例：原本是 [N1, N2, N3]
      var children = this.node.subCom;

      if (!children || !children.length) return [];
      var _children = [];
      children.forEach(function (child) {
        return _children.push({}, child);
      });
      _children.push({});
      // 最后生成 [E1, N1, E2, N2, E3, N3, E4]（其中 N 表示节点，E 表示空节点）
      return _children;
    },
    isParent: function isParent() {
      // 拖放限制 1：判断“我”是否为被拖动节点的父节点
      return this === (this.value && this.value.$parent);
    },
    isNextToMe: function isNextToMe() {
      // 拖放限制 2：判断“我”是否为被拖动节点的相邻节点
      return this.$parent === this.value && this.value.$parent && Math.abs(this.idx - this.value.idx) === 1;
    },
    isMeOrMyAncestor: function isMeOrMyAncestor() {
      // 拖放限制 3：判断被拖动节点是否为“我”自身或“我”的祖先
      var p = this;
      while (p) {
        if (this.value === p) return true;
        p = p.$parent;
      }
    },
    isAllowToDrop: function isAllowToDrop() {
      // 上述拖放限制条件的综合
      return !(this.isParent || this.isNextToMe || this.isMeOrMyAncestor || this.isDialogToComponents || this.isComponentsToDialogsRoot || this.isDialogNest);
    },
    isDialogNest: function isDialogNest() {
      //dialog不可作为其他组件的子组件
      return this.value.node.isDialog && !this.$parent.node.isRoot || this.value.node.isDialog && this.node.name;
    },
    isDialogToComponents: function isDialogToComponents() {
      //dialog不可移入“组件”Hierarchy里
      return this.type == 'components' && this.value.node.isDialog;
    },
    isComponentsToDialogsRoot: function isComponentsToDialogsRoot() {
      //普通组件不可作为“对话框”Hierarchy的根组件
      return !this.node.name && this.$parent.node.isRoot && this.type == 'dialogs' && !this.value.node.isDialog;
    }
  },
  methods: {
    clearBgColor: function clearBgColor() {
      // 清理样式
      this.$el.style.backgroundColor = "";
    },
    handleDragStart: function handleDragStart(ev) {
      if (this.idx === undefined) return;
      this.valueModel = this; // 设置本组件为当前正在拖动的实例，此举将同步 sync 到所有 TreeNode 实例
      ev.dataTransfer.effectAllowed = "move";
    },
    handleDrop: function handleDrop() {
      this.clearBgColor(); // 此时 this 为目的地节点，vm 才是被拖动节点
      if (!this.isAllowToDrop) return;

      var dragParentNode = this.value.$parent.node;
      var dragIndex = dragParentNode.subCom.indexOf(this.value.node);

      // 情况 1：拖入空节点，成其兄弟（使用 splice 插入节点）
      if (!this.node.name) {
        var insertBeforeIndex = this.idx / 2;
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
    handleDragEnter: function handleDragEnter() {
      // 允许拖放才会显示样式
      if (!this.isAllowToDrop) return;
      if (!this.node.name) {
        this.$el.style.backgroundColor = "#1ab394";
      } else {
        this.$el.style.backgroundColor = "rgba(26, 179, 148, 0.1)";
      }
    },
    handleDragLeave: function handleDragLeave() {
      this.clearBgColor();
    },
    handleDragEnd: function handleDragEnd() {
      this.clearBgColor();
    },
    onDragEnd: function onDragEnd(changeInfo) {
      if (typeof this.idx === "undefined") {
        this.$emit("on-change", changeInfo);
      } else {
        this.$parent && this.$parent.onDragEnd(changeInfo);
      }
    },
    onAddBtnClick: function onAddBtnClick(data) {
      if (typeof this.idx === "undefined") {
        this.$emit("on-add-btn-click", data);
      } else {
        this.$parent && this.$parent.onAddBtnClick(data);
      }
    },
    onEditBtnClick: function onEditBtnClick(data) {
      if (typeof this.idx === "undefined") {
        this.$emit("on-edit-btn-click", data);
      } else {
        this.$parent && this.$parent.onEditBtnClick(data);
      }
    },
    onCopyBtnClick: function onCopyBtnClick(data) {
      if (typeof this.idx === "undefined") {
        this.$emit("on-copy-btn-click", data);
      } else {
        this.$parent && this.$parent.onCopyBtnClick(data);
      }
    },
    onDelBtnClick: function onDelBtnClick(data) {
      if (typeof this.idx === "undefined") {
        this.$emit("on-del-btn-click", data);
      } else {
        this.$parent && this.$parent.onDelBtnClick(data);
      }
    },
    onNodeNameClick: function onNodeNameClick(data) {
      if (typeof this.idx === "undefined") {
        this.$emit("on-node-name-click", data);
      } else {
        this.$parent && this.$parent.onNodeNameClick(data);
      }
    },
    onNodeRowClick: function onNodeRowClick(data) {
      if (typeof this.idx === "undefined") {
        this.$emit("on-node-row-click", data);
      } else {
        this.$parent && this.$parent.onNodeRowClick(data);
      }
    },
    onAddCom: function onAddCom(com) {
      if (typeof this.idx === "undefined") {
        this.$emit("addCom", com);
      } else {
        this.$parent && this.$parent.onAddCom(com);
      }
    },
    emitEvent: function emitEvent(type, node) {
      switch (type) {
        case "addCom":
          this.showComlib = false;
          this.onAddCom(node);
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
          this.onDelBtnClick(this.node);
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
}; //
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

/***/ }),

/***/ "wtlx":
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
//
//
//
//
//
//
//
//
//
//
//
//
//

exports.default = {
  methods: {}
};

/***/ }),

/***/ "x/c1":
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.hasError = exports.input = undefined;

var _referComponent = __webpack_require__("8OWv");

var _referComponent2 = _interopRequireDefault(_referComponent);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var hasError = function hasError(conf) {};

var input = {
    component: _referComponent2.default,
    propsLoader: function propsLoader(conf) {
        return {};
    }
};

exports.input = input;
exports.hasError = hasError;

/***/ }),

/***/ "yF26":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c(
    "el-form-item",
    { attrs: { label: _vm.label } },
    [_c("el-input", _vm._b({}, "el-input", _vm.$props, false))],
    1
  )
}
var staticRenderFns = []
render._withStripped = true
var esExports = { render: render, staticRenderFns: staticRenderFns }
/* harmony default export */ __webpack_exports__["a"] = (esExports);
if (false) {
  module.hot.accept()
  if (module.hot.data) {
    require("vue-hot-reload-api")      .rerender("data-v-6fe728ba", esExports)
  }
}

/***/ }),

/***/ "zFpU":
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = {
    "name": 'breadcrumb',
    "props": [{
        "name": "items",
        "label": "导航列表",
        "value": ['object'],
        "format": [{
            label: '路由跳转对象',
            "name": 'to',
            value: 'string'
        }, {
            label: '文本',
            "name": 'title',
            value: 'string'
        }]
    }, {
        "name": "separator",
        "label": "分隔符",
        "value": "string"
    }, {
        "name": "separatorClass",
        "label": "图标分隔符 class",
        "value": "string"
    }]
};

/***/ }),

/***/ "zqVg":
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__("Ywka");
if(typeof content === 'string') content = [[module.i, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var update = __webpack_require__("pFN4")("e9110250", content, false, {});
// Hot Module Replacement
if(false) {
 // When the styles change, update the <style> tags
 if(!content.locals) {
   module.hot.accept("!!../../../node_modules/css-loader/index.js?{\"sourceMap\":true}!../../../node_modules/vue-loader/lib/style-compiler/index.js?{\"vue\":true,\"id\":\"data-v-3fbdf404\",\"scoped\":true,\"hasInlineConfig\":false}!../../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./Breadcrumb.vue", function() {
     var newContent = require("!!../../../node_modules/css-loader/index.js?{\"sourceMap\":true}!../../../node_modules/vue-loader/lib/style-compiler/index.js?{\"vue\":true,\"id\":\"data-v-3fbdf404\",\"scoped\":true,\"hasInlineConfig\":false}!../../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./Breadcrumb.vue");
     if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
     update(newContent);
   });
 }
 // When the module is disposed, remove the <style> tags
 module.hot.dispose(function() { update(); });
}

/***/ })

},["2O6T"]);
//# sourceMappingURL=app.35c1ea03e780befbc026.js.map