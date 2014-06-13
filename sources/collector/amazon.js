
var Q = require('q');
var assert = require('assert');
var OperationHelper = require('apac').OperationHelper;
var SECRET_STRINGS = require('secret-strings').AUC_PRO;
var CollectorBase = require('./collectorbase');
var outError = require('../promise/promise');

var opHelper = new OperationHelper({
    awsId: SECRET_STRINGS.AMAZON_AWS_ID,
    awsSecret: SECRET_STRINGS.AMAZON_SECRET,
    assocId: SECRET_STRINGS.AMAZON_ASSOCIATE_TAG
});


module.exports.collect = collect;



/**
 * @resolve { {
 *  total: number,
 *  items: Array.<Object>
 * } }
 */
function collect(params) {
  var collector = new Amazon(params);
  return collector.generatePromise();
}

function Amazon(params) { goog.base(this, params) }
goog.inherits(Amazon, CollectorBase);

Amazon.prototype.generatePromise = function() {
  var d = Q.defer();

  opHelper.execute('ItemSearch', {
    'SearchIndex': this.category ? getSearchIndex(this.category) : null,
    'Keywords': this.tolken,
    'ResponseGroup': 'ItemAttributes,Offers'
  }, function(result) {

    var Items = goog.getObjectByName('ItemSearchResponse.Items', result);
    if (Items[0]) {
      var total = +(Items[0].TotalResults || [])[0];
      var items = Items[0].Item;
      if (total != null && items) {
        d.resolve({
          total: +total,
          items: items
        });
        return;
      }
    }
    throw new Error('response is something wrong');
  });
  return d.promise;
};

function getSearchIndex(category) {
  switch (category) {
    case 'book':
      return 'Books';
  }
  assert.fail();
}
