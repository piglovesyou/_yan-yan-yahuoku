
var yapi = require('../sources/net/yahooapi');

var PATHS = [
  'categoryTree',
  'categoryLeaf',
  'auctionItem',
  'search'
];

PATHS.forEach(function (path) {
  module.exports[path] = function (req, res) {
    yapi.requestGet(path, req.query, function (err, data) {
      if (err) res.end('{}');
      res.end(data);
    });
  };
});

module.exports.getPaths = function () {return PATHS};

