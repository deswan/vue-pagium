const template = require('art-template');
// art options
template.defaults.cache = false;
template.defaults.rules[1].test = /{{{([@#]?)[ \t]*(\/?)([\w\W]*?)[ \t]*}}}/;
Object.assign(template.defaults, {
    minimize: false,
    escape: false,
})
Object.assign(template.defaults.imports, {
    Object,
    Array,
    String,
    Number,
    Math,
    JSON
})

module.exports = template