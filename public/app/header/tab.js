
goog.provide('app.header.Tab');

goog.require('app.Frame');
goog.require('app.dom');
goog.require('app.events.EventCenter');
goog.require('app.soy.tab');
goog.require('goog.asserts');
goog.require('goog.ui.Component');
goog.require('goog.ui.Tooltip');


/**
 * @param {string} id .
 * @param {goog.dom.DomHelper=} opt_domHelper
 * @constructor
 * @extends {goog.ui.Component}
 */
app.header.Tab = function(id, opt_domHelper) {
  goog.base(this, opt_domHelper);
  this.setId(id);
};
goog.inherits(app.header.Tab, goog.ui.Component);


/**
 * @enum {string}
 */
app.header.Tab.EventType = {
  SELECT: 'select',
  DELETE: 'delete',
  DELEGATE_RENDER_FRAME: 'delegateappendframeelement'
};


app.header.Tab.prototype.createFrame_ = function() {
  goog.asserts.assert(!this.frame_, 'A frame already exists.');
  this.frame_ = new app.Frame(this.getId(), this.getDomHelper());
  this.addChild(this.frame_);
  this.dispatchEvent({
    type: app.header.Tab.EventType.DELEGATE_RENDER_FRAME,
    frame: this.frame_
  });
};


/** @inheritDoc */
app.header.Tab.prototype.enterDocument = function() {
  goog.base(this, 'enterDocument');
  this.getHandler()
      .listen(app.Model.getInstance(), app.Model.EventType.UPDATE_TABQUERY, function(e) {
        this.renderContent_();
      })
      .listen(this.getElement(), goog.events.EventType.MOUSEDOWN, function(e) {
        if (this.isDelBtnFromEventTarget(e.target))
          e.stopPropagation();
      })
      .listen(this.getElement(), goog.events.EventType.CLICK, function(e) {
        if (this.isDelBtnFromEventTarget(e.target))
          this.dispatchEvent(app.header.Tab.EventType.DELETE);
      });
  this.renderContent_();
  if (this.isSelected()) this.createFrame_();
};


app.header.Tab.prototype.isDelBtnFromEventTarget = function(et) {
  return !!app.dom.getAncestorFromEventTargetByClass(
      this.getElement(), 'button-remove', et);
};


app.header.Tab.prototype.getThousandRows = function() {
  return this.frame_.getContainer().getThousandRows();
};


/** @inheritDoc */
app.header.Tab.prototype.exitDocument = function() {
  this.unrenderContent_();
  goog.base(this, 'exitDocument');
};


app.header.Tab.prototype.unrenderContent_ = function() {
  app.model.deleteTabQuery(this.getId());
};


app.header.Tab.prototype.renderContent_ = function() {
  var data = app.model.getTabQuery(this.getId());

  if (!data) app.model.setTabQuery(this.getId(), data = app.model.createEmptyTab());

  // var query = data.query;
  // var category = app.string.getCategoryNameByPath(data.category.CategoryPath);
  // if (!query) {
  //   query = category ? '全ての商品' : '(キーワードを入力してください)';
  // }
  // category = (!category || category == 'オークション') ?
  //     '' : '[' + category + ']';
  // var result = query + ' ' + category;
  // goog.dom.setTextContent(this.getContentElement(), result);
  // if (data['query'] || category) this.setTooltip_(result);

  goog.soy.renderElement(this.getElement(),
      app.soy.tab.renderContent, data);
};


/**
 * @type {?goog.ui.Tooltip}
 */
app.header.Tab.prototype.tooltip_;


// app.header.Tab.prototype.setTooltip_ = function(text) {
//   if (!this.tooltip_) {
//     this.tooltip_ = new goog.ui.Tooltip(this.getElement(), null, this.getDomHelper());
//     this.tooltip_.className += ' label';
//   }
//   this.tooltip_.setText(text);
// };


/**
 * @type {Element}
 */
app.header.Tab.prototype.contentElement_;


/**
 * @type {Element}
 */
app.header.Tab.prototype.delBtnElement_;


app.header.Tab.prototype.isSelected = function() {
  return this.getParent().getCurrSelectedTab().getId() == this.getId();
};


app.header.Tab.prototype.processSelected = function(select) {
  goog.dom.classes.enable(this.getElement(), 'pure-menu-selected', select);
  if (select && !this.frame_) {
    this.createFrame_(); // It has 'selected' className on rendering.
    return;
  }
  goog.dom.classes.enable(this.frame_.getElement(), 'pure-menu-selected', select);
};


app.header.Tab.prototype.dispatchSelect = function() {
  this.dispatchEvent(app.header.Tab.EventType.SELECT);
};


/** @inheritDoc */
app.header.Tab.prototype.decorateInternal = function(element) {
  this.setElementInternal(element);
  goog.style.setUnselectable(element, true, true);
};


/** @inheritDoc */
app.header.Tab.prototype.createDom = function() {
  // var dh = this.getDomHelper();
  // var element = dh.createDom('div', 'tab',
  //     this.delBtnElement_ = dh.createDom('a', {
  //       'href': 'javascript:void(0)',
  //       'className': 'i del-btn'
  //     }, '×'));
  // this.setElementInternal(element);
  this.setElementInternal(goog.soy.renderAsFragment(
      app.soy.tab.createDom));
};


// /** @inheritDoc */
// app.header.Tab.prototype.canDecorate = function(element) {
//   if (element) {
//     var dh = this.getDomHelper();
//     var delButtn = dh.getElementByClass('del-btn', element);
//     if (delButtn) {
//       this.delBtnElement_ = delButtn;
//       return true;
//     }
//   }
//   return false;
// };


/** @inheritDoc */
app.header.Tab.prototype.disposeInternal = function() {
  if (this.tooltip_) {
    this.tooltip_.dispose();
    this.tooltip_ = null;
  }
  goog.base(this, 'disposeInternal');
};
