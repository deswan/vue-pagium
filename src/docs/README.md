### pager-element



```
npm install pager-element -g
```



### 使用方式

1. 界面 

   ```Bash
   cd my-project
   pg start	#开启本地服务
   ```

   界面方式将会开启一个本地服务并提供GUI供用户配置组件数据，可使用模板功能。

   命令参数说明：

   -c , —config 指定 config 目录，默认为当前目录下的 .pager 目录（不存在则创建）

   -t , —target 指定输出目录或输出文件，默认为**config目录**下的Page.vue。当指定的是目录时，输出文件将会是该目录下的Page.vue文件（不存在则创建）；当指定的是文件，结果将会输出到该文件中。

   -p , —port 指定本地服务端口，默认为 8001

2. 命令行

   ```Bash
   cd my-project
   pg create path/to/json [target]
   ```

   命令行方式将直接获取一个json作为数据源生成结果文件，是一种更为快捷的方式。

   命令参数说明：

   target 指定数据源，必须为json文件

   -c , —config 指定 config 目录，否则沿当前路径逐级向上查找.pager目录

   -t , —target 指定输出目录或输出文件，默认为**当前目录**下的Page.vue。当指定的是目录时，输出文件将会是该目录下的Page.vue文件（不存在则创建）；当指定的是文件，结果将会输出到该文件中。




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



#### 配置文件 config.js

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

##### 选项说明

- name: String 

  组件实例的初始名称

- exposeProperty: Array<String>（可选）

  组件对外暴露的 **最外层**data名、method名或computed名。当任何其它组件的refer类型指定了其`property`选项为该组件exposeProperty数组中的任意一项，那么那个refer类型的值则可以取为该组件的实例。

- isDialog: Boolean（可选）

  是否是对话框组件，仅在界面方式启动的情况下有用（在编辑界面将被归为“对话框”一栏）。

- props: Array<Object> 

  声明预备传入该组件的参数。每个数组元素对象描述一个参数，详情见“参数配置”。

  ​


##### 参数配置

- name: String 

  指定参数名。该参数将以此名称作为参数名传入实时预览组件`[组件名].vue`（prop）和模板文件 `[组件名].vue.art`（模板数据）中。

- label: String（可选）

  指定参数的标注名