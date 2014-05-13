
goog.provide('app.ui.Tab');

goog.require('app.events.EventCenter');
goog.require('app.string');
goog.require('goog.asserts');
goog.require('goog.ui.Component');


/**
 * @param {goog.dom.DomHelper=} opt_domHelper
 * @constructor
 * @extends {goog.ui.Component}
 */
app.ui.Tab = function(id, opt_domHelper) {
  goog.base(this, opt_domHelper);
  this.setId(id);
};
goog.inherits(app.ui.Tab, goog.ui.Component);


/**
 * @enum {string}
 */
app.ui.Tab.EventType = {
  SELECT: 'select',
  DELETE: 'delete'
};


app.ui.Tab.prototype.createFrame_ = function() {
  goog.asserts.assert(!this.frame_, 'A frame already exists.');
  this.frame_ = new app.ui.Frame(this.getId(), this.getDomHelper());
  this.addChild(this.frame_);
  this.frame_.render(App.getInstance().getFrameContainerElement());
};


/** @inheritDoc */
app.ui.Tab.prototype.enterDocument = function() {
  goog.base(this, 'enterDocument');
  this.getHandler()
      .listen(app.Model.getInstance(), app.Model.EventType.UPDATE_TABQUERY, function(e) {
        this.renderContent_();
      })
      .listen(this.delBtnElement_, goog.events.EventType.MOUSEDOWN, function(e) {
        e.stopPropagation();
      })
      .listen(this.delBtnElement_, goog.events.EventType.CLICK, function(e) {
        this.dispatchEvent(app.ui.Tab.EventType.DELETE);
      });
  this.renderContent_();
  if (this.isSelected()) this.createFrame_();
};


app.ui.Tab.prototype.getThousandRows = function() {
  return this.frame_.getContainer().getThousandRows();
};


/** @inheritDoc */
app.ui.Tab.prototype.exitDocument = function() {
  this.unrenderContent_();
  goog.base(this, 'exitDocument');
};


app.ui.Tab.prototype.unrenderContent_ = function() {
  app.model.deleteTabQuery(this.getId());
};


app.ui.Tab.prototype.renderContent_ = function() {
  var data = app.model.getTabQuery(this.getId());

  if (!data) app.model.setTabQuery(this.getId(), data = app.model.createEmptyTab());

  var query = data['query'];
  var category = app.string.getCategoryNameByPath(data['category']['CategoryPath']);
  if (!query) {
    query = category ? '全ての商品' : '(キーワードを入力してください)';
  }
  category = (!category || category == 'オークション') ?
      '' : '[' + category + ']';
  var result = query + ' ' + category;
  goog.dom.setTextContent(this.getContentElement(), result);
  if (data['query'] || category) this.setTooltip_(result);
};


/**
 * @type {?goog.ui.Tooltip}
 */
app.ui.Tab.prototype.tooltip_;


app.ui.Tab.prototype.setTooltip_ = function(text) {
  if (!this.tooltip_) {
    this.tooltip_ = new goog.ui.Tooltip(this.getElement(), null, this.getDomHelper());
    this.tooltip_.className += ' label';
  }
  this.tooltip_.setText(text);
};


/**
 * @type {Element}
 */
app.ui.Tab.prototype.contentElement_;


/**
 * @type {Element}
 */
app.ui.Tab.prototype.delBtnElement_;


app.ui.Tab.prototype.isSelected = function() {
  return this.getParent().getCurrSelectedTab().getId() == this.getId();
};


app.ui.Tab.prototype.processSelected = function(select) {
  goog.dom.classes.enable(this.getElement(), 'selected', select);
  if (select && !this.frame_) {
    this.createFrame_(); // It has 'selected' className on rendering.
    return;
  }
  goog.dom.classes.enable(this.frame_.getElement(), 'selected', select);
};


app.ui.Tab.prototype.dispatchSelect = function() {
  this.dispatchEvent(app.ui.Tab.EventType.SELECT);
};


/** @inheritDoc */
app.ui.Tab.prototype.decorateInternal = function(element) {
  this.setElementInternal(element);
  goog.style.setUnselectable(element, true, true);
};


/** @inheritDoc */
app.ui.Tab.prototype.createDom = function() {
  var dh = this.getDomHelper();
  var element = dh.createDom('div', 'tab',
      this.delBtnElement_ = dh.createDom('a', {
        'href': 'javascript:void(0)',
        'className': 'i del-btn'
      }, '×'));
  this.setElementInternal(element);
};


/** @inheritDoc */
app.ui.Tab.prototype.canDecorate = function(element) {
  if (element) {
    var dh = this.getDomHelper();
    var delButtn = dh.getElementByClass('del-btn', element);
    if (delButtn) {
      this.delBtnElement_ = delButtn;
      return true;
    }
  }
  return false;
};


/** @inheritDoc */
app.ui.Tab.prototype.disposeInternal = function() {
  if (this.tooltip_) {
    this.tooltip_.dispose();
    this.tooltip_ = null;
  }
  goog.base(this, 'disposeInternal');
};
