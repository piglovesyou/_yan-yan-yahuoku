
goog.provide('my.App');

goog.require('goog.ui.Component');
goog.require('goog.events.EventType');
goog.require('my.ui.ThousandRows');

goog.require('my.events.EventCenter');
goog.require('my.ds.Xhr');
goog.require('my.app.MainFrame');
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
<<<<<<< HEAD
  
  var tabs = new my.app.Tabs;
  tabs.decorate(this.tabsElement_);

  var container = new my.app.Container(this.getDomHelper());
  container.decorate(this.containerElement_);
=======
  this.initTabAndFrame_();
>>>>>>> sortable tabs
};

my.App.prototype.initTabAndFrame_ = function () {
  var dh = this.getDomHelper();

  var tabs = this.tabs_ = new my.app.Tabs(dh);
  this.addChild(tabs);
  tabs.decorate(this.tabsElement_);

  var mainFrame = this.mainFrame_ =
      new my.app.MainFrame(tabs.getCurrSelectedTab().getId(), dh);
  this.addChild(mainFrame);
  mainFrame.decorate(this.mainFrameElement_);

  // goog.asserts.assert(tabs.getChildCount() > 0, 'Tab has to be more than 1.');
  // goog.asserts.assert(mainFrame.getChildCount() == 1, 'Frame has to be only one at decorating phase.');
};

my.App.prototype.enterDocument = function () {
  this.getHandler()
    .listen(
        my.events.EventCenter.getInstance(),
        my.events.EventCenter.EventType.TAB_CHANGED, this.handleTabChanged_);
  goog.base(this, 'enterDocument');
};

my.App.prototype.handleTabChanged_ = function (e) {
  this.mainFrame_.selectFrame(e.data.tab.getId());
};


/** @inheritDoc */
my.App.prototype.canDecorate = function (element) {
  if (element) {
    var dh = this.getDomHelper();
    var toolbar = dh.getElementByClass('toolbar', element);
    var tabs = dh.getElementByClass('tabs', element);
<<<<<<< HEAD
    var searchbar = dh.getElementByClass('searchbar', element);
    var container = dh.getElementByClass('container', element);
    if (toolbar && searchbar && container) {
      this.toolbarElement_ = toolbar;
      this.tabsElement_ = tabs;
      this.containerElement_ = container;
=======
    var mainFrame = dh.getElementByClass('main-frame', element);
    // var container = dh.getElementByClass('container', element);
    if (toolbar && tabs && mainFrame) {
      this.toolbarElement_ = toolbar;
      this.tabsElement_ = tabs;
      this.mainFrameElement_ = mainFrame;
>>>>>>> sortable tabs
      this.setElementInternal(element);
      return true;
    }
  }
  return false;
};
