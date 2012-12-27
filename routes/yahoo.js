
/**
 * @fileoverview Route handler for yahoo api.
 */

var yapi = require('../sources/net/yahooapi');



// Raw request with GET parameter.
[
  'categoryTree',
  'categoryLeaf',
  'auctionItem',
  'search'
].forEach(function (path) {
  module.exports[path] = function (req, res) {
    yapi.requestGet(path, req.query, function (err, data) {
      if (err) res.end('{}');
      res.writeHead(200, {
        'Content-Type': 'application/json;charset=UTF8'
      });
      res.end(data);
    });
  };
});

