
/**
 * @fileoverview Route handler for GET request to yahoo api.
 */

var yahoo = require('../sources/net/yahoo');



// Without OAuth.
[
  'categoryTree',
  'categoryLeaf',
  'auctionItem',
  'search'
].forEach(function(path) {
  module.exports[path] = function(req, res) {
    yahoo.get(path, req.query, function(err, data) {
      if (err) res.end('{}');
      res.writeHead(200, {
        'Content-Type': 'application/json;charset=UTF8'
      });
      res.end(data);
    });
  };
});



// OAuth.
[

  'openWatchList'

].forEach(function(path) {
  module.exports[path] = function(req, res) {
    var oauth = req.session && req.session.oauth || {};
    yahoo.getWithOAuth(oauth, path, req.query, function(err, response, data) {
      res.status(data.statusCode);
      res.writeHead(data.statusCode, {
        'Content-Type': 'application/json;charset=UTF8'
      });
      res.end(response);
    });
  };
});
