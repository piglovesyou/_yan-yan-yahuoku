
var assert = require('assert');

function CollectorBase(params) {
  assert(params.token || params.category);
  this.token = params.token;
  this.category = params.category;
  this.offset = params.offset;
  this.count = params.count;

  this.perPage;
  this.maxPage = Number.MAX_VALUE;
}

CollectorBase.prototype.request = goog.abstractMethod;

CollectorBase.prototype.generatePromise = function() {
  return this.persistentRequest({}, this.getPage());
};

CollectorBase.prototype.getPage = function() {
  return Math.floor(this.offset / this.perPage + 1);
};

CollectorBase.prototype.persistentRequest = function(result, page) {

  return this.request(page)
  .then((function(r) {

    var isFirst = this.getPage() == page;
    if (isFirst) {
      result.total = r.total;
      result.items = r.items.slice(Math.max(this.offset - page * this.perPage));
    } else {
      result.items = result.items.concat(r.items).slice(0, this.count);
    }

    var len = result.items.length;
    if (this.count > len &&
        r.total > this.offset + len &&
        ++page <= this.maxPage) {
      return this.persistentRequest.call(this, result, page);
    } else {
      return result;
    }
  }).bind(this)).fail(function(e) {
    console.log(e.stack);
  });
}

module.exports = CollectorBase;

