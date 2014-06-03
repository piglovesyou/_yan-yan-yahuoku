
goog.provide('app.header.Tabs');

goog.require('app.Model');
goog.require('app.ViewportSizeMonitor');
goog.require('app.events.EventCenter');
goog.require('app.header.Tab');
goog.require('app.header.TabAdder');
goog.require('goog.asserts');
goog.require('goog.fx.DragListGroup');
goog.require('goog.ui.Component');
goog.require('app.string');
goog.require('app.util');


/**
 * @param {goog.dom.DomHelper=} opt_domHelper A dom helper.
 * @constructor
 * @extends {goog.ui.Component}
 */
app.header.Tabs = function(opt_domHelper) {
  goog.base(this, opt_domHelper);
};
goog.inherits(app.header.Tabs, goog.ui.Component);


/** @inheritDoc */
app.header.Tabs.prototype.enterDocument = function() {
  goog.base(this, 'enterDocument');
  this.adder_.enterDocument();

  this.getHandler()
    .listen(this, app.header.Tab.EventType.SELECT, this.handleTabSelected_)
    .listen(this, app.header.Tab.EventType.DELETE, this.handleTabDelBtnClicked_)
    .listen(this, app.header.TabAdder.EventType.CLICK, this.handleAdderClicked_)
    .listen(this, app.TagInput.EventType.TAG_UPDATE, this.repositionAdder_)
    .listen(app.model, app.events.EventType.AUTH_STATE_CHANGED, this.handleAuthorized_);

  this.setupDragListGroup_();

  this.repositionAdder_();
};


/**
 * @private
 * @param {goog.events.Event} e Dispatched by AuthWindow.
 */
app.header.Tabs.prototype.handleAuthorized_ = function(e) {

};


/**
 * @private
 * @param {goog.events.Event} e Dispatched by AuthWindow.
 */
app.header.Tabs.prototype.handleUnauthorized_ = function(e) { };


/**
 * @private
 * @param {goog.events.Event} e Provided by Tab.
 */
app.header.Tabs.prototype.handleTabSelected_ = function(e) {
  var oldTab = this.currSelectedTab_;
  var newTab = /** @type {?app.header.Tab} */(e.target);
  if (!newTab || oldTab.getId() == newTab.getId()) return;

  oldTab.processSelected(false);
  newTab.processSelected(true);
  app.events.EventCenter.getInstance()
    .dispatch(app.events.EventCenter.EventType.TAB_CHANGED, {
      tab: (this.currSelectedTab_ = newTab)
    });
};


/** @inheritDoc */
app.header.Tabs.prototype.exitDocument = function() {
  this.adder_.exitDocument();
  goog.base(this, 'exitDocument');
};


/**
 * @private
 * @param {goog.events.Event} e A delete event provided by Tab.
 */
app.header.Tabs.prototype.handleTabDelBtnClicked_ = function(e) {
  var child = /** @type {app.header.Tab} */(e.target);
  var index = app.util.getChildIndex(this, child);
  (this.getChildAt(index + 1) || this.getChildAt(index - 1)).dispatchSelect();

  this.removeChild(child, true).dispose();

  app.model.setTabIds(this.getTabIds());
  this.repositionAdder_();
};


/**
 * @private
 * @param {goog.events.Event} e A event provided by TabAdder.
 */
app.header.Tabs.prototype.handleAdderClicked_ = function(e) {
  this.insertNewTab_().dispatchSelect();
  this.repositionAdder_();
};


/** @inheritDoc */
app.header.Tabs.prototype.decorateInternal = function(element) {
  goog.base(this, 'decorateInternal', element);
  var dh = this.getDomHelper();

  var tabAdder = this.adder_ = new app.header.TabAdder(dh);
  // We don't deal with it as a child. Only tabs are.
  tabAdder.setParentEventTarget(this);
  tabAdder.createDom();
  dh.insertSiblingAfter(tabAdder.getElement(), element);

  var tabIds = app.model.getTabIds();
  goog.asserts.assert(tabIds, 'We have to have tab ids.');

  // // Element to decorate must be only 1.
  // var tabElms = dh.getChildren(this.getElement());
  // goog.asserts.assert(tabIds.length >= tabElms.length,
  //                     'Too many tab elements.');

  goog.array.forEach(tabIds, function(tabId, index) {
    var tab = new app.header.Tab(tabId, dh);

    // var tabElm = tabElms[index];
    // if (tabElm) {
    //   var canDecorate = tab.canDecorate(tabElm);
    //   goog.asserts.assert(canDecorate, 'cannot decorate');
    //   tab.decorateInternal(tabElm);
    // } else {

    tab.createDom();
    var tabElm = tab.getElement();
    dh.append(/**@type{!Node}*/(this.getContentElement()), tab.getElement());
    // }
    this.addChildAt(tab, index);

    if (index == 0) {
      goog.dom.classes.add(tab.getElement(), 'selected');
      this.currSelectedTab_ = tab;
    }
  }, this);

};


/**
 * @private
 * @return {app.header.Tab} An inserted new tab.
 */
app.header.Tabs.prototype.insertNewTab_ = function() {
  var dh = this.getDomHelper();
  var lastIndex = this.getLastTabIndex_();
  var tab = new app.header.Tab(app.model.generateUniqueTabId(), dh);
  this.addChildAt(tab, lastIndex + 1);
  app.model.setTabIds(this.getTabIds());
  tab.createDom();
  var content = this.getContentElement();
  goog.asserts.assert(content, 'There must be.');
  // Because I want do this, I don't addChildAt(tab, index, true).
  dh.append(content, tab.getElement());
  tab.enterDocument();
  this.setupDragListGroup_();
  return tab;
};


/**
 * @type {app.header.TabAdder}
 */
app.header.Tabs.prototype.adder_;


/**
 * @private
 */
app.header.Tabs.prototype.repositionAdder_ = function() {
  if (this.getChildCount() >= 20) {
    this.adder_.setVisible(false);
    return;
  }
  this.adder_.setVisible(true);

  var lastEl = goog.dom.getLastElementChild(this.getContentElement());
  var pos = goog.style.getPageOffset(lastEl);
  goog.style.setPageOffset(this.adder_.getElement(),
      pos.x + lastEl.offsetWidth, pos.y + 1);
};


/**
 * @return {Array.<string>} Tab ids.
 */
app.header.Tabs.prototype.getTabIds = function() {
  var ids = [];
  this.forEachChild(function(child) {
    if (child instanceof app.header.Tab) ids.push(child.getId());
  });
  return ids;
};


/**
 * @private
 * TODO: We don't do this. We just grab a child of the last index.
 * @return {number} The index of the right side tab.
 */
app.header.Tabs.prototype.getLastTabIndex_ = function() {
  var index;
  goog.array.findRight(this.getChildIds(), function(id, i) {
    var child = this.getChild(id);
    if (child && child instanceof app.header.Tab) {
      index = i;
      return true;
    }
    return false;
  }, this);
  goog.asserts.assertNumber(index, 'Must be a tab index');
  return index;
};


/**
 * @type {?app.header.Tab}
 */
app.header.Tabs.prototype.currSelectedTab_;


/**
 * @return {?app.header.Tab} A selected tab instance.
 */
app.header.Tabs.prototype.getCurrSelectedTab = function() {
  return this.currSelectedTab_;
};


/**
 * @private
 * @type {string}
 */
app.header.Tabs.prototype.draggingClassName_ = 'tab-dragging';


/**
 * @type {?goog.fx.DragListGroup}
 */
app.header.Tabs.prototype.dragListGroup_;


// /** @inheritDoc */
// app.header.Tabs.prototype.getContentElement = function() {
//   return this.contentElement_;
// };


/**
 * @private
 */
app.header.Tabs.prototype.setupDragListGroup_ = function() {
  if (this.dragListGroup_) {
    this.dragListGroup_.dispose();
  }
  this.dragListGroup_ = new goog.fx.DragListGroup;
  this.dragListGroup_.setDraggerElClass(this.draggingClassName_);
  this.dragListGroup_.addDragList(this.getElement(),
                                  goog.fx.DragListDirection.RIGHT);

  var styleSheetEl;
  this.getHandler()
    .listen(app.ViewportSizeMonitor.getInstance(),
          app.ViewportSizeMonitor.EventType.DELAYED_RESIZE, this.repositionAdder_)
    .listen(this.dragListGroup_, 'beforedragstart', function(e) {
      var et = /** @type {Element} */(e.event && e.event.target);
      if (et && app.dom.getAncestorFromEventTargetByClass(this.getElement(), 'button-remove', et)) {
        return false;
      }
      return true;
      // styleSheetEl =
      //   this.createFixTabWidthStylesheet_(e.currDragItem.offsetWidth);
    })
    .listen(this.dragListGroup_, 'dragend', function(e) {
      // goog.style.uninstallStyles(styleSheetEl);

      // Becuase of dragListGroup, tab cannot listen click event by itself.
      // So, we take care of it by here.
      this.findChildByElement_(e.currDragItem).dispatchSelect();
    });
  this.dragListGroup_.init();
};


/**
 * @private
 * @param {Element} element A tab element.
 * @return {app.header.Tab} A tab instance.
 */
app.header.Tabs.prototype.findChildByElement_ = function(element) {
  var child;
  goog.array.find(this.getChildIds(), function(id) {
    var c = this.getChild(id);
    if (c && element == c.getElement()) {
      child = c;
      return true;
    }
    return false;
  }, this);
  return /** @type {app.header.Tab} */(child);
};


/**
 * @private
 * @param {number} width For each tab element.
 * @return {Element|StyleSheet} The style element created.
 */
app.header.Tabs.prototype.createFixTabWidthStylesheet_ = function(width) {
  var styleString = '.tabs-content > .tab,.' +
                    this.draggingClassName_ +
                    '{width: ' + width + 'px;}';
  return goog.style.installStyles(styleString);
};


/** @inheritDoc */
app.header.Tabs.prototype.canDecorate = function(element) {
  var dh = this.getDomHelper();
  var content = dh.getElementByClass('header-tabs-content', element);
  if (content) {
    this.setElementInternal(element);
    return true;
  }
  return false;
};


/** @inheritDoc */
app.header.Tabs.prototype.disposeInternal = function() {
  if (this.adder_) {
    this.adder_.dispose();
    this.adder_ = null;
  }
  goog.base(this, 'disposeInternal');
};



