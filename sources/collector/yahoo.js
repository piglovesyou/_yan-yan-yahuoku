
var Q = require('q');
var assert = require('assert');
var OperationHelper = require('apac').OperationHelper;
var string = require('../string/string');
// var SECRET_STRINGS = require('secret-strings').AUC_PRO;
var CollectorBase = require('./collectorbase');
var outError = require('../promise/promise');

var yahoo = require('../net/yahoo');
var yahooGet = Q.denodeify(yahoo.get);
var AFFILIATE_BASE = require('secret-strings').AUC_PRO.AFFILIATE_BASE;



module.exports.collect = collect;



/**
 * @resolve { {
 *  total: number,
 *  items: Array.<Object>
 * } }
 */
function collect(params) {
  var collector = new Yahoo(params);
  return collector.generatePromise();
}

function Yahoo(params) {
  goog.base(this, params) 

  this.perPage = 20;
};
goog.inherits(Yahoo, CollectorBase);

Yahoo.prototype.request = function(page) {
  var endpoint = this.token && goog.isString(this.token) ?
    'search' : 'categoryLeaf';

  return yahooGet(endpoint, {
    'query': this.token,
    'category': null,
    'page': page
  })
  .then(JSON.parse)
  .then(buildResult);
};

function buildResult(json) {
  var items = goog.getObjectByName('ResultSet.Result.Item', json);
  var total = +goog.getObjectByName('ResultSet.@attributes.totalResultsAvailable', json);
  if (items && goog.isNumber(total)) {
    itemsResolver(items);
    return {
      total: total,
      items: items
    };
  }
  throw new Error('response was something wrong');
}

function itemsResolver(items) {
  items.forEach(function(i) {
    if (i.CurrentPrice)
        i.CurrentPrice = string.renderPrice(i.CurrentPrice);
    if (i.EndTime) // Use "moment"
        i.EndTime = string.renderEndDate(i.EndTime);
  });
}
