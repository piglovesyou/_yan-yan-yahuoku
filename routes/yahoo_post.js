
/**
 * @fileoverview Route handler for POST request to yahoo api.
 */

var yahoo = require('../sources/net/yahoo');


[

  'watchList' // XXX: Two request to yahoo are sent. Why?

].forEach(function(path) {
  module.exports[path] = function(req, res) {
    var oauth = req.session && req.session.oauth;
    if (oauth && oauth.access_token && oauth.access_token_secret) {
      yahoo.postWithOAuth(oauth, path, req.body, function(err, response, data) {
        res.writeHead(data.statusCode, {
          'Content-Type': 'application/json;charset=UTF8'
        });
        res.end(response);
      });
    } else {
      // TODO: Tell client that it should login first.
      res.send('fail.');
    }
  };
});




