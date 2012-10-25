
goog.provide('App');

goog.require('goog.ui.Component');
goog.require('goog.events.EventType');
goog.require('app.ui.ThousandRows');

goog.require('app.controller.WelcomeDialog');
goog.require('app.events.EventCenter');
goog.require('app.controller.Frames');
goog.require('app.controller.Container');
goog.require('app.controller.Tabs');
goog.require('app.dom.ViewportSizeMonitor');
goog.require('app.ui.ContextMenu');
goog.require('app.ui.Dialog');
goog.require('app.Model');


/**
 * @param {goog.dom.DomHelper=} opt_domHelper
 * @constructor
 * @extends {goog.ui.Component}
 */
App = function (opt_domHelper) {
  goog.base(this, opt_domHelper);

  this.initModel_();

  /**
   * @type {app.ui.Dialog}
   */
  this.dialog_ = new app.controller.WelcomeDialog(opt_domHelper);
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
  this.getHandler().listen(this.logoElement_, goog.events.EventType.CLICK, this.handleLogoClicked_);
};


App.prototype.handleLogoClicked_ = function (e) {
  this.dialog_.launch();
  e.preventDefault();
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
    var logo = dh.getElementByClass('logo', toolbar);
    var tabs = dh.getElementByClass('tabs', element);
    var frames = dh.getElementByClass('main-frame', element);
    if (toolbar && logo && tabs && frames) {
      this.toolbarElement_ = toolbar;
      this.logoElement_ = logo;
      this.tabsElement_ = tabs;
      this.framesElement_ = frames;
      this.setElementInternal(element);
      return true;
    }
  }
  return false;
};


/**
 * @type {string}
 */
App.prototype.affiliateBase_;


/**
 * @param {string} base
 */
App.prototype.setAffiliateBase = function (base) {
  this.affiliateBase_ = base;
};


/**
 * @return {string} base
 */
App.prototype.getAffiliateBase = function () {
  return this.affiliateBase_;
};


/** @inheritDoc */
App.prototype.disposeInternal = function () {
  if (this.frames_) {
    this.frames_.dispose();
    this.frames_ = null;
  }
  goog.base(this, 'disposeInternal');
};
