
var assert = require('assert');

function CollectorBase(params) {
  assert(params.token || params.category);
  this.token = params.token;
  this.category = params.category;
  this.offset = params.offset;
  this.count = params.count;

  this.perPage;
  this.maxPage;
}

CollectorBase.prototype.generatePromise = goog.abstractMethod;

CollectorBase.prototype.request = goog.abstractMethod;

CollectorBase.prototype.getPage = function() {
  return Math.floor(this.offset / this.perPage + 1);
};

CollectorBase.prototype.persistentRequest = function(result, category, token, page, offset, count) {
  return this.request(category, token, page)
  .then((function(r) {

    var isFirst = this.getPage() == page;
    if (isFirst) {
      result.total = r.total;
      result.items = r.items.slice(Math.max(offset - page * this.perPage));
    } else {
      result.items = result.items.concat(r.items).slice(0, count);
    }

    var len = result.items.length;
    if (count > len &&
        r.total > offset + len &&
        ++page <= this.maxPage) {
      return this.persistentRequest.call(this, result, category, token, page, offset, count);
    } else {
      return result;
    }
  }).bind(this)).fail(function(e) {
    console.log(e.stack);
  });
}

module.exports = CollectorBase;

