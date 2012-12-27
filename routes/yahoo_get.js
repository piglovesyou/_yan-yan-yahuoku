
/**
 * @fileoverview Route handler for GET request to yahoo api.
 */

var yahoo = require('../sources/net/yahoo');



[

  'categoryTree',
  'categoryLeaf',
  'auctionItem',
  'search'

].forEach(function (path) {
  module.exports[path] = function (req, res) {
    yahoo.get(path, req.query, function (err, data) {
      if (err) res.end('{}');
      res.writeHead(200, {
        'Content-Type': 'application/json;charset=UTF8'
      });
      res.end(data);
    });
  };
});
