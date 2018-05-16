const path = require('path');
module.exports = {
    componentDir: path.resolve(__dirname, './Components'),
    previewOutputPath:path.resolve(__dirname, './gui/Preview/App.vue'),
    target:{
        dir:'.pager',
        comDir:'Components',
        tempName:'.templates.json',
        pageName:'Page.vue'
    }
}