
var _ = require('underscore');
var yapi = require('../sources/net/yahooapi');
var completer = require('../sources/category/completer');


var YAPI_PATHS = [
  'categoryTree',
  'categoryLeaf',
  'auctionItem',
  'search'
];

YAPI_PATHS.forEach(function (path) {
  module.exports[path] = function (req, res) {
    yapi.requestGet(path, req.query, function (err, data) {
      if (err) res.end('{}');
      res.end(data);
    });
  };
});

var MY_PATHS = [
  'categorySuggest'
];

module.exports['categorySuggest'] = function (req, res) {
  var token = req.query && req.query.token;
  if (_.isString(token)) {
    var m = +req.query.max_matches;
    var maxMaches = !_.isNaN(m) ?
        Math.min(Math.max(m, 0), 50) : 10;

    completer.search(token, maxMaches, function (err, result) {
      if (err) res.end('[]');
      res.writeHead(200, {'Content-Type': 'application/json;charset=UTF8'});
      res.end(JSON.stringify(result));
    });
  } else {
    res.end('[]');
  }
};

module.exports.getPaths = function () {
  return YAPI_PATHS.concat(MY_PATHS);
};

