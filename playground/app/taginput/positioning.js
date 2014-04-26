
goog.provide('app.taginput.Positioning');
goog.provide('app.taginput.positioning');

goog.require('goog.dom');
goog.require('goog.events');
goog.require('goog.style');
goog.require('goog.events.KeyHandler');
goog.require('goog.events.InputHandler');
goog.require('goog.asserts');
goog.require('goog.dom.selection');
goog.require('goog.dom.classes');


/**
 * @constructor
 */
app.taginput.Positioning = function () {};
goog.addSingletonGetter(app.taginput.Positioning);

app.taginput.Positioning.prototype.monitor = function (wrapEl) {
  var p = app.taginput.Positioning.getInstance();
  p.wrapEl = wrapEl;
  p.inputEl = goog.dom.getElementByClass('header-input-textbox', wrapEl);
  p.reposition();
  goog.events.listen(wrapEl, 'click', p.handleWrapClick, null, this);
};

app.taginput.positioning.onInputFocus = function (el) {
  var p = app.taginput.Positioning.getInstance();
  p.decorateFocusable(el, p.handleInputKey);
};

/** @param {Element} el .  */
app.taginput.positioning.onTagFocus = function(el) {
  var p = app.taginput.Positioning.getInstance();
  p.decorateFocusable(el, p.handleTagKey);
}

app.taginput.Positioning.prototype.reposition = function() {
  goog.style.setBorderBoxSize(this.inputEl,
      new goog.math.Size(this.calcInputWidth_(), 0));
}

app.taginput.Positioning.prototype.decorateFocusable = function(el, keyHandler) {
  if (el.eh) el.eh.dispose();
  (el.eh = new goog.events.EventHandler)
    .listen(el, 'blur', this.onFocusableBlur_, null, this)
    .listen(new goog.events.KeyHandler(el), goog.events.KeyHandler.EventType.KEY, keyHandler, null, this);
}

/**
 * @param {goog.events.Event} e .
 */
app.taginput.Positioning.prototype.handleInputKey = function(e) {
  var el = e.target;
  switch (e.keyCode) {
    case goog.events.KeyCodes.ENTER:
      if (e.target.value) this.insertTagWithValue_(e.target);
      break;
    case goog.events.KeyCodes.BACKSPACE:
    case goog.events.KeyCodes.LEFT:
      if (goog.dom.selection.getStart(el)) return;
      if (this.focusPrevious_(el)) e.preventDefault();
      break;
  }
}

/**
 * @param {goog.events.Event} e .
 */
app.taginput.Positioning.prototype.handleTagKey = function(e) {
  var el = e.target;
  switch (e.keyCode) {
    case goog.events.KeyCodes.LEFT:
      if (this.focusPrevious_(el)) e.preventDefault();
      break;
    case goog.events.KeyCodes.RIGHT:
      if (this.focusNext_(el)) e.preventDefault();
      break;
    case goog.events.KeyCodes.BACKSPACE:
      this.focusPrevious_(el);
      this.removeTag_(el);
      this.reposition();
      e.preventDefault();
      break;
  }
}

app.taginput.Positioning.prototype.focusPrevious_ = function(el) {
  var sibling = this.getPreviousFocusable_(el);
  if (sibling) {
    sibling.focus();
    return true;
  }
  return false;
}

app.taginput.Positioning.prototype.focusNext_ = function(el) {
  var sibling = this.getNextFocusable_(el);
  if (sibling) {
    sibling.focus();
    return true;
  }
  return false;
}

app.taginput.Positioning.prototype.removeTag_ = function(el) {
  if (el.tagName == goog.dom.TagName.INPUT) return;
  if (el.eh) el.eh.dispose();
  goog.dom.removeNode(el);
}

app.taginput.Positioning.prototype.onFocusableBlur_ = function(e) {
  goog.asserts.assert(e.target);
  e.target.eh.dispose();
  e.target.eh = null;
}

app.taginput.Positioning.prototype.insertTagWithValue_ = function(input) {
  var value = input.value;
  input.style.display = 'none';
  var tag = this.getPreviousFocusable_(input);
  if (tag) {
    goog.dom.insertSiblingAfter(this.createTagNode_(value), tag);
  } else {
    goog.dom.insertChildAt(this.wrapEl, this.createTagNode_(value), 0);
  }
  this.reposition();
  input.value = '';
  input.style.display = 'inline-block';
}

app.taginput.Positioning.prototype.createTagNode_ = function(value) {
  return goog.dom.htmlToDocumentFragment(
    '<a tabindex="0" onFocus="return onTagFocus(this);"' +
          'class="button-tag pure-button pure-button-disabled" href="#">' +
        value +
        '<span class="button-tag-remove">×</span>' +
    '</a>');
}

app.taginput.Positioning.prototype.calcInputWidth_ = function() {
  var lastTag = this.getLastTag_();
  var wrapSize = goog.style.getContentBoxSize(this.wrapEl);
  if (!lastTag) return wrapSize.width;

  var tagPos = goog.style.getRelativePosition(lastTag, this.wrapEl);
  var tagSize = goog.style.getBorderBoxSize(lastTag);
  var BETWEEN_TAG_AND_TEXTBOX = 10;
  var MINIMUM_WIDTH = 80;

  var width = wrapSize.width - tagPos.x - tagSize.width - BETWEEN_TAG_AND_TEXTBOX;
  if (width < MINIMUM_WIDTH) return wrapSize.width;
  return width;
}

app.taginput.Positioning.prototype.getPreviousFocusable_ = function(target) {
  return this.getSiblingFocusable_(target, goog.dom.getPreviousElementSibling);
}

app.taginput.Positioning.prototype.getNextFocusable_ = function(target) {
  return this.getSiblingFocusable_(target, goog.dom.getNextElementSibling);
}

app.taginput.Positioning.prototype.getSiblingFocusable_ = function(target, getSibling) {
  var el;
  while (el = getSibling(target))
    if (goog.dom.isFocusableTabIndex(el))
      return el;
  return null;
}

app.taginput.Positioning.prototype.getLastTag_ = function() {
  return this.getPreviousFocusable_(this.inputEl);
}

app.taginput.Positioning.prototype.handleWrapClick = function(e) {
  var el = this.findTagFromEventTarget_(e.target);
  if (el) {
    this.removeTag_(el);
    e.preventDefault();
  }
}

app.taginput.Positioning.prototype.findTagFromEventTarget_ = function(et) {
  return goog.dom.getAncestor(et, this.isTagEl_);
}

app.taginput.Positioning.prototype.isTagEl_ = function(node) {
  return goog.dom.classes.has(node, 'button-tag');
}

