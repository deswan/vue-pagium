const template = require('art-template');
const path = require('path');

//art options
template.defaults.rules[1].test = /{{{([@#]?)[ \t]*(\/?)([\w\W]*?)[ \t]*}}}/;
Object.assign(template.defaults, {
    minimize: false,
    escape: false,
})
Object.assign(template.defaults.imports, {
    Object,Array,String,JSON
})

module.exports = template;