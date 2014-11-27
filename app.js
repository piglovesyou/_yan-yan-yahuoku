
var express = require('express');
var Path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var _ = require('underscore');

var port = process.argv[2] || 3000;
global.goog = require('closure').Closure({
  CLOSURE_BASE_PATH: 'libs/closure-library/closure/goog/'
});

var app = express();

// view engine setup
// app.set('views', Path.join(__dirname, 'views'));
// app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(Path.join(__dirname, 'public')));

// The app doesn't distinguish methods.
mapRoute('/', require('./routes'));
mapRoute('/auction', require('./routes/auction'));

function mapRoute(prefix, routes) {
  _.each(routes, function(handler, route) {
    app.use(Path.resolve(prefix, route), handler);
  });
}

// catch 404 and forwarding to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


app.listen(port);


module.exports = app;
