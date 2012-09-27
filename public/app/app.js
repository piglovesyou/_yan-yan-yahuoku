
goog.provide('App');

goog.require('goog.ui.Component');
goog.require('goog.events.EventType');
goog.require('app.ui.ThousandRows');

goog.require('app.events.EventCenter');
goog.require('app.controller.Frames');
goog.require('app.controller.Container');
goog.require('app.controller.Tabs');
goog.require('app.dom.ViewportSizeMonitor');
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


App.prototype.initModel_ = function () {
  var model = app.Model.getInstance();
  var tabIds = model.getTabIds();
  if (!tabIds) {
    var tabId = goog.ui.IdGenerator.getInstance().getNextUniqueId();
    model.setTabIds([tabId]);
    model.setTabQuery(tabId, {
      'query': '',
      'category': {
        'id': 0,
        'path': ''
      }
    });
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

  var frames;
  /**
   * @type {app.controller.Frames}
   */
  this.frames_ = frames = new app.controller.Frames(tabs.getCurrSelectedTab().getId(), dh);
  this.addChild(frames);
  frames.decorate(this.framesElement_);

  // goog.asserts.assert(tabs.getChildCount() > 0, 'Tab has to be more than 1.');
  // goog.asserts.assert(frames.getChildCount() == 1, 'Frame has to be only one at decorating phase.');
};

App.prototype.enterDocument = function () {
  this.getHandler()
    .listen(
        app.events.EventCenter.getInstance(),
        app.events.EventCenter.EventType.TAB_CHANGED, this.handleTabChanged_);
  goog.base(this, 'enterDocument');
};

App.prototype.handleTabChanged_ = function (e) {
  this.frames_.selectFrame(e.data.tab.getId());
};


/** @inheritDoc */
App.prototype.canDecorate = function (element) {
  if (element) {
    var dh = this.getDomHelper();
    var toolbar = dh.getElementByClass('toolbar', element);
    var tabs = dh.getElementByClass('tabs', element);
    var frames = dh.getElementByClass('main-frame', element);
    // var container = dh.getElementByClass('container', element);
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


App.prototype.disposeInternal = function () {
  if (this.frames_) {
    this.frames_.dispose();
    this.frames_ = null;
  }
  goog.base(this, 'disposeInternal');
};
