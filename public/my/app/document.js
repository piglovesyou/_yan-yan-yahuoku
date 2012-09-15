
goog.provide('my.app.Detail');

goog.require('goog.ui.SplitPane');
goog.require('goog.style');
goog.require('my.ui.ThousandRows');


/**
 * @constructor
 * @extends {goog.ui.SplitPane}
 */
my.app.Detail = function (opt_domHelper) {
  goog.base(this, opt_domHelper);
}
goog.inherits(my.app.Detail, goog.ui.Component);

my.app.Detail.prototype.renderContent = function (data) {
  if (data) {
    // ...
  }
};

my.app.Detail.prototype.createDom = function () {
  var dh = this.getDomHelper();
  var element = dh.createDom('div', 'document', 'yeah');
  this.setElementInternal(element);
};
