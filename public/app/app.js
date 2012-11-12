
goog.provide('App');

goog.require('app.Model');
goog.require('app.dom.ViewportSizeMonitor');
goog.require('app.events.EventCenter');
goog.require('app.ui.Container');
goog.require('app.ui.ContextMenu');
goog.require('app.ui.Frames');
goog.require('app.ui.Tabs');
goog.require('app.ui.ThousandRows');
goog.require('app.ui.WelcomeDialog');
goog.require('app.ui.common.Dialog');
goog.require('goog.events.EventType');
goog.require('goog.ui.Component');


/**
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper.
 * @constructor
 * @extends {goog.ui.Component}
 */
App = function(opt_domHelper) {
  goog.base(this, opt_domHelper);

  this.initModel_();

  /**
   * @private
   * @type {app.ui.common.Dialog}
   */
  this.dialog_ = new app.ui.WelcomeDialog(opt_domHelper);
};
goog.inherits(App, goog.ui.Component);
goog.addSingletonGetter(App);


/**
 * @private
 */
App.prototype.initModel_ = function() {
  var tabIds = app.model.getTabIds();
  if (!tabIds) {
    var tabId = goog.ui.IdGenerator.getInstance().getNextUniqueId();
    app.model.setTabIds([tabId]);
    app.model.setTabQuery(tabId, app.model.createEmptyTab());
  }
};


/** @inheritDoc */
App.prototype.enterDocument = function() {
  goog.base(this, 'enterDocument');
  this.getHandler().listen(this.logoElement_,
      goog.events.EventType.CLICK, this.handleLogoClicked_);
};


/**
 * @private
 * @param {goog.events.Event} e A click event.
 */
App.prototype.handleLogoClicked_ = function(e) {
  this.dialog_.launch();
  e.preventDefault();
};


/** @inheritDoc */
App.prototype.decorateInternal = function(element) {
  this.initTabAndFrame_();
};


/**
 * @private
 */
App.prototype.initTabAndFrame_ = function() {
  var dh = this.getDomHelper();

  var tabs;
  /**
   * @type {app.ui.Tabs}
   */
  this.tabs_ = tabs = new app.ui.Tabs(dh);
  this.addChild(tabs);
  tabs.decorate(this.tabsElement_);
};


/**
 * @return {Element} A wrapper element for frames.
 */
App.prototype.getFrameContainerElement = function() {
  return this.framesElement_;
};


/** @inheritDoc */
App.prototype.canDecorate = function(element) {
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
 * @param {string} base Used for item link.
 */
App.prototype.setAffiliateBase = function(base) {
  this.affiliateBase_ = base;
};


/**
 * @return {string} base.
 */
App.prototype.getAffiliateBase = function() {
  return this.affiliateBase_;
};


/** @inheritDoc */
App.prototype.disposeInternal = function() {
  if (this.frames_) {
    this.frames_.dispose();
    this.frames_ = null;
  }
  goog.base(this, 'disposeInternal');
};
