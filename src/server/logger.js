const log4js = require('log4js');
log4js.configure({
    appenders: {
        my: {
            type: 'file',
            filename: 'my.log'
        }
    },
    categories: {
        default: {
            appenders: ['my'],
            level: 'debug'
        }
    }
});
let logger = log4js.getLogger('my');
module.exports = (name,e)=>{
    logger.debug(name + JSON.stringify(e,null,2))
}