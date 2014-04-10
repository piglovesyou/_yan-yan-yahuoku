
var Q = require('q');
var yahoo = require('../sources/net/yahoo');
var outError = require('../sources/promise/promise');
var string = require('../sources/string/string');

yahoo.get = Q.denodeify(yahoo.get);



module.exports.search = search;

function search(req, res) {
  yahoo.get('search', req.query)
  .then(JSON.parse)
  .then(function(data) {
    // TODO: Add properties by using "string" utility.
  })
  .then(function(data) {
    res.status(200);
    res.set({ 'content-type': 'application/json' });
    res.send(data);
  })
  .catch(function(err) {
    outError(err);
    res.send({});
  });
}
