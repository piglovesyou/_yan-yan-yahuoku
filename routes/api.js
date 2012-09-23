
var _ = require('underscore');
var yapi = require('../sources/net/yahooapi');
var completer = require('redis-completer');
completer.applicationPrefix('y_cat');


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

var toRowData = function (str) {
  var arr = str.split(':');
  return {
    id: arr[0],
    path: arr[1]
  }
};

module.exports['categorySuggest'] = function (req, res) {
  var token = req.query && req.query.token;
  if (_.isString(token)) {
    var m = +req.query.max_matches;
    var maxMaches = !_.isNaN(m) ?
        Math.min(Math.max(m, 0), 50) : 10;
    completer.search(token, maxMaches, function (err, data) {
      if (err) res.end('[]');
      res.writeHead(200, {'Content-Type': 'application/json;charset=UTF8'});
      var result = [];
      for (var i=0,rowStr=data[i];
           i<maxMaches;
           rowStr=data[++i]) {
        if (rowStr) result.push(toRowData(rowStr));
      }
      res.end(JSON.stringify(result));
    });
  } else {
    res.end('[]');
  }
};

module.exports.getPaths = function () {
  return YAPI_PATHS.concat(MY_PATHS);
};

