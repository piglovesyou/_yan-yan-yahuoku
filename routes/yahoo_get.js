
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

  'watchList'

].forEach(function(path) {
  module.exports[path] = function(req, res) {
    var oauth = req.session && req.session.oauth;
    if (oauth && oauth.access_token && oauth.access_token_secret) {
      yahoo.postWithOAuth(oauth, path, req.body, function(err, data, response) {
        if (err) {
          // TODO: Care this.
          res.send('too bad.' + JSON.stringify(err));
        } else {
          res.send('posted successfully...!');
        }
      });
    } else {
      // TODO: Tell client that it should login first.
      res.send('fail.');
    }
  };
});
