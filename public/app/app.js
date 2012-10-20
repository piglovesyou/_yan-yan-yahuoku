
goog.provide('App');

goog.require('goog.ui.Component');
goog.require('goog.events.EventType');
goog.require('app.ui.ThousandRows');

goog.require('app.events.EventCenter');
goog.require('app.controller.Frames');
goog.require('app.controller.Container');
goog.require('app.controller.Tabs');
goog.require('app.dom.ViewportSizeMonitor');
goog.require('app.ui.ContextMenu');
goog.require('app.Model');


/**
 * @param {goog.dom.DomHelper=} opt_domHelper
 * @constructor
 * @extends {goog.ui.Component}
 */
App = function (opt_domHelper) {
  goog.base(this, opt_domHelper);

  this.initModel_();
};
goog.inherits(App, goog.ui.Component);
goog.addSingletonGetter(App);


App.prototype.initModel_ = function () {
  var tabIds = app.model.getTabIds();
  if (!tabIds) {
    var tabId = goog.ui.IdGenerator.getInstance().getNextUniqueId();
    app.model.setTabIds([tabId]);
    app.model.setTabQuery(tabId, app.model.createEmptyTab());
  }
};


/** @inheritDoc */
App.prototype.enterDocument = function () {
  goog.base(this, 'enterDocument');
};


/** @inheritDoc */
App.prototype.decorateInternal = function (element) {
  this.initTabAndFrame_();
};

App.prototype.initTabAndFrame_ = function () {
  var dh = this.getDomHelper();

  var tabs;
  /**
   * @type {app.controller.Tabs}
   */
  this.tabs_ = tabs = new app.controller.Tabs(dh);
  this.addChild(tabs);
  tabs.decorate(this.tabsElement_);
};


App.prototype.getFrameContainerElement = function () {
  return this.framesElement_;
};


/** @inheritDoc */
App.prototype.canDecorate = function (element) {
  if (element) {
    var dh = this.getDomHelper();
    var toolbar = dh.getElementByClass('toolbar', element);
    var tabs = dh.getElementByClass('tabs', element);
    var frames = dh.getElementByClass('main-frame', element);
    if (toolbar && tabs && frames) {
      this.toolbarElement_ = toolbar;
      this.tabsElement_ = tabs;
      this.framesElement_ = frames;
      this.setElementInternal(element);
      return true;
    }
  }
  return false;
};


App.prototype.affiliateBase_;


App.prototype.setAffiliateBase = function (base) {
  console.log(base);
  this.affiliateBase_ = base;
};


App.prototype.getAffiliateBase = function () {
  return this.affiliateBase_;
};


App.prototype.disposeInternal = function () {
  if (this.frames_) {
    this.frames_.dispose();
    this.frames_ = null;
  }
  goog.base(this, 'disposeInternal');
};
