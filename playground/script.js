
goog.require('goog.dom');
goog.require('goog.events');
goog.require('goog.style');
goog.require('goog.events.KeyHandler');
goog.require('goog.events.InputHandler');
goog.require('goog.asserts');
goog.require('goog.dom.selection');



var wrap = document.querySelector('.header-input-leftcontent');
var tag = document.querySelector('.button-tag');
var textBox = document.querySelector('.header-input-textbox');



var h = new goog.events.KeyHandler(textBox);

goog.events.listen(h, goog.events.KeyHandler.EventType.KEY, handleKey);

repositionTextBox();



function onInputFocus(el) {
  if (el.eh) el.eh.dispose();
  var eh = el.eh = new goog.events.EventHandler;

  eh.listen(el, 'blur', onTagBlur);
  eh.listen(new goog.events.KeyHandler(el), goog.events.KeyHandler.EventType.KEY, handleInputKey);
}

function onTagFocus(el) {
  if (el.eh) el.eh.dispose();
  var eh = el.eh = new goog.events.EventHandler;

  eh.listen(el, 'blur', onTagBlur);
  eh.listen(new goog.events.KeyHandler(el), goog.events.KeyHandler.EventType.KEY, handleTagKey);
}

function handleInputKey(e) {
  var el = e.target;
  switch (e.keyCode) {
    case goog.events.KeyCodes.RIGHT:
      return;
    case goog.events.KeyCodes.LEFT:
    case goog.events.KeyCodes.BACKSPACE:
      if (goog.dom.selection.getStart(el)) return;
      // When a cursor is at the left edge, change focus.
      break;
  }
  handleTagKey(e);
}

function handleTagKey(e) {
  var el = e.target;
  switch (e.keyCode) {
    case goog.events.KeyCodes.LEFT:
      var sibling = getPreviousFocusable(el);
      if (sibling) {
        sibling.focus();
        e.preventDefault();
      }
      break;
    case goog.events.KeyCodes.RIGHT:
      var sibling = getNextFocusable(el);
      if (sibling) {
        sibling.focus();
        e.preventDefault();
      }
      break;
    case goog.events.KeyCodes.BACKSPACE:
      var sibling = getPreviousFocusable(el);
      if (sibling) {
        sibling.focus();
      } 
      removeTag(el);
      e.preventDefault();
      break;
  }
}

// ;

function removeTag(el) {
  if (el.tagName == goog.dom.TagName.INPUT) return;
  if (el.eh) el.eh.dispose();
  goog.dom.removeNode(el);
}

function onTagBlur(e) {
  goog.asserts.assert(e.target);
  e.target.eh.dispose();
  e.target.eh = null;
}

function handleKey(e) {
  switch (e.keyCode) {
    case goog.events.KeyCodes.ENTER:
      if (e.target.value) {
        insertTagWithValue(e.target.value);
        e.preventDefault();
      }
      break;
    case goog.events.KeyCodes.BACKSPACE:
      if (!e.target.value) {
        var lastTag = getLastTag();
        if (lastTag) {
          removeTag(lastTag);
          repositionTextBox();
          e.preventDefault();
        }
      }
      break;
    case goog.events.KeyCodes.LEFT:
      var lastTag = getLastTag();
      if (lastTag) {
        lastTag.focus();
        e.preventDefault();
      }
      break;
  }
}

function insertTagWithValue(value) {
  textBox.style.display = 'none';

  var lastTag = getLastTag();
  if (lastTag) {
    goog.dom.insertSiblingAfter(createTagNode(value), lastTag);
  } else {
    goog.dom.insertChildAt(wrap, createTagNode(value), 0);
  }

  repositionTextBox();
  textBox.value = '';

  textBox.style.display = 'inline-block';
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
  var lastTag = getLastTag();
  var wrapSize = goog.style.getContentBoxSize(wrap);

  if (lastTag) {
    var tagPos = goog.style.getRelativePosition(lastTag, wrap);
    var tagSize = goog.style.getBorderBoxSize(lastTag);
  }
  var BETWEEN_TAG_AND_TEXTBOX = 10;
  var MINIMUM_WIDTH = 80;

  var width;
  width = !lastTag || (width = wrapSize.width - tagPos.x -
      tagSize.width - BETWEEN_TAG_AND_TEXTBOX) < MINIMUM_WIDTH ?
      wrapSize.width : width ;

  goog.style.setBorderBoxSize(textBox, new goog.math.Size(width, 0));
}

function getPreviousFocusable(target) {
  return getSiblingFocusable_(target, goog.dom.getPreviousElementSibling);
}

function getNextFocusable(target) {
  return getSiblingFocusable_(target, goog.dom.getNextElementSibling);
}

function getSiblingFocusable_(target, method) {
  var el;
  while (el = method(target))
    if (goog.dom.isFocusableTabIndex(el))
      return el;
  return null;
}

function getLastTag() {
  return wrap.querySelector('.button-tag:last-of-type');
}

