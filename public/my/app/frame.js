
goog.provide('my.app.Frame');

goog.require('my.app.Searchbar');
goog.require('my.app.Container');


/**
 * @constructor
 * @extends {goog.ui.Component}
 */
my.app.Frame = function (opt_domHelper) {
  goog.base(this, opt_domHelper);

  this.searchbar_ = new my.app.Searchbar(this.getDomHelper());
  this.addChild(this.searchbar_);
  this.container_ = new my.app.Container(this.getDomHelper());
  this.addChild(this.container_);
}
goog.inherits(my.app.Frame, goog.ui.Component);



my.app.Frame.prototype.createDom = function () {
  var dh = this.getDomHelper();
  this.searchbar_.createDom();
  this.container_.createDom();
  this.setElementInternal(dh.createDom('div', ['frame', 'selected'],
        this.searchbar_.getElement(),
        this.container_.getElement()));
};




my.app.Frame.prototype.decorateInternal = function (element) {
  goog.base(this, 'decorateInternal', element);
  this.container_.decorateInternal(this.containerElement_);
};


my.app.Frame.prototype.canDecorate = function (element) {
  if (element) {
    var dh = this.getDomHelper();
    var searchbar = dh.getElementByClass('searchbar', element);
    var container = dh.getElementByClass('container', element);
    if (container) {
      this.containerElement_ = container;
      return true;
    }
  }
  return false;
};
