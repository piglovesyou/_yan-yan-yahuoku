
/**
 * Module dependencies.
 */

var express = require('express')
  , stylus = require('stylus')
  , RedisStore = require('connect-redis')(express)

var app = module.exports = express.createServer();

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(stylus.middleware({
    src: __dirname + '/public'
  , compile: function (str, path) {
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

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

// Routes

var routes = require('./routes');
app.get('/', routes.index);
app.get('/login', routes.login);
app.get('/logout', routes.logout);

var authRoutes = require('./routes/auth');
authRoutes.getPaths().forEach(function (path) {
  app.get('/auth/' + path, authRoutes[path]);
});

var apiRoutes = require('./routes/api');
apiRoutes.getPaths().forEach(function (path) {
  app.get('/api/' + path, apiRoutes[path]);
});






app.listen(require('secret-strings').AUC_PRO.PORT, function(){
  console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});
