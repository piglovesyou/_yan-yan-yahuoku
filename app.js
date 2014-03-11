
var port = process.argv[2] || 3000;

/**
 * Module dependencies.
 */
var express = require('express');
var routes = require('./routes');
var http = require('http');
var path = require('path');


var stylus = require('stylus'),
    _ = require('underscore'),
    app = express();

// Configuration



app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(stylus.middleware({
  src: __dirname + '/public',
  compile: function(str, path) {
    return stylus(str)
      .set('filename', path)
      .set('compress', true)
      .use(require('nib')());
  }
}));
app.use(express.cookieParser(require('secret-strings').AUC_PRO.CONSUMER_SECRET));
app.use(express.session());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));





app.configure('development', function() {
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function() {
  app.use(express.errorHandler());
});



// Routes

_.each(require('./routes'), function(listener, path) {
  app.get(path == 'index' ? '/' : '/' + path, listener);
});

_.each(require('./routes/auth'), function(listener, path) {
  app.get('/auth/' + path, listener);
});


_.each(require('./routes/auction'), function(listener, path) {
  app.get('/auction/' + path, listener);
});



// Deprecated
_.each(require('./routes/yahoo_get'), function(listener, path) {
  app.get('/y/' + path, listener);
});

_.each(require('./routes/yahoo_post'), function(listener, path) {
  app.post('/y/' + path, listener);
});

_.each(require('./routes/suggest'), function(listener, path) {
  app.get('/s/' + path, listener);
});


http.createServer(app).listen(app.get('port'), function() {
  console.log('Express server listening on port ' + app.get('port'));
});
