
goog.provide('App');

goog.require('app.Model');
goog.require('app.dom.ViewportSizeMonitor');
goog.require('app.events.EventCenter');
goog.require('app.soy');
goog.require('app.ui.Container');
goog.require('app.ui.Frames');
goog.require('app.ui.Message');
goog.require('app.ui.Tabs');
goog.require('app.ui.ThousandRows');
goog.require('app.ui.Username');
goog.require('app.ui.WelcomeDialog');
goog.require('app.ui.common.AuthWindow');
goog.require('app.ui.common.Dialog');
goog.require('goog.events.EventType');
goog.require('goog.ui.Component');
goog.require('soy');


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

  app.events.EventCenter.getInstance();
};
goog.inherits(App, goog.ui.Component);
goog.addSingletonGetter(App);


/** @type {app.ui.Tabs} */
App.prototype.tabs_;


/** @type {app.ui.Username} */
App.prototype.username_;


/** @type {Element */
App.prototype.username_;


/** @type {Element */
App.prototype.toolbarElement_;


/** @type {Element */
App.prototype.logoElement_;


/** @type {Element */
App.prototype.tabsElement_;


/** @type {Element */
App.prototype.framesElement_;


/** @type {Element */
App.prototype.usernameElement_;


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
  this.dialog_.show();
  e.preventDefault();
};


/** @inheritDoc */
App.prototype.decorateInternal = function(element) {
  var dh = this.getDomHelper();

  this.tabs_ = new app.ui.Tabs(dh);
  this.addChild(this.tabs_);
  this.tabs_.decorate(this.tabsElement_);

  this.username_ = new app.ui.Username(dh);
  this.addChild(this.username_);
  this.username_.decorate(this.usernameElement_);
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
    var username = dh.getElementByClass('username', element);
    var frames = dh.getElementByClass('main-frame', element);
    if (toolbar && logo && tabs && frames) {
      this.toolbarElement_ = toolbar;
      this.logoElement_ = logo;
      this.tabsElement_ = tabs;
      this.framesElement_ = frames;
      this.usernameElement_ = username;
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

  this.username_ = null;
  this.toolbarElement_ = null;
  this.logoElement_ = null;
  this.tabsElement_ = null;
  this.framesElement_ = null;
  this.usernameElement_ = null;

  goog.base(this, 'disposeInternal');
};
