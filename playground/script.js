
goog.require('goog.dom');
goog.require('goog.events');
goog.require('goog.style');
goog.require('goog.events.KeyHandler');
goog.require('goog.events.InputHandler');



var wrap = document.querySelector('.header-input-leftcontent');
var tag = document.querySelector('.button-tag');
var textBox = document.querySelector('.header-input-textbox');



var h = new goog.events.KeyHandler(textBox);

goog.events.listen(h, goog.events.KeyHandler.EventType.KEY, handleKey);

repositionTextBox();



function handleKey(e) {
  switch (e.keyCode) {
    case goog.events.KeyCodes.ENTER:
      handleKeyEnter(e);
      break;
    case goog.events.KeyCodes.BACKSPACE:
      handleKeyBackspace(e);
      break;
  }
}

function handleKeyEnter(e) {
  if (e.target.value) {
    insertTagWithValue(e.target.value);
  }
}

function handleKeyBackspace(e) {
  if (!e.target.value) {
    var lastTag = getLastTag();
    if (lastTag) {
      goog.dom.removeNode(lastTag);
      repositionTextBox();
    }
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
  return goog.dom.createDom('a', {
    className: 'button-tag pure-button pure-button-disabled',
    href: "javascript:void 0"
  }, 
      value,
      goog.dom.createDom('span', 'button-tag-remove', 'x '));
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

function getLastTag() {
  return wrap.querySelector('.button-tag:last-of-type');
}

