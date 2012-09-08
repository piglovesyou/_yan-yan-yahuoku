
goog.provide('my.app.Frame');

goog.require('my.app.Container');


/**
 * @constructor
 * @extends {goog.ui.Component}
 */
my.app.Frame = function (opt_domHelper) {
  goog.base(this, opt_domHelper);

  this.container_ = new my.app.Container(this.getDomHelper());
  this.addChild(this.container_);
}
goog.inherits(my.app.Frame, goog.ui.Component);


my.app.Frame.prototype.render = function () {
  goog.base(this, 'render');
  this.container_.render(this.getContentElement());
};


my.app.Frame.prototype.createDom = function () {
  var dh = this.getDomHelper();
  this.setElementInternal(dh.createDom('div', ['frame', 'selected'],
        /* TODO: Do this by SearchBar component.*/
        dh.createDom('div', 'searchbar')));
};




my.app.Frame.prototype.decorateInternal = function (element) {
  goog.base(this, 'decorateInternal', element);
  this.container_.decorate(this.containerElement_);
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
