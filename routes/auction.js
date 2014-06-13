
var querystring = require('querystring');
var express = require('express');
var router = express.Router();
var Q = require('q');
var yahoo = require('../sources/net/yahoo');
var outError = require('../sources/promise/promise').outError;
var string = require('../sources/string/string');
var _ = require('underscore');

var yahooGet = Q.denodeify(yahoo.get);

var AFFILIATE_BASE = require('secret-strings').AUC_PRO.AFFILIATE_BASE;


router.get('/', index);
router.get('/search', asYahooRequest('search', itemsResolver));
router.get('/categoryLeaf', asYahooRequest('categoryLeaf', itemsResolver));
router.get('/auctionItem', asYahooRequest('auctionItem', detailResolver));



function index(req, res) {
  res.send('respond with a resource');
}

function asYahooRequest(yahooPath, resolver) {
  return function(req, res) {
    yahooGet(yahooPath, req.query)
    .then(JSON.parse)
    .then(resolver)
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

function detailResolver(json) {
  var detail = goog.getObjectByName('ResultSet.Result', json);

  detail.AuctionItemUrl = makeAffiliateLink(detail.AuctionItemUrl);
  detail.StartTime = string.renderDate(detail.StartTime);
  detail.EndTime = string.renderEndDate(detail.EndTime);
  detail.Initprice = string.renderPrice(detail.Initprice);
  detail.Price = string.renderPrice(detail.Price);
  detail.Bidorbuy = string.renderPrice(detail.Bidorbuy);

  return json;
}

function makeAffiliateLink(itemUrl) {
  return AFFILIATE_BASE +
      '&vc_url=' + querystring.escape(itemUrl);
}

function itemsResolver(json) {
  // TODO: Add properties by using "string" utility.
  var items = goog.getObjectByName('ResultSet.Result.Item', json);
  if (items) {

    if (!_.isArray(items)) {
      // XXX: Fuck yahoo it returns an object when a result total is 1.
      var Result = goog.getObjectByName('ResultSet.Result', json);
      items = Result.Item = [items];
    }

    _(items).each(function(i) {
      if (i.CurrentPrice)
          i.CurrentPrice = string.renderPrice(i.CurrentPrice);
      if (i.EndTime) // Use "moment"
          i.EndTime = string.renderEndDate(i.EndTime);
    });
  }
  return json;
}

module.exports = router;
