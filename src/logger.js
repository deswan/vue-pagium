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
    let logger = log4js.getLogger(file);
    return (name,e)=>{
        logger.debug(name + (e ? JSON.stringify(e,null,2) : ''))
    }
}
