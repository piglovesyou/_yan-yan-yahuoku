
goog.require('goog.dom');
goog.require('goog.events');
goog.require('goog.style');
goog.require('goog.events.KeyHandler');
goog.require('goog.events.InputHandler');
goog.require('goog.asserts');
goog.require('goog.dom.selection');



var wrap = document.querySelector('.header-input-leftcontent');
var inputBox = document.querySelector('.header-input-textbox');



repositionTextBox();



function onInputFocus(el) {
  decorateFocusable_(el, handleInputKey);
}

function onTagFocus(el) {
  decorateFocusable_(el, handleTagKey);
}

function decorateFocusable_(el, keyHandler) {
  if (el.eh) el.eh.dispose();
  (el.eh = new goog.events.EventHandler)
    .listen(el, 'blur', onFocusableBlur)
    .listen(new goog.events.KeyHandler(el), goog.events.KeyHandler.EventType.KEY, keyHandler);
}

function handleInputKey(e) {
  var el = e.target;
  switch (e.keyCode) {
    case goog.events.KeyCodes.ENTER:
      if (e.target.value) insertTagWithValue(e.target);
      break;
    case goog.events.KeyCodes.BACKSPACE:
    case goog.events.KeyCodes.LEFT:
      if (goog.dom.selection.getStart(el)) return;
      if (focusPrevious(el)) e.preventDefault();
      break;
  }
}

function handleTagKey(e) {
  var el = e.target;
  switch (e.keyCode) {
    case goog.events.KeyCodes.LEFT:
      if (focusPrevious(el)) e.preventDefault();
      break;
    case goog.events.KeyCodes.RIGHT:
      if (focusNext(el)) e.preventDefault();
      break;
    case goog.events.KeyCodes.BACKSPACE:
      focusPrevious(el);
      removeTag(el);
      repositionTextBox();
      e.preventDefault();
      break;
  }
}

function focusPrevious(el) {
  var sibling = getPreviousFocusable(el);
  if (sibling) {
    sibling.focus();
    return true;
  }
  return false;
}

function focusNext(el) {
  var sibling = getNextFocusable(el);
  if (sibling) {
    sibling.focus();
    return true;
  }
  return false;
}

function removeTag(el) {
  if (el.tagName == goog.dom.TagName.INPUT) return;
  if (el.eh) el.eh.dispose();
  goog.dom.removeNode(el);
}

function onFocusableBlur(e) {
  goog.asserts.assert(e.target);
  e.target.eh.dispose();
  e.target.eh = null;
}

function insertTagWithValue(input) {
  var value = input.value;
  input.style.display = 'none';
  var tag = getPreviousFocusable(input);
  if (tag) {
    goog.dom.insertSiblingAfter(createTagNode(value), tag);
  } else {
    goog.dom.insertChildAt(wrap, createTagNode(value), 0);
  }
  repositionTextBox();
  input.value = '';
  input.style.display = 'inline-block';
}

function createTagNode(value) {
  return goog.dom.htmlToDocumentFragment(
    '<a tabindex="0" onFocus="return onTagFocus(this);"' +
          'class="button-tag pure-button pure-button-disabled" href="#">' +
        value +
        '<span class="button-tag-remove">×</span>' +
    '</a>');
}

function repositionTextBox() {
  goog.style.setBorderBoxSize(inputBox,
      new goog.math.Size(calcInputWidth(), 0));
}

function calcInputWidth() {
  var lastTag = getLastTag();
  var wrapSize = goog.style.getContentBoxSize(wrap);
  if (!lastTag) return wrapSize.width;

  var tagPos = goog.style.getRelativePosition(lastTag, wrap);
  var tagSize = goog.style.getBorderBoxSize(lastTag);
  var BETWEEN_TAG_AND_TEXTBOX = 10;
  var MINIMUM_WIDTH = 80;

  var width = wrapSize.width - tagPos.x - tagSize.width - BETWEEN_TAG_AND_TEXTBOX;
  if (width < MINIMUM_WIDTH) return wrapSize.width;
  return width;
}

function getPreviousFocusable(target) {
  return getSiblingFocusable_(target, goog.dom.getPreviousElementSibling);
}

function getNextFocusable(target) {
  return getSiblingFocusable_(target, goog.dom.getNextElementSibling);
}

function getSiblingFocusable_(target, getSibling) {
  var el;
  while (el = getSibling(target))
    if (goog.dom.isFocusableTabIndex(el))
      return el;
  return null;
}

function getLastTag() {
  return getPreviousFocusable(inputBox);
}

