const template = require('art-template');

//art options
template.defaults.rules[1].test = /{{{([@#]?)[ \t]*(\/?)([\w\W]*?)[ \t]*}}}/;
template.defaults.imports.valuelize = (e) => {
    return JSON.stringify(e)
};
Object.assign(template.defaults, {
    minimize: false,
    escape: false,
})
Object.assign(template.defaults.imports, {
    Object,Array,String,
    valuelize(e) {
        return JSON.stringify(e)
    },
})

module.exports = template;