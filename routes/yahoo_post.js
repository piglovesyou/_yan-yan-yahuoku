
/**
 * @fileoverview Route handler for POST request to yahoo api.
 */

var yahoo = require('../sources/net/yahoo');


[

  'watchList'

].forEach(function(path) {
  module.exports[path] = function(req, res) {
    var oauth = req.session && req.session.oauth;
    if (oauth && oauth.access_token && oauth.access_token_secret) {
      yahoo.post(oauth, path, req.body, function (err, data, response) {
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




