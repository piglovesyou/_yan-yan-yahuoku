
goog.provide('app.controller.Tabs');

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


app.controller.Tabs.prototype.enterDocument = function () {
  goog.base(this, 'enterDocument');
  this.getHandler()
      .listen(this, app.controller.TabAdder.EventType.CLICK, this.handleAdderClicked_);
};


app.controller.Tabs.prototype.handleAdderClicked_ = function (e) {
  this.selectTab(this.insertNewTab_());
  this.repositionAdder_();
};


app.controller.Tabs.prototype.decorateInternal = function (element) {
  var dh = this.getDomHelper();

  var tabAdder = this.adder_ = new app.controller.TabAdder(dh);
  this.addChild(tabAdder);
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

      // TODO: Implement this.insertTab_
      // this.insertTab_(tab);
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
      pos.x + lastEl.offsetWidth - minusMargin, pos.y);
};


app.controller.Tabs.prototype.getTabIds = function () {
  var ids = [];
  this.forEachChild(function (child) {
    if (child instanceof app.controller.Tab) ids.push(child.getId());
  });
  return ids;
};


/**
 * @return {app.controller.TabAdder}
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
 * @return {app.controller.TabAdder}
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
      var tab = this.findChildByElement_(e.currDragItem);
      this.selectTab(tab);
    })
  this.dragListGroup_.init();
};


/**
 * @param {app.controller.Tab} tab
 */
app.controller.Tabs.prototype.selectTab = function (tab) {
  if (this.currSelectedTab_.getId() == tab.getId()) return;
  goog.dom.classes.enable(tab.getElement(), 'selected', true);
  goog.dom.classes.enable(this.currSelectedTab_.getElement(), 'selected', false);
  this.currSelectedTab_ = tab;
  app.events.EventCenter.getInstance().dispatch(app.events.EventCenter.EventType.TAB_CHANGED, {
    tab: tab
  });
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

/**
 * @param {goog.dom.DomHelper=} opt_domHelper
 * @constructor
 * @extends {goog.ui.Component}
 */
app.controller.Tab = function (id, opt_domHelper) {
  goog.base(this, opt_domHelper);
  this.setId(id);
};
goog.inherits(app.controller.Tab, goog.ui.Component);


app.controller.Tab.prototype.enterDocument = function () {
  this.getHandler()
      .listen(
        app.Model.getInstance(), 
        app.Model.EventType.UPDATE_TABQUERY, function (e) {
          this.renderContent_();
        });
  this.renderContent_();
  goog.base(this, 'enterDocument');
};


app.controller.Tab.prototype.renderContent_ = function () {
  var data = app.model.getTabQuery(this.getId());
  
  if (!data) app.model.setTabQuery(this.getId(), data = app.model.createEmptyTab());

  var query = data['query'];
  if (!query) {
    query = '全てのアイテム';
  }
  var category = app.string.getCategoryNameByPath(data['category']['CategoryPath']);
  category = (!category || category == 'オークション') ?
      '' : '[' + category + ']';
  var result = query + ' ' + category;
  goog.dom.setTextContent(this.getContentElement(), result);
  this.setTooltip_(result);
};


/**
 * @type {?goog.ui.Tooltip}
 */
app.controller.Tab.prototype.tooltip_;


app.controller.Tab.prototype.setTooltip_ = function (text) {
  if (!this.tooltip_) {
    this.tooltip_ = new goog.ui.Tooltip(this.getElement(), null, this.getDomHelper());
    this.tooltip_.className += ' label';
  }
  this.tooltip_.setText(text);
};


/**
 * @type {Element}
 */
app.controller.Tab.prototype.contentElement_;


/**
 * @return {Element}
 */
app.controller.Tab.prototype.getContentElement = function () {
  return this.contentElement_;
};


/** @inheritDoc */
app.controller.Tab.prototype.decorateInternal = function (element) {
  this.setElementInternal(element);
  goog.style.setUnselectable(element, true, true);
};


/** @inheritDoc */
app.controller.Tab.prototype.createDom = function () {
  var dh = this.getDomHelper();
  var element = dh.createDom('div', 'tab selected',
      this.contentElement_ = dh.createDom('div', 'tab-content'));
  this.setElementInternal(element);
};


/** @inheritDoc */
app.controller.Tab.prototype.canDecorate = function (element) {
  if (element) {
    var dh = this.getDomHelper();
    var content = dh.getElementByClass('tab-content', element);
    if (content) {
      this.contentElement_ = content;
      return true;
    }
  }
  return false;
};


app.controller.Tab.prototype.disposeInternal = function () {
  if (this.tooltip_) {
    this.tooltip_.dispose();
    this.tooltip_ = null;
  }
  goog.base(this, 'disposeInternal')
};




/**
 * @param {goog.dom.DomHelper=} opt_domHelper
 * @constructor
 * @extends {goog.ui.Component}
 */
app.controller.TabAdder = function (opt_domHelper) {
  goog.base(this, opt_domHelper);
};
goog.inherits(app.controller.TabAdder, goog.ui.Component);


app.controller.TabAdder.EventType = {
  CLICK: 'tabadderclicked'
};


app.controller.TabAdder.prototype.enterDocument = function () {
  goog.base(this, 'enterDocument');
  this.getHandler().listen(this.getElement(), goog.events.EventType.CLICK, function () {
    this.dispatchEvent(app.controller.TabAdder.EventType.CLICK);
  });
};


app.controller.TabAdder.prototype.createDom = function () {
  var dh = this.getDomHelper();
  var element = dh.createDom('div', 'tab-adder');
  this.setElementInternal(element);
};
