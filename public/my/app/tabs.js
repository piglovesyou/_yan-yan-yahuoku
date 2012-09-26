
goog.provide('my.app.Tabs');

goog.require('my.events.EventCenter');
goog.require('goog.ui.Component');
goog.require('goog.fx.DragListGroup');
goog.require('goog.asserts');
goog.require('my.string');


/**
 * @param {goog.dom.DomHelper=} opt_domHelper
 * @constructor
 * @extends {goog.ui.Component}
 */
my.app.Tabs = function (opt_domHelper) {
  goog.base(this, opt_domHelper);
};
goog.inherits(my.app.Tabs, goog.ui.Component);


my.app.Tabs.prototype.decorateInternal = function (element) {
  var dh = this.getDomHelper();

  var tabIds = my.Model.getInstance().getTabIds();
  goog.asserts.assert(tabIds, 'We have to have tab ids.');

  // Basically, element to decorate supposed to be only 1.
  var tabElms = dh.getChildren(this.contentElement_);
  goog.asserts.assert(tabIds.length >= tabElms.length, 'Too many tab elements.');

  goog.array.forEach(tabIds, function (tabId, index) {
    var tab = new my.app.Tabs.Tab(tabId, dh);
    this.addChild(tab);

    var tabElm = tabElms[index];
    if (tabElm) {
      var canDecorate = tab.canDecorate(tabElm);
      goog.asserts.assert(canDecorate, 'cannot decorate');
      tab.decorateInternal(tabElm);
    } else {
      tab.createDom();

      // TODO: Implement this.insertTab_
      // this.insertTab_(tab);
    }
    tab.renderContent();

    if (goog.dom.classes.has(tabElm, 'selected')) {
      goog.asserts.assert(!this.currSelectedTab_, 'Two or more selected tab element.');
      this.currSelectedTab_ = tab;
    }
  }, this);
  this.setupDragListGroup_();
};


/**
 * @type {?my.app.Tabs.Tab}
 */
my.app.Tabs.prototype.currSelectedTab_;


/**
 * @return {?my.app.Tabs.Tab}
 */
my.app.Tabs.prototype.getCurrSelectedTab = function () {
  return this.currSelectedTab_;
};


my.app.Tabs.prototype.draggingClassName_ = 'tab-dragging';


/**
 * @type {?goog.fx.DragListGroup}
 */
my.app.Tabs.prototype.dragListGroup_;


/**
 * @type {Element}
 */
my.app.Tabs.prototype.contentElement_;


/** @inheritDoc */
my.app.Tabs.prototype.getContentElement = function () {
  return this.contentElement_;
};


my.app.Tabs.prototype.setupDragListGroup_ = function () {
  if (this.dragListGroup_) {
    this.dragListGroup_.dispose();
  }
  this.dragListGroup_ = new goog.fx.DragListGroup;
  // this.dragListGroup_.setDragItemHandleHoverClass('yeah', 'ohh');
  this.dragListGroup_.setDraggerElClass(this.draggingClassName_);
  this.dragListGroup_.addDragList(this.contentElement_, goog.fx.DragListDirection.RIGHT);
  var styleSheetEl;
  this.getHandler()
    .listen(this.dragListGroup_, 'beforedragstart', function (e) {
      styleSheetEl = this.createFixTabWidthStylesheet_(e.currDragItem.offsetWidth);
    })
    .listen(this.dragListGroup_, 'dragend', function (e) {
      goog.style.uninstallStyles(styleSheetEl);

      // Becuase of dragListGroup, tab cannot listen click event by itself.
      // So, we take care of it by here.
      var tab = this.findChildByElement_(e.currDragItem);
      this.selectTab(tab);
    })
  this.dragListGroup_.init();
};


/**
 * @param {my.app.Tabs.Tab} tab
 */
my.app.Tabs.prototype.selectTab = function (tab) {
  if (this.currSelectedTab_.getId() == tab.getId()) return;
  goog.dom.classes.enable(tab.getElement(), 'selected', true);
  goog.dom.classes.enable(this.currSelectedTab_.getElement(), 'selected', false);
  this.currSelectedTab_ = tab;
  my.events.EventCenter.getInstance().dispatch(my.events.EventCenter.EventType.TAB_CHANGED, {
    tab: tab
  });
};

/**
 * @param {Element} element
 * @return {my.app.Tabs.Tab}
 */
my.app.Tabs.prototype.findChildByElement_ = function (element) {
  var child;
  goog.array.find(this.getChildIds(), function (id) {
    var c = this.getChild(id);
    if (c && element == c.getElement()) {
      child = c;
      return true;
    }
    return false;
  }, this);
  return /** @type {my.app.Tabs.Tab} */(child);
};


my.app.Tabs.prototype.createFixTabWidthStylesheet_ = function (width) {
  var styleString = '.tabs-content > .tab,.' + 
                    this.draggingClassName_ +
                    '{width: ' + width + 'px;}';
  return goog.style.installStyles(styleString)
};

my.app.Tabs.prototype.canDecorate = function (element) {
  var content = goog.dom.getElementByClass('tabs-content', element);
  if (content) {
    this.contentElement_ = content;
    this.setElementInternal(element);
    return true;
  }
  return false;
};

/**
 * @param {goog.dom.DomHelper=} opt_domHelper
 * @constructor
 * @extends {goog.ui.Component}
 */
my.app.Tabs.Tab = function (id, opt_domHelper) {
  goog.base(this, opt_domHelper);
  this.setId(id);
};
goog.inherits(my.app.Tabs.Tab, goog.ui.Component);


my.app.Tabs.Tab.prototype.renderContent = function () {
  var model = my.Model.getInstance().getTabQuery(this.getId());
  goog.asserts.assert(model, 'Model should have data here.');

  var result = my.string.getCategoryNameByPath(model['category']['path']);
  if (!result || 'オークション') {
    result = '';
  } else {
    result = '[' + result + ']';
  }
  var result = model['query'];
  if (!result) {
    result = '全てのアイテム';
  }
  goog.dom.setTextContent(this.getContentElement(), result);
};


/**
 * @type {Element}
 */
my.app.Tabs.Tab.prototype.contentElement_;


/**
 * @return {Element}
 */
my.app.Tabs.Tab.prototype.getContentElement = function () {
  console.log(this.contentElement_)
  return this.contentElement_;
};


/** @inheritDoc */
my.app.Tabs.Tab.prototype.decorateInternal = function (element) {
  this.setElementInternal(element);
  goog.style.setUnselectable(element, true, true);
};


/** @inheritDoc */
my.app.Tabs.Tab.prototype.canDecorate = function (element) {
  console.log('yeah');
  if (element) {
    var dh = this.getDomHelper();
    var content = dh.getElementByClass('tab-content', element);
    console.log(content);
    if (content) {
      this.contentElement_ = content;
      return true;
    }
  }
  return false;
};
