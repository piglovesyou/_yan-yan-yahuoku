
/**
 * @fileoverview Route handler for POST request to yahoo api.
 */

var yahoo = require('../sources/net/yahoo');


// Always with OAuth.
[

  'watchList'

].forEach(function(path) {
  module.exports[path] = function(req, res) {
    var oauth = req.session && req.session.oauth || {};
    yahoo.postWithOAuth(oauth, path, req.body, function(err, response, data) {
      res.status(data.statusCode);
      res.writeHead(data.statusCode, {
        'Content-Type': 'application/json;charset=UTF8'
      });
      res.end(response);
    });
  };
});




