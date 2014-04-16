
goog.require('goog.dom');
goog.require('goog.events');
goog.require('goog.style');


var wrap = document.querySelector('.header-input-leftcontent');
var tag = document.querySelector('.button-tag');
var textBox = document.querySelector('.header-input-textbox');

goog.events.listen(wrap, 'click', handleClick);

function handleClick() {
  textBox.style.display = 'none';

  var lastTag = getLastTag();
  goog.dom.insertSiblingAfter(lastTag.cloneNode(true), lastTag);
  repositionTextBox();

  textBox.style.display = 'inline-block';
}

function repositionTextBox() {

  var lastTag = getLastTag();

  var wrapSize = goog.style.getContentBoxSize(wrap);

  var tagPos = goog.style.getRelativePosition(lastTag, wrap);

  var tagSize = goog.style.getBorderBoxSize(lastTag);

  var BETWEEN_TAG_AND_TEXTBOX = 10;
  var MINIMUM_WIDTH = 80;

  var width;
  width = (width = wrapSize.width - tagPos.x -
      tagSize.width - BETWEEN_TAG_AND_TEXTBOX) < MINIMUM_WIDTH ?
      wrapSize.width : width ;

  goog.style.setBorderBoxSize(textBox, new goog.math.Size(width, 0));
}

repositionTextBox();

function getLastTag() {
  return wrap.querySelector('.button-tag:last-of-type');
}

