
var assert = require('assert');

function CollectorBase(params) {
  assert(params.token || params.category);
  this.token = params.token;
  this.category = params.category;
}

CollectorBase.prototype.generatePromise = goog.abstractMethod;

module.exports = CollectorBase;

