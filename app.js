
var port = process.argv[2] || 3000;

/**
 * Module dependencies.
 */

var express = require('express'),
    stylus = require('stylus'),
    RedisStore = require('connect-redis')(express),
    _ = require('underscore'),
    app = express.createServer();

// Configuration

app.configure(function() {
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(stylus.middleware({
    src: __dirname + '/public',
    compile: function(str, path) {
      return stylus(str)
        .set('filename', path)
        .set('compress', true)
        .use(require('nib')());
    }
  }));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  app.use(express.session({
    secret: 'your secret here',
    store: new RedisStore(),
    cookie: {maxAge: 8 * 60 * 60 * 1000}
  }));
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

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

_.each(require('./routes/yahoo'), function(listener, path) {
  app.get('/y/' + path, listener);
});

_.each(require('./routes/suggest'), function(listener, path) {
  app.get('/s/' + path, listener);
});






app.listen(port, function() {
  console.log('Express server listening on port %d in %s mode',
              app.address().port, app.settings.env);
});
