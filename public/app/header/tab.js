
goog.provide('app.header.Tab');

goog.require('app.Frame');
goog.require('app.dom');
goog.require('app.events.EventCenter');
goog.require('app.soy.tab');
goog.require('goog.asserts');
goog.require('goog.ui.Component');
goog.require('goog.ui.Tooltip');


/**
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
  this.frame_ = new app.Frame(this.getDomHelper());
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
      .listen(this, app.TagInput.EventType.TAG_UPDATE, this.renderContent_)
      .listen(this.getElement(), goog.events.EventType.CLICK, function(e) {
        if (this.isDelBtnFromEventTarget(e.target))
          this.dispatchEvent(app.header.Tab.EventType.DELETE);
      });

  if (this.isSelected()) {
    this.processSelected(true);
  } else {
    this.renderContent_();
  }
};


app.header.Tab.prototype.isDelBtnFromEventTarget = function(et) {
  return !!app.dom.getAncestorFromEventTargetByClass(
      this.getElement(), 'button-remove', et);
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
  goog.dom.classlist.enable(this.getElement(), 'pure-menu-selected', select);
  if (select && !this.frame_) {
    this.createFrame_(); // It has 'selected' className on rendering.
    return;
  }
  goog.dom.classlist.enable(this.frame_.getElement(), 'app-frame-selected', select);
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
  this.setElementInternal(/**@type{Element}*/(goog.soy.renderAsFragment(
      app.soy.tab.createDom)));
};


/** @inheritDoc */
app.header.Tab.prototype.disposeInternal = function() {
  if (this.tooltip_) {
    this.tooltip_.dispose();
    this.tooltip_ = null;
  }
  goog.base(this, 'disposeInternal');
};
