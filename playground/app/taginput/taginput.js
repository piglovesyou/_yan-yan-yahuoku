
goog.provide('app.TagInput');
goog.provide('app.taginput');

goog.require('goog.ui.Component');

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
 * @param {goog.dom.DomHelper=} opt_domHelper .
 * @extends {goog.ui.Component}
 */
app.TagInput = function(opt_domHelper) {
  goog.base(this, opt_domHelper);
};
goog.inherits(app.TagInput, goog.ui.Component);
goog.addSingletonGetter(app.TagInput);


/** @inheritDoc */
app.TagInput.prototype.createDom = function() {
  goog.base(this, 'createDom');
};


/** @inheritDoc */
app.TagInput.prototype.decorateInternal = function(element) {
  goog.base(this, 'decorateInternal', element);

  this.inputEl = this.getElementByClass('header-input-textbox');
  this.wrapEl = this.getElementByClass('header-input-leftcontent');
};


/** @inheritDoc */
app.TagInput.prototype.canDecorate = function(element) {
  if (element) {
    return true;
  }
  return false;
};


/** @inheritDoc */
app.TagInput.prototype.enterDocument = function() {

  var eh = this.getHandler();
  eh.listen(this.wrapEl, 'click', this.handleWrapClick);

  goog.base(this, 'enterDocument');

  this.reposition();
};


/** @inheritDoc */
app.TagInput.prototype.disposeInternal = function() {
  goog.base(this, 'disposeInternal');
};

















// app.TagInput.prototype.monitor = function (wrapEl) {
//   var p = app.TagInput.getInstance();
//   p.wrapEl = wrapEl;
//   p.inputEl = goog.dom.getElementByClass('header-input-textbox', wrapEl);
//   p.reposition();
//   goog.events.listen(wrapEl, 'click', p.handleWrapClick, null, this);
// };

app.taginput.onInputFocus = function (el) {
  var t = app.TagInput.getInstance();
  t.decorateFocusable(el, t.handleInputKey);
};

/** @param {Element} el .  */
app.taginput.onTagFocus = function(el) {
  var t = app.TagInput.getInstance();
  t.decorateFocusable(el, t.handleTagKey);
}

app.TagInput.prototype.reposition = function() {
  goog.style.setBorderBoxSize(this.inputEl,
      new goog.math.Size(this.calcInputWidth_(), 0));
}

app.TagInput.prototype.decorateFocusable = function(el, keyHandler) {
  if (el.eh) el.eh.dispose();
  (el.eh = new goog.events.EventHandler)
    .listen(el, 'blur', this.onFocusableBlur_, null, this)
    .listen(new goog.events.KeyHandler(el), goog.events.KeyHandler.EventType.KEY, keyHandler, null, this);
}

/**
 * @param {goog.events.Event} e .
 */
app.TagInput.prototype.handleInputKey = function(e) {
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
app.TagInput.prototype.handleTagKey = function(e) {
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

app.TagInput.prototype.focusPrevious_ = function(el) {
  var sibling = this.getPreviousFocusable_(el);
  if (sibling) {
    sibling.focus();
    return true;
  }
  return false;
}

app.TagInput.prototype.focusNext_ = function(el) {
  var sibling = this.getNextFocusable_(el);
  if (sibling) {
    sibling.focus();
    return true;
  }
  return false;
}

app.TagInput.prototype.removeTag_ = function(el) {
  if (el.tagName == goog.dom.TagName.INPUT) return;
  if (el.eh) el.eh.dispose();
  goog.dom.removeNode(el);
}

app.TagInput.prototype.onFocusableBlur_ = function(e) {
  goog.asserts.assert(e.target);
  e.target.eh.dispose();
  e.target.eh = null;
}

app.TagInput.prototype.insertTagWithValue_ = function(input) {
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

app.TagInput.prototype.createTagNode_ = function(value) {
  return goog.dom.htmlToDocumentFragment(
    '<a tabindex="0" onFocus="return onTagFocus(this);"' +
          'class="button-tag pure-button pure-button-disabled" href="#">' +
        value +
        '<span class="button-tag-remove">×</span>' +
    '</a>');
}

app.TagInput.prototype.calcInputWidth_ = function() {
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

app.TagInput.prototype.getPreviousFocusable_ = function(target) {
  return this.getSiblingFocusable_(target, goog.dom.getPreviousElementSibling);
}

app.TagInput.prototype.getNextFocusable_ = function(target) {
  return this.getSiblingFocusable_(target, goog.dom.getNextElementSibling);
}

app.TagInput.prototype.getSiblingFocusable_ = function(target, getSibling) {
  var el;
  while (el = getSibling(target))
    if (goog.dom.isFocusableTabIndex(el))
      return el;
  return null;
}

app.TagInput.prototype.getLastTag_ = function() {
  return this.getPreviousFocusable_(this.inputEl);
}

app.TagInput.prototype.handleWrapClick = function(e) {
  var tagEl = this.findTagFromEventTarget_(e.target);
  if (tagEl) {
    this.removeTag_(tagEl);
    e.preventDefault();
    this.reposition();
  }
}

app.TagInput.prototype.findTagFromEventTarget_ = function(et) {
  return goog.dom.getAncestor(et, this.isTagEl_);
}

app.TagInput.prototype.isTagEl_ = function(node) {
  return goog.dom.classes.has(node, 'button-tag');
}

