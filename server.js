var express = require('express');
var app = express();
var path = require('path');
var meta = require('./package.json');
var ejs = require('ejs');
var fs = require('fs');

process.on('uncaughtException', function(err) {
    (app.get('logger') || console).error('Uncaught exception:\n', err.stack);
});

app.set('name', meta.name);
app.set('version', meta.version);
app.set('port', process.env.PORT || 6660);
app.engine('ejs', ejs.renderFile);

let files = fs.readdirSync(__dirname+'/src/Components')
app.set('views', files.map(file=>{
    return __dirname+'/src/Components/'+file;
}));

// app.set('views', path.join(__dirname, 'dist', 'html'));
// app.use(express.static(__dirname + '/dist'));


app.get('/table', function(req, res) {
    console.log('table:'+req.query);
    app
    res.send('hello')
});

app.listen(app.get('port'), function() {
    console.log('[%s] Express server listening on port %d',
        app.get('env').toUpperCase(), app.get('port'));
});
