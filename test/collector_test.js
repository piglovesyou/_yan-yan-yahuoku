
global.goog = require('closure').Closure({ CLOSURE_BASE_PATH: 'libs/closure-library/closure/goog/' });
var _ = require('underscore');
var Q = require('q');
goog.require('goog.asserts');



var amazon = require('../sources/collector/amazon');
var params = {
  token: '地獄',
  category: 'book'
};



describe('Amazon Collector', function() {
  return it('collects some items by searching "地獄"', function(done) {
    amazon
    .collect(params)
    .then(verifyTotalAndItems)
    .then(done);
  });
});



function verifyTotalAndItems(result) {
  goog.asserts.assertNumber(result.total);
  goog.asserts.assertArray(result.items);
}
