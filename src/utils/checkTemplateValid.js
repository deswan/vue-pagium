const utils = require('./utils')
const {
    getIsValid
} = require('../type_parser')
const checkData = require('./checkDataValid')
/**
 * { ---temlpate---
    "name": "342",
    "date": "2018-4-18 22:18:42",
    "remark": "",
    "data":
    ---data--- 
    [
        {
            ---item---
            "type": "Form",
            "name": "form2",
            "props": {
                ---props---
            },
            "children": []
        }
    ]
    }
 */

function checkTemplate(template, allComsConfig, allPages) {
    if (!template.name) {
        throw new Error('模板名称缺失')
    }

    if (typeof template.name != 'string') {
        throw new Error('模板名称不合法')
    }

    if (!template.data) {
        throw new Error('模板data缺失')
    }

    checkData(template.data, allComsConfig, allPages, true)
}
module.exports = checkTemplate