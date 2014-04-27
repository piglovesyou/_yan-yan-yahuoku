
var express = require('express');
var router = express.Router();
var Q = require('q');
var yahoo = require('../sources/net/yahoo');
var outError = require('../sources/promise/promise');
var string = require('../sources/string/string');

var yahooGet = Q.denodeify(yahoo.get);



router.get('/', index);
router.get('/search', search);



function index(req, res) {
  res.send('respond with a resource');
}

function search(req, res) {
  yahooGet('search', req.query)
  .then(JSON.parse)
  .then(function(data) {
    // TODO: Add properties by using "string" utility.
    return data;
  })
  .then(function(data) {
    res.status(200);
    res.contentType('application/json; charset=utf-8');
    res.send(data);
  })
  .catch(function(err) {
    outError(err);
    res.send({});
  });
}

module.exports = router;
