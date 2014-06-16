
global.goog = require('closure').Closure({ CLOSURE_BASE_PATH: 'libs/closure-library/closure/goog/' });
var _ = require('underscore');
var Q = require('q');
Q.longStackSupport = true;
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
    token: '健康',
    category: 'book',
    offset: 10,
    count: 25
  };

  return it('collects some items by searching "地獄"', function(done) {
    collector
    .collect(params)
    .then(verifyTotalAndItems)
    .then(done)
    .fail(outError)
  });

  function verifyTotalAndItems(result) {
    console.log(result.items.length);
    goog.asserts.assert(result.items.length == params.count);
    goog.asserts.assertNumber(result.total);
    goog.asserts.assertArray(result.items);
  }
}

function outError(e) {
  throw new Error(e.stack);
}

