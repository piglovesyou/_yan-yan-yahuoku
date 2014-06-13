
global.goog = require('closure').Closure({ CLOSURE_BASE_PATH: 'libs/closure-library/closure/goog/' });
var _ = require('underscore');
var Q = require('q');
goog.require('goog.asserts');






describe('Yahoo Collector', function() {
  testCollector('../sources/collector/yahoo')
});

describe('Amazon Collector', function() {
  testCollector('../sources/collector/amazon');
});



function testCollector(module) {

  var collector = require(module);
  var params = {
    token: '地獄',
    category: 'book'
  };

  return it('collects some items by searching "地獄"', function(done) {
    collector
    .collect(params)
    .then(verifyTotalAndItems)
    .fail(outError)
    .then(done)
  });

}

function outError(e) {
  throw new Error(e);
}

function verifyTotalAndItems(result) {
  goog.asserts.assertNumber(result.total);
  goog.asserts.assertArray(result.items);
}
