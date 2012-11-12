
goog.provide('app.ui.Tabs');

goog.require('app.events.EventCenter');
goog.require('app.string');
goog.require('app.ui.Tab');
goog.require('app.ui.TabAdder');
goog.require('goog.asserts');
goog.require('goog.fx.DragListGroup');
goog.require('goog.ui.Component');


/**
 * @param {goog.dom.DomHelper=} opt_domHelper A dom helper.
 * @constructor
 * @extends {goog.ui.Component}
 */
app.ui.Tabs = function(opt_domHelper) {
  goog.base(this, opt_domHelper);
};
goog.inherits(app.ui.Tabs, goog.ui.Component);


/** @inheritDoc */
app.ui.Tabs.prototype.enterDocument = function() {
  goog.base(this, 'enterDocument');
  this.adder_.enterDocument();
  this.getHandler()
      .listen(this, app.ui.Tab.EventType.SELECT, this.handleTabSelected_)
      .listen(this, app.ui.Tab.EventType.DELETE, this.handleTabDelBtnClicked_)
      .listen(this, app.ui.TabAdder.EventType.CLICK, this.handleAdderClicked_);
};


/**
 * @private
 * @param {goog.events.Event} e Provided by Tab.
 */
app.ui.Tabs.prototype.handleTabSelected_ = function(e) {
  var oldTab = this.currSelectedTab_;
  var newTab = /** @type {?app.ui.Tab} */(e.target);
  if (!newTab || oldTab.getId() == newTab.getId()) return;

  oldTab.processSelected(false);
  newTab.processSelected(true);
  app.events.EventCenter.getInstance()
    .dispatch(app.events.EventCenter.EventType.TAB_CHANGED, {
      tab: (this.currSelectedTab_ = newTab)
    });
};


/** @inheritDoc */
app.ui.Tabs.prototype.exitDocument = function() {
  this.adder_.exitDocument();
  goog.base(this, 'exitDocument');
};


/**
 * @private
 * @param {goog.events.Event} e A delete event provided by Tab.
 */
app.ui.Tabs.prototype.handleTabDelBtnClicked_ = function(e) {
  var child = e.target;
  var index = app.ui.util.getChildIndex(this, child);
  (this.getChildAt(index + 1) || this.getChildAt(index - 1)).dispatchSelect();

  this.removeChild(child, true).dispose();

  app.model.setTabIds(this.getTabIds());
  this.repositionAdder_();
};


/**
 * @private
 * @param {goog.events.Event} e A event provided by TabAdder.
 */
app.ui.Tabs.prototype.handleAdderClicked_ = function(e) {
  this.insertNewTab_().dispatchSelect();
  this.repositionAdder_();
};


/** @inheritDoc */
app.ui.Tabs.prototype.decorateInternal = function(element) {
  var dh = this.getDomHelper();

  var tabAdder = this.adder_ = new app.ui.TabAdder(dh);
  // We don't deal with it as a child. Only tabs are.
  tabAdder.setParentEventTarget(this);
  tabAdder.createDom();
  dh.append(element, tabAdder.getElement());

  var tabIds = app.model.getTabIds();
  goog.asserts.assert(tabIds, 'We have to have tab ids.');

  // Element to decorate must be only 1.
  var tabElms = dh.getChildren(this.contentElement_);
  goog.asserts.assert(tabIds.length >= tabElms.length,
                      'Too many tab elements.');

  goog.array.forEach(tabIds, function(tabId, index) {
    var tab = new app.ui.Tab(tabId, dh);

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
      goog.asserts.assert(!this.currSelectedTab_,
                          'Two or more selected tab element.');
      this.currSelectedTab_ = tab;
    }
  }, this);

  this.repositionAdder_();
  this.setupDragListGroup_();
};


/**
 * @private
 * @return {app.ui.Tab} An inserted new tab.
 */
app.ui.Tabs.prototype.insertNewTab_ = function() {
  var dh = this.getDomHelper();
  var lastIndex = this.getLastTabIndex_();
  var tab = new app.ui.Tab(
    goog.ui.IdGenerator.getInstance().getNextUniqueId(), dh);
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
 * @type {app.ui.TabAdder}
 */
app.ui.Tabs.prototype.adder_;


/**
 * @private
 */
app.ui.Tabs.prototype.repositionAdder_ = function() {
  if (this.getChildCount() >= 5) {
    this.adder_.setVisible(false);
    return;
  }
  this.adder_.setVisible(true);

  var lastEl = this.getLastTab_().getElement();
  var pos = goog.style.getPageOffset(lastEl);
  var minusMargin = 3;
  goog.style.setPageOffset(this.adder_.getElement(),
      pos.x + lastEl.offsetWidth - minusMargin, pos.y + 1);
};


/**
 * @return {Array.<string>} Tab ids.
 */
app.ui.Tabs.prototype.getTabIds = function() {
  var ids = [];
  this.forEachChild(function(child) {
    if (child instanceof app.ui.Tab) ids.push(child.getId());
  });
  return ids;
};


/**
 * @private
 * @return {app.ui.Tab} The right side tab.
 */
app.ui.Tabs.prototype.getLastTab_ = function() {
  var tab;
  goog.array.findRight(this.getChildIds(), function(id) {
    var child = this.getChild(id);
    if (child && child instanceof app.ui.Tab) {
      tab = child;
      return true;
    }
    return false;
  }, this);
  goog.asserts.assert(tab, 'Must be a tab');
  return tab;
};


/**
 * @private
 * TODO: We don't do this. We just grab a child of the last index.
 * @return {number} The index of the right side tab.
 */
app.ui.Tabs.prototype.getLastTabIndex_ = function() {
  var index;
  goog.array.findRight(this.getChildIds(), function(id, i) {
    var child = this.getChild(id);
    if (child && child instanceof app.ui.Tab) {
      index = i;
      return true;
    }
    return false;
  }, this);
  goog.asserts.assertNumber(index, 'Must be a tab index');
  return index;
};


/**
 * @type {?app.ui.Tab}
 */
app.ui.Tabs.prototype.currSelectedTab_;


/**
 * @return {?app.ui.Tab} A selected tab instance.
 */
app.ui.Tabs.prototype.getCurrSelectedTab = function() {
  return this.currSelectedTab_;
};


/**
 * @private
 * @type {string}
 */
app.ui.Tabs.prototype.draggingClassName_ = 'tab-dragging';


/**
 * @type {?goog.fx.DragListGroup}
 */
app.ui.Tabs.prototype.dragListGroup_;


/**
 * @type {Element}
 */
app.ui.Tabs.prototype.contentElement_;


/** @inheritDoc */
app.ui.Tabs.prototype.getContentElement = function() {
  return this.contentElement_;
};


/**
 * @private
 */
app.ui.Tabs.prototype.setupDragListGroup_ = function() {
  if (this.dragListGroup_) {
    this.dragListGroup_.dispose();
  }
  this.dragListGroup_ = new goog.fx.DragListGroup;
  // this.dragListGroup_.setDragItemHandleHoverClass('yeah', 'ohh');
  this.dragListGroup_.setDraggerElClass(this.draggingClassName_);
  this.dragListGroup_.addDragList(this.contentElement_,
                                  goog.fx.DragListDirection.RIGHT);
  var styleSheetEl;
  this.getHandler()
    .listen(app.dom.ViewportSizeMonitor.getInstance(),
          app.dom.ViewportSizeMonitor.EventType.DELAYED_RESIZE, function(e) {
            this.repositionAdder_();
          })
    .listen(this.dragListGroup_, 'beforedragstart', function(e) {
      styleSheetEl =
        this.createFixTabWidthStylesheet_(e.currDragItem.offsetWidth);
    })
    .listen(this.dragListGroup_, 'dragend', function(e) {
      goog.style.uninstallStyles(styleSheetEl);

      // Becuase of dragListGroup, tab cannot listen click event by itself.
      // So, we take care of it by here.
      this.findChildByElement_(e.currDragItem).dispatchSelect();
    });
  this.dragListGroup_.init();
};


/**
 * @private
 * @param {Element} element A tab element.
 * @return {app.ui.Tab} A tab instance.
 */
app.ui.Tabs.prototype.findChildByElement_ = function(element) {
  var child;
  goog.array.find(this.getChildIds(), function(id) {
    var c = this.getChild(id);
    if (c && element == c.getElement()) {
      child = c;
      return true;
    }
    return false;
  }, this);
  return /** @type {app.ui.Tab} */(child);
};


/**
 * @private
 * @param {number} width For each tab element.
 * @return {Element|StyleSheet} The style element created.
 */
app.ui.Tabs.prototype.createFixTabWidthStylesheet_ = function(width) {
  var styleString = '.tabs-content > .tab,.' +
                    this.draggingClassName_ +
                    '{width: ' + width + 'px;}';
  return goog.style.installStyles(styleString);
};


/** @inheritDoc */
app.ui.Tabs.prototype.canDecorate = function(element) {
  var dh = this.getDomHelper();
  var content = dh.getElementByClass('tabs-content', element);
  if (content) {
    this.contentElement_ = content;
    this.setElementInternal(element);
    return true;
  }
  return false;
};


app.ui.Tabs.prototype.disposeInternal = function() {
  if (this.adder_) {
    this.adder_.dispose();
    this.adder_ = null;
  }
  this.contentElement_ = null;
  goog.base(this, 'disposeInternal');
};






