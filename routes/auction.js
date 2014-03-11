
var yahoo = require('../sources/net/yahoo');
var Q = require('q');

yahoo.get = Q.denodeify(yahoo.get);




module.exports.search = search;

function search(req, res) {
  yahoo.get('search', req.query)
  .then(function(data) {
    res.status(200);
    res.set({ 'content-type': 'application/json' });
    res.send(data);
  })
  .catch(function(err) {
    console.log(err);
  });
}
