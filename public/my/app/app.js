
goog.provide('my.App');

goog.require('goog.ui.Component');
goog.require('goog.events.EventType');
goog.require('my.ui.ThousandRows');

goog.require('my.ds.Xhr');
goog.require('my.app.Container');
goog.require('my.app.Tabs');
goog.require('my.dom.ViewportSizeMonitor');


/**
 * @param {goog.dom.DomHelper=} opt_domHelper
 * @constructor
 * @extends {goog.ui.Component}
 */
my.App = function (opt_domHelper) {
  goog.base(this, opt_domHelper);
};
goog.inherits(my.App, goog.ui.Component);

/** @inheritDoc */
my.App.prototype.enterDocument = function () {
  goog.base(this, 'enterDocument');
};


/** @inheritDoc */
my.App.prototype.decorateInternal = function (element) {
  
  var tabs = new my.app.Tabs;
  tabs.decorate(this.tabsElement_);

  var container = new my.app.Container(this.getDomHelper());
  container.decorate(this.containerElement_);
};

/** @inheritDoc */
my.App.prototype.canDecorate = function (element) {
  if (element) {
    var dh = this.getDomHelper();
    var toolbar = dh.getElementByClass('toolbar', element);
    var tabs = dh.getElementByClass('tabs', element);
    var searchbar = dh.getElementByClass('searchbar', element);
    var container = dh.getElementByClass('container', element);
    if (toolbar && searchbar && container) {
      this.toolbarElement_ = toolbar;
      this.tabsElement_ = tabs;
      this.containerElement_ = container;
      this.setElementInternal(element);
      return true;
    }
  }
  return false;
};
