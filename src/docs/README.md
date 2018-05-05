# pager-element

Vue 非运行时组件化解决方案



### 介绍

pager基于AST分析和字符串替换，提供将多个稍加处理的Vue单文件组件合并生成为单个可读、良好格式化的vue单文件组件页面的服务。适用于如运营后台等由于业务多变性的要求不方便将页面部件组件化的场景，省去了代码复制粘贴的重复性操作，避免了重命名data/method等易错漏行为。



### 安装

```
npm install pager-element -g
```



### 使用方式

1. 界面 

   ```Bash
   cd my-project
   pg start
   ```

   界面方式将会开启一个本地服务

   服务并提供GUI供用户配置组件数据，可使用模板功能。

   命令参数说明：

   -c , —config 指定 config 目录，默认为当前目录下的 .pager 目录（不存在则创建）

   -t , —target 指定输出目录或输出文件，默认为**config目录**下的Page.vue。当指定的是目录时，输出文件将会是该目录下的Page.vue文件（不存在则创建）；当指定的是文件，结果将会输出到该文件中。

   -p , —port 指定本地服务端口，默认为 8001

2. 命令行

   ```Bash
   cd my-project
   pg create <source> [target]
   ```

   命令行方式将直接获取一个json作为数据源生成结果文件，是一种更为快捷的方式。

   命令参数说明：

   source 指定数据源，必须为json文件

   target 指定输出目录或输出文件，默认为**当前目录**下的Page.vue。当指定的是目录时，输出文件将会是该目录下的Page.vue文件（不存在则创建）；当指定的是文件，结果将会输出到该文件中。

   -c , —config 指定 config 目录，否则沿当前路径逐级向上查找.pager目录





## 组件的定义

每个组件由以下几个文件定义

1. 模板文件 `[组件名].vue.art`
2. 配置文件 `config.js`
3. （可选）运行时实时预览组件 `[组件名].vue`

实时预览组件只有当使用界面方式启动pg时才是有用的，指定该文件可在编辑界面根据输入的组件参数实时预览其效果。若不存在一个实时预览组件，则在编辑界面会使用一个默认的组件代替。

这三个文件需存放在一个**以组件名命名**的文件夹中，例如，假设有组件MyButton，那么该组件的文件结构应如下：

```bash
MyButton
├─ MyButton.vue.art
├─ config.js
└─ (可选)MyButton.vue
```



##### 公共模板

公共模板是一些可被所有组件使用模板引擎的`include`语法引入的模板。必须使用`.art`后缀。



##### Components目录结构

自定义组件和公共模板须放置在config目录（见命令行参数`—config`）中的`Components`目录下，目录结构如下：

```
.pager	//config目录
└─ Components
	├─ MyButton	//组件
	|	├─ MyButton.vue.art
    |   ├─ config.js
    |   └─ (可选)MyButton.vue
    ├─ MyTable	//组件
    |	├─ MyTable.vue.art
    |    ├─ config.js
    |    └─ (可选)MyTable.vue
    └─ myHttp.art	//公共模板
```

使用`start`或`create`命令启动时，会检查Components目录下的所有文件夹，并认为包含有`[文件夹名].vue.art`以及`config.js`的文件夹即是一个组件文件夹，并对于不合法的文件夹给出警告。接着将拷贝两种东西到自身的运行时目录中：

1. 所有合法组件文件夹
2. 所有`.art`文件（不包括子目录）

pager自带有一些组件和公共模板，因此可能会出现组件或公共模板名称冲突的问题。遇到这种清况，拷贝时会询问用户是否覆盖。

注：利用覆盖的机制，用户可以覆盖自带的公共模板从而实现更改自带组件模板的效果。



自带组件如下：

- Breadcrumb
- Button
- Col
- Dialog
- Form
- Input
- Row
- Table
- Tag
- Upload



自带公共模板如下：

- http.art



#### 导出

导出命令提供了一种更为便利的自定义组件编写方式，用户可以将自带的组件/公共模板拷贝到自己的config/Components目录中，在自带组件的基础上进行修改。

```Bash
pg eject Button,Table
```

或导出所有自带组件和公共模板

```
pg eject
```



#### 组件配置文件 config.js

声明组件需要的参数和类型，以及组件相关的一些属性。一个典型的config.js文件如下

```javascript
module.exports = {
    name: 'table',	//组件的默认初始名称
  	exposeProperty: ['load'，'clear']	//（可选）组件对外暴露的data（最外层）/method名/computed名
  	isDialog:false	//（可选）是否是对话框组件
    props: [{
        name: "items",
        label: "导航列表",
        value: ['object'],
        format: [{
            label: '路由跳转对象',
            "name": 'to',
            value: 'string',
        }, {
            label: '文本',
            "name": 'title',
            value: 'string',
        }]
    }, {
        "name": "separator",
        "label": "分隔符",
        "value": "string"
    }, {
        "name": "marginTop",
        "label": "margin-top(px)",
        "value": "number"
    }, {
        "name": "marginBottom",
        "label": "margin-bottom(px)",
        "value": "number"
    }]
}
```

##### 组件配置说明

- name: String 

  组件实例的初始名称

- exposeProperty: Array<String>（可选）

  组件对外暴露的 **最外层**data名、method名或computed名。当任何其它组件的refer类型指定了其`property`选项为该组件exposeProperty数组中的任意一项，那么那个refer类型的值则可以取为该组件的实例。

- isDialog: Boolean（可选）

  是否是对话框组件，仅在界面方式启动的情况下有用（在编辑界面将被归为“对话框”一栏）。

- props: Array<Object> 

  声明预备传入该组件的参数。每个数组元素对象描述一个参数，详情见下“参数配置”。

  ​


##### 参数配置

- name: String  参数名

  指定参数名。该参数将以此名称作为参数名传入实时预览组件`[组件名].vue`（prop）和模板文件 `[组件名].vue.art`（模板数据）中。

- label: String  （可选）标注

  指定参数的标注，用于指明该参数的实际意义。界面方式启动编辑界面中，组件的参数配置栏将显示该字段。默认为 `name` 选项的值。

- type: String|Array  数据类型

  指定参数的数据类型。参数的数据类型必须依照指定数据类型的规定。不同的数据类型将在编辑界面中的参数配置栏有不同的输入框样式。详情见下“参数数据类型”

- default: Any  默认值

  指定参数的默认值。如果指定了该默认值，则会覆盖相应数据类型本身的默认值。

此外，根据type字段所指定的不同的数据类型，参数配置对象可提供其它的字段作为所指定数据类型的选项。



##### 参数数据类型

参数一共有八种数据类型，每种类型都对参数值作出了相应的限制。

- type: "string"	 字符串类型

  限制参数必须是一个字符串类型值，即：`typeof value === 'string'`。

  默认值为空字符串`''`。

- type: "number"  数值类型

  限制参数必须是一个数值类型值，即：`typeof value === 'number'`。默认值为`0`。

- type: "boolean"  布尔类型

  限制参数必须是一个布尔类型值，即：` typeof value === 'boolean'`。默认值为`false`。

- type: "select"  选择器类型

  限制参数值必须是选择列表中的其中一项或为空字符串。默认值为空字符串`''`。

  该数据类型需要一个options参数配置字段来指定选择列表，如下例所示：

  ```javascript
  {
    name: "accept",
    label: "accept",
    type: "select",
    options:['.png,.jpg,.gif','.png']
  }
  ```

  options选项必须使用一个数组表示，以上是options的**简化写法**，该写法最终将在内部被转化为**标准写法**：

  ```javascript
  options:[{
    key: '.png,.jpg,.gif',
    value: '.png,.jpg,.gif'
  },{
    key: '.png',
    value: '.png'
  }]
  ```

  ​

  其中key是实际数据值，当判断参数值是否为选择列表的其中一项时使用的是该值。value则是标注名，即在界面的参数配置栏中显示给用户的文本。

  简化写法一般用在值本身的含义对用户来说很明确的情况下，即实际数据值也可以作为标注名。当值本身的含义不明确，就需要使用标准写法。

  注意：不要在选择列表中指定引用类型值，这会引起值的全等判断不通过的问题。

- type: "object"  对象类型

  限制参数值为纯对象类型，即：`Object.prototype.toString.call(value) === '[object Object]' `，且该对象拥有format配置选项指定的属性。默认值为拥有format选项指定的属性和其相应默认值的对象。

  对象类型必须指定一个format配置选项，用以描述对象中属性的数据类型，如下例所示：

  ```javascript
  	{
          name: "myArg",
          type: "object",
          format: [{
              "name": "fixed",
              "label": "fixed",
              "type": "select",
              "options": ["left", "right"]
          }, {
              "name": "label",
              "label": "label",
              "type": "string"
          }, {
              "name": "prop",
              "label": "prop",
              "type": "string"
          }, {
              "name": "minWidth",
              "label": "min-width",
              "type": "string"
          }]
      }
  ```

  参数`myArg`的默认值：

  ```javascript
  {
    fixed:'',
    label:'',
    prop:'',
    minWidth:''
  }
  ```

  ​

  可以看到format是一个与外层参数配置选项格式相同的配置选项数组，用以表示对象中属性的格式，如`myArg.fixed`的取值将由第一个选项规定，`myArg.label`的取值将由第二个选项规定。

  format中的配置选项不允许设置对象类型和数组类型，也就是一个对象中不允许嵌套对象和数组类型值。原因有二，其一出于编辑界面参数配置栏的输入框样式的限制，这种嵌套的数据类型没办法以简单直观的输入框样式来体现，其二出于尽量简少数据复杂性和组件复杂性的考虑，如果真的出现必须在一个对象中嵌套对象或数组的情况，那么应该以编写不同的组件来解决。

  此外，还有以下规则：

  1. 对象不允许设置指定在format配置选项之外的属性。
  2. 若对象设置的属性少于format所规定的属性，那么其余的属性将会被设置为format中的相应项所指定类型的默认值，

- type: 'slot' 插槽类型

  插槽类型实现了子组件的模板位置的分发，该类型借用了vue slot的概念。

  该类型实际上指定了当前组件的一些特殊的子组件，即被该类型值指定的子组件的**template部分**不再被`insertChildren()`所插入，而是被可以以参数化的形式在其它指定的地方插入。这些特殊的子组件的其它部分与作为一个普通子组件是一样的，即采取同样的合并策略。

  slot类型的值必须是一个**数组类型**，数组项的值必须是当前组件的**直接子组件（即非孙子组件）实例名**。

  就是说如果当前组件包含名为button1和button2的两个直接子组件，且当前组件含有一个slot类型的参数`mySlot`那么该参数即可赋值为`['button1','button2']`。注意同一个组件不可被不同的slot类型参数重复引用。

  在组件模板中使用该类型值，需要搭配使用函数`insertSlot`，并将该参数值作为其参数，如下例所示：

  ```html
  <div>
    {{{insertSlot(mySlot)}}}
  </div> 
  ```

  `mySlot`参数所代表的子组件实例的template部分将会按照参数数组所指定的顺序出现在insertSlot函数被调用的位置，编译结果的样例如下：

  ```html
  <div>
  	<el-button size="small" type="text" style=""> button1 </el-button>	<!-- button1 -->	
  	<el-button size="small" type="text" style=""> button2 </el-button>	<!-- button2 -->	
  </div>
  ```

  slot类型还有可选的配置选项`scope`，指示被选中的子组件应当被放在一个作用域插槽中。具体来说，指定一个scope值指示了相应的子组件：”我应该是一个被包含在一个vue slot-scope上下文中的组件，并且其数据对象名为该配置选项`scope`的值“。

  被选中的子组件会接收到一个值为该scope选项值的`_scope`参数，组件模板中可利用该参数做出相应的判断，如下例所示：

  ```Html
  <el-button 
  {{{if _scope}}} 
  @click="@@onClick({{{_scope}}}.row)" 
  {{{else}}} 
  @click="@@onClick" {{{/if}}}
  </el-button>
  ```

  注意：组件自身只能判断自己是不是一个作用域插槽，而不能判断是否是一个普通插槽。因为从设计上来说，普通插槽组件的表现和普通子组件的表现应当是一样的，只是组件template部分的位置不同而已

  slot类型的值在内部（编译组件模板之前）会被转化，例如一个值为`['button1','button2']`的slot类型值将被转化为为如下形式：

  ```javascript
  {
    "type": "__pg_type_slot_component__",
    "value": ['button1','button2'],	//原本的值
    "scope":"scope"	//配置选项中scope的值
  }
  ```

  因此在组件模板中对于是否存在slot类型值的判断要采取适当的形式：如`{{{if mySlot.value.length}}}`

  slot类型不允许指定默认值，因为在配置参数时，要引用的子组件名是不可知的。

- type: 'refer' 组件引用类型

  该类型提供一种取得外部组件的首层data名、方法名或计算属性名的入口，作为一种组件间交互的解决方案。

  该类型的值必须是一个js字符串类型，值为要引用组件的**组件实例名称**

  refer类型有两种用法：

  1. 有property配置选项

     refer类型可包含一个配置选项`property`，指示要使用外部组件的什么数据。每一个组件都可以在配置的`exposeProperty`选项中说明自身要暴露什么首层data名、方法名或计算属性名（见”参数配置“）。指定了某个首层data名、方法名或计算属性名表明了组件开发者确保该data、方法或计算属性一定会在编译过后的组件模板中存在，以供其它组件引用。

     指定了property的refer类型所指定的组件必须是在组件配置的`exposeProperty`选项中暴露了该refer类型的property选项值的组件。比如有如下refer类型：

     ```javascript
     {
       "name": "loadComponent",
       "label": "加载组件",
       "type": "refer",
       "property": 'load'
     }
     ```

     那么该参数可取值为以下Table组件的实例名：

     ```javascript
     module.exports = {
       "name": 'table',
       "exposeProperty": ["load", "clear"],	//包含 'load'
       "props":[]
     }
     ```

     具体来说：假设有Table组件实例table1，那么该refer类型的参数loadComponent可取值为`'table1'`。

     在组件模板中使用该类型值，需要搭配使用函数`external`，并将refer类型值作为其参数。被指定的组件实例名称和property属性中所指定的首层data名、方法名或计算属性将被传入该函数。

     承接上例，external被调用的位置将被替换为指定组件的`load`方法的处理后的名称：

     ```javascript
     this.{{{external(loadComponent)}}}()
     ```

     编译结果如下：

     ```javascript
     this.load()
     ```

     也可为external的第二个参数指定修饰符，如：

     ```javascript
     this.{{{external(loadComponent,'last')}}}
     ```

     修饰符的使用见“修饰符”

  2. 无property配置选项

     该用法的区别为：不在声明时指定该参数要引用外部组件的什么数据，而是在编译时指定。常用于要引用的数据在声明时不确定，需由用户输入的情况。

     比如有如下refer类型：

     ```javascript
     {
       "name": "myRefer",
       "label": "引用组件",
       "type": "refer"
     }
     ```

     在组件模板搭配使用函数`external`，需要将refer类型值作为第一个参数传入，并将需要引用的数据作为第二个参数传入，如：

     ```javascript
     this.{{{external(myRefer,'id')}}}
     ```

     编译结果如下：

     ```javascript
     this.myReferCom.id
     ```

     也可为external的第三个参数指定修饰符，如：

     ```javascript
     this.{{{external(myRefer,'id','last')}}}
     ```

     当修饰符为`wrapper`时，第二个参数可传入空值：

     ```javascript
     this.{{{external(myRefer,'','wrapper')}}}
     ```

     修饰符的使用见“修饰符”

  ​

  refer类型的值在内部（编译组件模板之前）会被转化，例如一个值为`'table1'`的refer类型值将被转化为为如下形式：

  ```javascript
  {
    "type": "__pg_type_refer_component__",
    "value": 'table1',	//原本的值
    "property":"load"	//配置选项中property的值
  }
  ```

  ​

  因此在组件模板slot类型值的判空要采取相应的形式：如`{{{if myRefer.value}}}`

  refer类型不允许指定默认值，因为在配置参数时，要引用的其它组件名是不可知的。

- type: [ Type ] 数组类型

  数组类型的type选项形式为一个单元素数组，该元素可以是除了数组类型之外的任何其它参数类型值。如：需要一个对象数组，则写为`['object']`。

  数组类型的默认值为空数组`[]`。

  该类型的参数选项如`property `,`format`等会被注入到数组项的类型之中，如：

  ```javascript
  	{
          "name": "cols",
          "label": "设置列",
          "type": ["object"],
          "format": [{
              "name": "fixed",
              "label": "fixed",
              "type": "select",
              "options": ["left", "right"]
          }, {
              "name": "label",
              "label": "label",
              "type": "string"
          }, {
              "name": "prop",
              "label": "prop",
              "type": "string"
          }, {
              "name": "minWidth",
              "label": "min-width",
              "type": "string"
          }]
      }
  ```



### 组件模板 .vue.art

组件模板使用art-template模板引擎编译，请查看[文档](http://aui.github.io/art-template/zh-cn/)了解基本的模板语法。

art-template 使用了标准语法和原始语法两种语法格式，可交替使用，原始语法与ejs语法一致。标准语法双括号`{{}}`在pager中被修改为三花括号`{{{}}}`，避免与Vue自身的模板语法冲突。

组件模板编译后应当是一个标准的vue单文件组件格式，目前，pager只解析以下区块：

1. <template>
2. <script>

#### 工作原理介绍

pager截取<template>块中的内容作为组件的模板部分，以及使用分析AST语法树的方式解析<script>标签中使用`export default`导出的vue选项。按照组件层次树将它们进行合并，成为一个单独的.vue文件。

#### <template>块合并

并列组件的模板将按顺序被拼接起来。在每个组件中，组件开发者需要在<template>块中使用`insertChildren`和`insertSlot`函数进行子组件模板的分发。其中`insertChildren()`被调用的位置将被替换为当前组件的非slot子组件按顺序拼接的模板。`insertSlot(mySlot)`被调用的位置被替换为`mySlot`参数指定子组件的按参数输入顺序拼接的模板。

#### <script>块合并

目前，pager解析vue选项对象的以下属性：data、methods、computed、watch、生命周期钩子方法，并分别进行合并。其中，会将data的首层属性名、methods方法名和computed计算属性名保存下来，加入组件模板合并的重命名流程。

##### data的合并和重命名

data解析过程如下：查找出vue选项对象的data属性，data属性必须是ES6方法（ObjectMethod），不能为箭头函数，这是vue的标准写法所规定的。接着寻找方法块中的return语句，return语句必须返回一个对象字面量，该对象即作为该组件的data块。

多个组件的data合并将产生属性名称的重复，因此需要重命名。同时，为了确保data结构的逻辑性，子组件的data需要嵌套到父组件的data中。以下是合并与重命名算法的简要描述：

遍历同一个层次的组件，收集每个组件的**首层data属性名**。嵌套对象的属性名不计，如下：只有`loading`、`items`、`myObj`为首层data属性。

```javascript
data() {
  return {
    loading:false,	//首层data属性
    items:[],	//首层data属性
    myObj:{	//首层data属性
      p1:1,
      p2:2
    }
  };
},
```

情况1：无属性，跳过。

情况2：只有一个属性，将其重命名为驼峰化的`组件名称 + 属性名称`，并加入父组件的data，成为父组件的首层data属性，如该属性与父组件中的其它已存在的首层属性名称重复，则继续将该组件重命名为`组件名称 + 属性名称 + '$'`，如仍有重复则继续添加`$`直至无重复为止。

假设组件com1有一子组件com2，合并前如下：

com1：

```javascript
data() {
  return {
    items:[]
  };
},
```

com2：

```javascript
data() {
  return {
    value:0
  };
},
```

合并后如下：

```javascript
data() {
  return {
    items:[],
    com1Value:0
  };
},
```

情况3：有多个属性，将这些属性用一个新对象包裹起来，并将此对象作为以**组件名称**命名的属性加入父对象中，如该属性名（即该组件名称）与其他已存在的属性名重复，则将**其它属性名**重命名为`属性名 + '$'`，如仍有重复则继续添加`$`直至无重复为止。

继续假设组件com1有一子组件com2，合并前如下：

com1：

```javascript
data() {
  return {
    items:[]
  };
},
```

com2：

```javascript
data() {
  return {
    loading:false,
    value:0
  };
},
```

合并后如下：

```javascript
data() {
  return {
    items:[],
    com2:{
      loading:false,
	  value:0
    }
  };
},
```

按照此逻辑递归合并组件直至第一层，组件层次树中第一层的组件将判断自身的data被子组件累加后是否存在属性，若存在任意属性，则将这些属性用一个新对象包裹起来，并作为以**组件名称**命名的属性加入最终页面组件的首层data中。若不存在属性，则忽略。

第一层组件data的处理逻辑与其他组件不同的地方在于，不管存在一个属性还是多个属性，都会用一个新对象包裹起来。这么做的原因在于确保存在任意data属性的组件都会有一个包裹它们的对象，而修饰符`wrapper`可获取这个对象，用以应对一些特殊需求，如element-ui`Form`组件的`model`参数需要传入一个各表单项的包裹对象。

###### methods和computed的合并和重命名

解析过程如下：查找出vue选项对象的methods/computed属性，值须为一个对象字面量。该对象即为该组件的methods/computed。

以methods为例解释合并与重命名算法：



#### 全局变量

每个组件模板在编译中会被传入以下数据：

1. 当前组件配置文件config.js中定义的所有参数，作为全局变量或通过`$data`的属性访问。如果未填写某些参数，则会传入它们的默认值。
2. 功能函数`insertChildren` 、`insertSlot`以及 `external`，作为全局变量或通过`$imports`的属性访问
3. Javascript原生函数`Object`,`Array`,`String`,`Number`,`Math`,`JSON`，作为全局变量或通过`$imports`的属性访问

组件模板可以使用模板引擎的`include`语法引入公共模板，如：

```ejs
<% include('http.art',{
  method:JSON.stringify(method),
  url:JSON.stringify(url),
  params:pagination ? {
    [pageName]:'this.@@page',
    [pageSizeName]:'this.@@pageSize'
  } : {

  }
}) %> 
```

（自定义公共模板的放置位置见”Components目录结构“）

#### vue选项名称引用





### 实时预览组件 .vue

实时预览组件仅在编辑界面中实时预览用。

每个实时预览组件在编辑界面中会被传入以下props：

1. 当前组件的所有参数，未填写的参数则传入默认值。
2. 组件激活状态`pg-active`，当在编辑界面点击激活该组件时为值true，一般仅用于对话框的显示。

需要注意的是模态框组件需要添加一些属性，以 element-ui 2.3 的 el-dialog 组件为例：

```vue
<template>
    <el-dialog 
    class="pg-dialog-wrapper"
    custom-class="pg-dialog"
    :title="title" 
    :visible.sync="pgActive" 
    :modal="false" 
    :lock-scroll="false"
    >
    <slot></slot>
    </el-dialog>
</template>
<script>
export default {
  name: 'Dialog',
  props:['title','pg-active'],
  data() {
    return {
    };
  }
};
</script>
<style>
</style>
```

需要添加的属性如下，主要是为了在编辑界面中禁用遮罩层防止对话框显示时无法进行其它操作的问题：

```
class="pg-dialog-wrapper"
custom-class="pg-dialog"
:modal="false" 
:lock-scroll="false"
```



