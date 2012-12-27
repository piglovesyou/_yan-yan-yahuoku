
/**
 * @fileoverview Route handler for incremental search.
 */

var _ = require('underscore');
var completer = require('../sources/category/completer');

module.exports.suggest = function (req, res) {
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

