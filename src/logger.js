const log4js = require('log4js');
const path = require('path');
log4js.configure({
    appenders: {
        my: {
            type: 'file',
            filename: path.join(__dirname,'my.log')
        }
    },
    categories: {
        default: {
            appenders: ['my'],
            level: 'debug'
        }
    }
});
module.exports = file=>{
    return log4js.getLogger(file);
}
