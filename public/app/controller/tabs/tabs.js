
goog.provide('app.controller.Tabs');

goog.require('app.controller.TabAdder');
goog.require('app.controller.Tab');
goog.require('app.events.EventCenter');
goog.require('goog.ui.Component');
goog.require('goog.fx.DragListGroup');
goog.require('goog.asserts');
goog.require('app.string');


/**
 * @param {goog.dom.DomHelper=} opt_domHelper
 * @constructor
 * @extends {goog.ui.Component}
 */
app.controller.Tabs = function (opt_domHelper) {
  goog.base(this, opt_domHelper);
};
goog.inherits(app.controller.Tabs, goog.ui.Component);


/** @inheritDoc */
app.controller.Tabs.prototype.enterDocument = function () {
  goog.base(this, 'enterDocument');
  this.adder_.enterDocument();
  this.getHandler()
      .listen(this, app.controller.Tab.EventType.SELECT, this.handleTabSelected_)
      .listen(this, app.controller.Tab.EventType.DELETE, this.handleTabDelBtnClicked_)
      .listen(this, app.controller.TabAdder.EventType.CLICK, this.handleAdderClicked_);
};


/**
 * @param {goog.events.Event} e
 */
app.controller.Tabs.prototype.handleTabSelected_ = function (e) {
  var oldTab = this.currSelectedTab_;
  var newTab = e.target;
  if (oldTab.getId() == newTab.getId()) return;

  oldTab.processSelected(false);
  newTab.processSelected(true);
  this.currSelectedTab_ = newTab;
};


/** @inheritDoc */
app.controller.Tabs.prototype.exitDocument = function (e) {
  this.adder_.exitDocument();
  goog.base(this, 'exitDocument');
};


app.controller.Tabs.prototype.handleTabDelBtnClicked_ = function (e) {
  var child = e.target;
  var index = app.controller.util.getChildIndex(this, child);
  (this.getChildAt(index + 1) || this.getChildAt(index - 1)).dispatchSelect();

  this.removeChild(child, true).dispose();

  app.model.setTabIds(this.getTabIds());
  this.repositionAdder_();
};


app.controller.Tabs.prototype.handleAdderClicked_ = function (e) {
  this.insertNewTab_().dispatchSelect();
  this.repositionAdder_();
};


/** @inheritDoc */
app.controller.Tabs.prototype.decorateInternal = function (element) {
  var dh = this.getDomHelper();

  var tabAdder = this.adder_ = new app.controller.TabAdder(dh);
  // We don't deal with it as a child. Only tabs are.
  tabAdder.setParentEventTarget(this);
  tabAdder.createDom();
  dh.append(this.getElement(), tabAdder.getElement());

  var tabIds = app.model.getTabIds();
  goog.asserts.assert(tabIds, 'We have to have tab ids.');

  // Element to decorate must be only 1.
  var tabElms = dh.getChildren(this.contentElement_);
  goog.asserts.assert(tabIds.length >= tabElms.length, 'Too many tab elements.');

  goog.array.forEach(tabIds, function (tabId, index) {
    var tab = new app.controller.Tab(tabId, dh);

    var tabElm = tabElms[index];
    if (tabElm) {
      var canDecorate = tab.canDecorate(tabElm);
      goog.asserts.assert(canDecorate, 'cannot decorate');
      tab.decorateInternal(tabElm);
    } else {
      tab.createDom();
      tabElm = tab.getElement();
      dh.append(this.getContentElement(), tab.getElement());
    }
    this.addChildAt(tab, index);

    if (goog.dom.classes.has(tabElm, 'selected')) {
      goog.asserts.assert(!this.currSelectedTab_, 'Two or more selected tab element.');
      this.currSelectedTab_ = tab;
    }
  }, this);

  this.repositionAdder_();
  this.setupDragListGroup_();
};


app.controller.Tabs.prototype.insertNewTab_ = function () {
  var dh = this.getDomHelper();
  var lastIndex = this.getLastTabIndex_();
  var tab = new app.controller.Tab(goog.ui.IdGenerator.getInstance().getNextUniqueId(), dh);
  this.addChildAt(tab, lastIndex + 1);
  app.model.setTabIds(this.getTabIds());
  tab.createDom();
  dh.append(this.getContentElement(), tab.getElement()); // <-- Because I want do this, I don't addChildAt(tab, index, true).
  tab.enterDocument();
  this.setupDragListGroup_();
  return tab;
};


/**
 * @type {app.controller.TabAdder}
 */
app.controller.Tabs.prototype.adder_;


app.controller.Tabs.prototype.repositionAdder_ = function () {
  var lastEl = this.getLastTab_().getElement();
  var pos = goog.style.getPageOffset(lastEl);
  var minusMargin = 3;
  goog.style.setPageOffset(this.adder_.getElement(),
      pos.x + lastEl.offsetWidth - minusMargin, pos.y + 1);
};


app.controller.Tabs.prototype.getTabIds = function () {
  var ids = [];
  this.forEachChild(function (child) {
    if (child instanceof app.controller.Tab) ids.push(child.getId());
  });
  return ids;
};


/**
 * @return {app.controller.Tab}
 */
app.controller.Tabs.prototype.getLastTab_ = function () {
  var tab;
  goog.array.findRight(this.getChildIds(), function (id) {
    var child = this.getChild(id);
    if (child && child instanceof app.controller.Tab) {
      tab = child;
      return true;
    }
    return false;
  }, this);
  goog.asserts.assert(tab, 'Must be a tab');
  return tab;
};


/**
 * TODO: We don't do this. We just grab a child of the last index.
 * @return {number}
 */
app.controller.Tabs.prototype.getLastTabIndex_ = function () {
  var index;
  goog.array.findRight(this.getChildIds(), function (id, i) {
    var child = this.getChild(id);
    if (child && child instanceof app.controller.Tab) {
      index = i;
      return true;
    }
    return false;
  }, this);
  goog.asserts.assertNumber(index, 'Must be a tab index');
  return index;
};


/**
 * @type {?app.controller.Tab}
 */
app.controller.Tabs.prototype.currSelectedTab_;


/**
 * @return {?app.controller.Tab}
 */
app.controller.Tabs.prototype.getCurrSelectedTab = function () {
  return this.currSelectedTab_;
};


app.controller.Tabs.prototype.draggingClassName_ = 'tab-dragging';


/**
 * @type {?goog.fx.DragListGroup}
 */
app.controller.Tabs.prototype.dragListGroup_;


/**
 * @type {Element}
 */
app.controller.Tabs.prototype.contentElement_;


/** @inheritDoc */
app.controller.Tabs.prototype.getContentElement = function () {
  return this.contentElement_;
};


app.controller.Tabs.prototype.setupDragListGroup_ = function () {
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
      this.findChildByElement_(e.currDragItem).dispatchSelect();
    })
  this.dragListGroup_.init();
};


/**
 * @param {Element} element
 * @return {app.controller.Tab}
 */
app.controller.Tabs.prototype.findChildByElement_ = function (element) {
  var child;
  goog.array.find(this.getChildIds(), function (id) {
    var c = this.getChild(id);
    if (c && element == c.getElement()) {
      child = c;
      return true;
    }
    return false;
  }, this);
  return /** @type {app.controller.Tab} */(child);
};


app.controller.Tabs.prototype.createFixTabWidthStylesheet_ = function (width) {
  var styleString = '.tabs-content > .tab,.' + 
                    this.draggingClassName_ +
                    '{width: ' + width + 'px;}';
  return goog.style.installStyles(styleString)
};


app.controller.Tabs.prototype.canDecorate = function (element) {
  var content = goog.dom.getElementByClass('tabs-content', element);
  if (content) {
    this.contentElement_ = content;
    this.setElementInternal(element);
    return true;
  }
  return false;
};


app.controller.Tabs.prototype.disposeInternal = function () {
  if (this.adder_) {
    this.adder_.dispose();
    this.adder_ = null;
  }
  goog.base(this, 'disposeInternal');
};









