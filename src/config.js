const path = require('path');
module.exports = {
    componentDir: path.resolve(__dirname, './Components'),
    previewOutputPath:path.resolve(__dirname, './gui/Preview/App.vue'),
    distPath:path.resolve(__dirname, 'dist'),
    target:{
        dir:'.pager',
        pages:'Pages',
        comDir:'Components',
        tempName:'.templates.json',
        pageName:'output.vue'
    }
}