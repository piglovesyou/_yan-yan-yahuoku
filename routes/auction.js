
var querystring = require('querystring');
var path = require('path');
var express = require('express');
var Q = require('q');
var yahoo = require('../sources/net/yahoo');
var outError = require('../sources/promise/promise').outError;
var string = require('../sources/string/string');
var _ = require('underscore');

var yahooGet = Q.denodeify(yahoo.get);

var AFFILIATE_BASE = require('secret-strings').AUC_PRO.AFFILIATE_BASE;


module.exports = {};
module.exports['/'] = index;
module.exports['/search'] = handleItemsRequest;
module.exports['/categoryLeaf'] = handleItemsRequest;
module.exports['/auctionItem'] = handleDetailRequest;



function handleDetailRequest(req, res) {
  yahooGet('auctionItem', req.query)
  .then(JSON.parse)
  .then(detailResolver)
  .then(getJsonResponseStep(res))
  .catch (getErrorResponseStep(res));
}

function getJsonResponseStep(res) {
  return function(json) {
    res.status(200);
    res.contentType('application/json; charset=utf-8');
    res.send(json);
  }
}

function getErrorResponseStep(res) {
  return function(err) {
    outError(err);
    res.send({});
  }
}

function index(req, res) {
  res.send('respond with a resource');
}

function handleItemsRequest(req, res) {
  var endpoint = path.basename(req.route.path);
  Q.all(calcPages(+req.query.offset, +req.query.count).map(function(page) {
    var dest = {};
    goog.object.extend(dest, req.query, {page: page});
    return yahooGet(endpoint, dest)
    .then(JSON.parse)
    .then(itemsResolver);
  })).then(mergeItemsResponse)
  .then(getJsonResponseStep(res))
  .catch (getErrorResponseStep(res));
}

function mergeItemsResponse(results) {
  var dest = results[0];
  var destMeta = goog.getObjectByName('ResultSet.@attributes', results[0]);
  var destResult = goog.getObjectByName('ResultSet.Result', results[0]);
  // destMeta.totalResultsReturned = +destMeta.totalResultsReturned;
  for (var i = 1; i < results.length; i++) {
    var meta = goog.getObjectByName('ResultSet.@attributes', results[i]);
    var items = goog.getObjectByName('ResultSet.Result.Item', results[i]);
    // destMeta.totalResultsReturned += +meta.totalResultsReturned;
    destResult.Item = destResult.Item.concat(items);
  }
  return dest;
}

/** @return {Promise} */
function getYahooList(offset, count) {
  return Q.all(calcPages(+req.query.offset, +req.query.count).map(function(page) {
    var dest = {};
    goog.object.extend(dest, req.query, {page: page});
    return yahooGet(endpoint, dest)
    .then(JSON.parse)
    .then(resolver);
  })).then(mergeYahooListResult);
}

function mergeYahooListResult(results) {
  var dest = results[0];
  var destMeta = goog.getObjectByName('ResultSet.@attributes', results[0]);
  var destResult = goog.getObjectByName('ResultSet.Result', results[0]);
  destMeta.totalResultsReturned = +destMeta.totalResultsReturned;
  for (var i = 1; i < results.length; i++) {
    var meta = goog.getObjectByName('ResultSet.@attributes', results[i]);
    var items = goog.getObjectByName('ResultSet.Result.Item', results[i]);
    destMeta.totalResultsReturned += +meta.totalResultsReturned;
    destResult.Item = destResult.Item.concat(items);
  }
  return dest;
}

var PER_PAGE = 20;
function calcPages(offset, count) {
  var pages = [];
  var last;
  pages.push(last = offset / PER_PAGE + 1);
  while ((count -= PER_PAGE) > 0) {
    pages.push(++last);
  }
  return pages;
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

