const path = require('path');
module.exports = {
    componentDir: path.resolve(__dirname, './Components'),
    previewOutputPath:path.resolve(__dirname, './gui/Preview/App.vue'),
    target:{
        dir:'.vue-pagium',
        pages:'Pages',
        comDir:'Components',
        tempName:'.templates.json',
        pageName:'output.vue'
    },
    port: 8001
}