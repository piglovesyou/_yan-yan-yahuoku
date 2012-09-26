
goog.provide('my.App');

goog.require('goog.ui.Component');
goog.require('goog.events.EventType');
goog.require('my.ui.ThousandRows');

goog.require('my.events.EventCenter');
goog.require('my.app.Frames');
goog.require('my.app.Container');
goog.require('my.app.Tabs');
goog.require('my.dom.ViewportSizeMonitor');
goog.require('my.Model');


/**
 * @param {goog.dom.DomHelper=} opt_domHelper
 * @constructor
 * @extends {goog.ui.Component}
 */
my.App = function (opt_domHelper) {
  goog.base(this, opt_domHelper);

  this.initModel_();
};
goog.inherits(my.App, goog.ui.Component);


my.App.prototype.initModel_ = function () {
  var model = my.Model.getInstance();
  var tabIds = model.getTabIds();
  if (true) { //TODO:  if (!tabIds) {
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
my.App.prototype.enterDocument = function () {
  goog.base(this, 'enterDocument');
};


/** @inheritDoc */
my.App.prototype.decorateInternal = function (element) {
  this.initTabAndFrame_();
};

my.App.prototype.initTabAndFrame_ = function () {
  var dh = this.getDomHelper();

  var tabs;
  /**
   * @type {my.app.Tabs}
   */
  this.tabs_ = tabs = new my.app.Tabs(dh);
  this.addChild(tabs);
  tabs.decorate(this.tabsElement_);

  var frames;
  /**
   * @type {my.app.Frames}
   */
  this.frames_ = frames = new my.app.Frames(tabs.getCurrSelectedTab().getId(), dh);
  this.addChild(frames);
  frames.decorate(this.framesElement_);

  // goog.asserts.assert(tabs.getChildCount() > 0, 'Tab has to be more than 1.');
  // goog.asserts.assert(frames.getChildCount() == 1, 'Frame has to be only one at decorating phase.');
};

my.App.prototype.enterDocument = function () {
  this.getHandler()
    .listen(
        my.events.EventCenter.getInstance(),
        my.events.EventCenter.EventType.TAB_CHANGED, this.handleTabChanged_);
  goog.base(this, 'enterDocument');
};

my.App.prototype.handleTabChanged_ = function (e) {
  this.frames_.selectFrame(e.data.tab.getId());
};


/** @inheritDoc */
my.App.prototype.canDecorate = function (element) {
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


my.App.prototype.disposeInternal = function () {
  if (this.frames_) {
    this.frames_.dispose();
    this.frames_ = null;
  }
  goog.base(this, 'disposeInternal');
};
