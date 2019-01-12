# vue-pagium 

> source code`s fast generator for Vue Single File Component 

## Demo

[在线演示版demo](http://139.224.233.120:8001)

## Environment

`Node >= 8`

## Install

``` bash
npm i vue-pagium -g
```

## Start

``` bash
cd my-project
vue-pagium start
```

## 定义积木组件

每个组件由以下两个文件定义：

1. 组件模板文件 [组件名].vue.art

   组件模板文件语法是Vue单文件组件 + Vue选项引用标识符"@@" + art-template模板引擎语法的格式。

2. 组件配置文件config.js：配置组件信息和组件参数信息。




编写组件模板需要做的事是：

1. 使用组件配置文件定义的参数名作为模板参数，使用 art-template 模板引擎语法编写逻辑，输出一个标准的Vue单文件组件格式
2. 对于组件中一些Vue选项（第一层data属性名、methods属性名、watch属性名）的引用，需要在属性名前面加上"@@"标识符



模板引擎语法

组件模板使用art-template 4.0模板引擎编译，用户可以查看官方网站http://aui.github.io/art-template/zh-cn/了解基本的模板语法。。

art-template的标准语法双括号中被修改为三花括号`{{{ }}}`，避免与Vue自身的模板语法冲突。



在config.js中配置组件参数

config.js文件应该使用commonJS语法导出一个Config类型的对象

**Config**

| Key                    | Value        |  默认值  |
| ---------------------- | ------------ | :---: |
| name: string           | 组件实例的默认名称    |       |
| isDialog: boolean      | （可选）是否为对话框组件 | false |
| props: ParameterInfo[] | 组件参数数组       |       |



**ParameterInfo 参数描述对象** 

| Key                      | Value                                    |   默认值   |
| :----------------------- | ---------------------------------------- | :-----: |
| name: string             | 指定参数名。当前参数将以该值作为参数名以模板引擎数据的形式传入组件模板文件中。为了防止与系统传入的参数冲突，不能以下划线开头。 |         |
| label: string            | （可选）参数别名。在界面编辑器中显示的属性名。                  |         |
| type: string \| string[] | 组件参数数组，取值见下文                             |         |
| default                  | （可选）指定参数的默认值。如果指定了该默认值，则会覆盖相应数据类型本身的默认值。 | 取决于数据类型 |
| options                  | （可选）当type为"select"或["select"]时，需要该字段以指定选择列表 |         |
| format                   | （可选）当type为"object"或["object"]时，需要该字段以指定对象属性信息 |         |



参数可以指定为以下八种数据类型，每种类型都对参数值作出了相应的限制。

- type:"string" 字符串类型，限制参数必须是一个字符串类型值。默认值为空字符串。
- type:"number" 数值类型，限制参数必须是一个数值类型值。默认值为0。
- type:"boolean" 布尔类型，限制参数必须是一个JS布尔类型值。默认值为false。
- type:"select" 选择器类型，限制参数值必须是选择列表中的其中一项或为空字符串。默认值为空字符串。需要一个额外的options选项来指定选择列表。

```Js
options: [{
    label: '多选站点',	//描述
    value: 'sites'		//实际数据值
}, {
    label: '时间值', 	//描述
    value: 'time'		//实际数据值
}]
```

- type:"object" 对象类型，限制参数值为纯对象类型，且该对象拥有format选项指定的属性。

指定为对象类型的参数描述对象必须额外指定一个format选项，用以声明对象中每个属性的数据类型。format选项需是一个对象数组。它的每个元素也都是一个参数描述对象

```Js
format: [{
        "name": "fixed",
        "label": "fixed",
        "type": "select",
        "options": ["left", "right"]
    }, {
        "name": "label",
        "label": "label",
        "type": "string"
    }]
```

- type: 'slot' 插槽类型

插槽类型实现了子组件的模板位置的分发。

该类型实际上指定了当前组件的一些特殊的子组件，这些子组件的组件模板中的<template>块的内容不再被当前组件模板中的“insertChildren()”函数调用所插入，而是以参数化的形式被“insertSlot(arg) ”所插入。同时，这些特殊的子组件模板的其它块如<script>、<style>与作为一个普通子组件是一样的，即与普通组件采取同样的合并策略。

设mySlot为slot类型值 

```Html
<div>
  {{{ insertSlot(mySlot) }}}
</div> 
```



- type: 'refer'组件引用类型

该类型提供一种取得外部组件的Vue实例选项名称的方式，作为一种组件间交互的解决方案。

在组件模板搭配使用函数refer，需要将refer类型值作为第一个参数传入，并将需要引用的数据作为第二个参数传入

设myRefer为refer类型值

```Js
this.{{{refer(myRefer,'id')}}}	 //编译结果：this.myReferCom.id
```

- type: [Type] 数组类型

数组类型的type字段形式为一个单元素数组，该元素可以是除了数组类型之外的其它七种参数类型值。如：需要一个对象数组，则写为`['object']`。 数组类型参数的的默认值为一个空数组。

该类型的参数选项如format、options等会被注入到数组元素所指定的类型之中。



每种类型的参数会在可视化编辑器界面中被定义为不同样式的表单项，供使用者进行合理的输入 



## 深入

组件模板编译和替换引用标识符后应当是一个标准的Vue单文件组件格式。一个标准的vue单文件组件可含有多种区块。然而目前系统只解析<template>、<script>和<style>三种最常见的区块。



每个组件模板会有以下数据被传入模板引擎：

- 当前组件配置文件config.js中定义的所有参数，变量名为每个参数描述对象的name字段，可作为全局变量或作为变量 $data 的属性访问。
- 功能函数，包括以下三个函数，作为全局变量或作为 $imports 的属性访问：
  - insertChildren：在函数调用的地方插入所有非slot子组件的<template>块
  - insertSlot(slotArg)：在函数调用的地方插入slot类型参数指定的子组件的<template>
  - refer(referArg)：在函数调用的地方插入指定外部组件的Vue选项数据名
- `_name`变量，值为本组件的实例名称，在当前组件树中唯一。



### Vue单文件组件的合并

#### template块的合并

对于兄弟组件，他们的template模板将按顺序被拼接起来。对于父子组件，父需要在template块中使用insertChildren和insertSlot函数进行子组件模板的显式分发。



#### script块的合并

目前，系统解析vue选项对象的以下选项块：data、methods、computed、watch、生命周期钩子方法，并分别进行合并。

##### data的合并和重命名

data块的AST语法树查找过程如下：查找出vue选项对象下data方法下的return语句，返回的对象字面量即作为该组件的data块。

多个组件的data合并将产生属性名称的重复，因此需要重命名。同时，为了确保data结构的逻辑性，子组件的data需要嵌套到父组件的data中。以下是合并与重命名算法的简要描述：

遍历组件实例树中每个组件的子组件，使用AST语法树分析收集每个组件的**首层data属性名**。“首层”的意思是嵌套对象的属性名不计。如下：

```Js
data(){
  return {
    loading:false,  //首层data属性
    items:[],   	//首层data属性
    myObj:{ 		//首层data属性
      p1: 1,		//非首层data属性
      p2: 2		//非首层data属性
    }
  };
}
```

获取首层data属性之后，按情况有不同的合并策略：

情况1：无属性，跳过。

情况2：只有一个属性，将其重命名为驼峰化的`组件名称 + 属性名称`，并加入父组件的data，成为父组件的**首层data属性**，如该属性与父组件中的其它已存在的首层属性名称重复，则往该属性名后添加“$”直至无重复为止。假设名为parentCom的组件实例有一名为childCom的子组件，合并前后如下所示：

 ```Js
//parentCom
data() {
    return {
        items: []
    };
}
//childCom
data() {
    return {
        value: 0
    };
}
//合并后
data() {
    return {
        items: [],
        childComValue: 0
    };
}
 ```

合并后，子组件的value属性被重命名为了childComValue。

情况3：有多个属性，将这些属性用一个新对象包裹起来，并将此对象作为以**组件名称**命名的属性加入父对象的首层data中，如该属性名（即该组件名称）与其他已存在的首层data名重复，则将**其它属性名**重命名为“属性名 + $”，如仍有重复则继续添加“$”直至无重复为止。

继续假设名为parentCom的组件实例有一名为childCom的子组件，合并前后如下所示：

```Js
//parentCom
data() {
    return {
        items: []
    };
}
//childCom
data() {
    return {
        loading: false,
        value: 0
    };
}
//合并后
data() {
    return {
        items: [],
        childCom: {
            loading: false,
            value: 0
        }
    };
}

```

**methods和computed的合并和重命名**

methods和computed块的共同特点是，他们都是一个对象字面量。且所有的属性都处在同一层级，没有嵌套关系。因此，我们可以将其放在一起讨论。

下面以methods为例解释合并与重命名算法：

合并算法如下：

按顺序拼接组件实例树中兄弟组件的method块，子组件的method块拼接在其父组件的后面。

根据此合并算法，重命名算法如下实现：

维护一个数组，为了防止与结果页面的首层data名称冲突，将其初始化为结果页面的首层data名称列表。然后遍历每个组件，使用AST语法树分析收集methods对象中的属性名，检测名称是否与数组中的任意元素重复，若有重复则将该属性重命名为驼峰化的“属性名 + 组件名称”，仍有重复往后添加“$”直至无重复为止。然后将该属性名加入数组中。每个组件重复上述过程。

**watch和生命周期钩子方法块的合并**

watch和生命周期钩子方法块是一些回调函数，它们的属性不需要被引用，因此它们的合并不需要重命名，只需要进行每个块的按顺序拼接即可。



#### style块的处理

如果一个页面中有多个同一组件的实例，那么只会获取第一个组件实例的style块，将其合并入生成的页面，省略其它相同组件的实例模板的style块。这是为了避免样式块的重复出现导致的冗余。



## Button组件样例

Button/Button.vue.art：

```
<template>
  <el-button @click="@@onClick" 
  {{{if size}}} size="{{{size}}}" {{{/if}}}  
  {{{if type}}} type="{{{type}}}" {{{/if}}}  
  {{{if plain}}} plain {{{/if}}}  
  {{{if round}}} round {{{/if}}}  
  {{{if icon}}} icon="{{{icon}}}" {{{/if}}}  
  style="{{{if marginTop}}} margin-top:{{{marginTop}}}px {{{/if}}}"  
  >{{{if title}}} {{{title}}} {{{/if}}}
  </el-button>
</template>
<script>
export default {
  data() {
    return {
    };
  },
  methods:{
    onClick(e){
      {{{if dialog.value}}}
        this.{{{refer(dialog,'open')}}}()
      {{{/if}}}
    } 
  }
};
</script>
```

Button/config.js：

```Js
module.exports = {
    name: 'button',
    description:'按钮',
    props: [{
        name: "dialog",
        label: "打开对话框-选择组件",
        type: "refer"
    },{
        name: "copy",
        label: "将row中的字段拷贝到对话框组件上,为scope slot时有效",
        type: ['object'],
        format:[{
            name:'row',
            type:'string'
        },{
            name:'to',
            type:'string'
        }]
    }, {
        name: "title",
        label: "文本",
        type: "string"
    }, {
        name: "size",
        label: "尺寸",
        type: "select",
        options: ["medium", "small", "mini"]
    }, {
        name: "type",
        label: "类型",
        type: "select",
        options: ["primary", "success", "warning", "danger", "info", "text"]
    }, {
        name: "plain",
        label: "是否朴素按钮",
        type: "boolean"
    }, {
        name: "round",
        label: "是否圆形按钮",
        type: "boolean"
    }, {
        name: "icon",
        label: "图标类名",
        type: "string"
    },{
        name: "marginTop",
        label: "margin-top(px)",
        type: "number"
    }]
}
```


