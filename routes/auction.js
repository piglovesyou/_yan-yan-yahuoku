
var express = require('express');
var router = express.Router();
var Q = require('q');
var yahoo = require('../sources/net/yahoo');
var outError = require('../sources/promise/promise');
var string = require('../sources/string/string');
var _ = require('underscore');

var yahooGet = Q.denodeify(yahoo.get);



router.get('/', index);
router.get('/search', asYahooRequest('search'));
router.get('/categoryLeaf', asYahooRequest('categoryLeaf'));



function index(req, res) {
  res.send('respond with a resource');
}

function asYahooRequest(yahooPath) {
  return function(req, res) {
    yahooGet(yahooPath, req.query)
    .then(JSON.parse)
    .then(resolveDisplayValue)
    .then(function(json) {
      res.status(200);
      res.contentType('application/json; charset=utf-8');
      res.send(json);
    })
    .catch(function(err) {
      outError(err);
      res.send({});
    });
  }
}

function resolveDisplayValue(json) {
  // TODO: Add properties by using "string" utility.
  var items = goog.getObjectByName('ResultSet.Result.Item', json);
  if (items) {
    _(items).each(function(i) {
      if (i.CurrentPrice)
          i.displayCurrentPrice = string.renderPrice(i.CurrentPrice);
      if (i.EndTime) // Use "moment"
          i.displayEndTime = string.renderEndDate(i.EndTime);
    });
  }
  return json;
}

module.exports = router;
