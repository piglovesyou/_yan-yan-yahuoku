
goog.provide('my.app.category.Suggest');

goog.require('goog.ui.ac.RemoteArrayMatcher');
goog.require('goog.ui.ac.AutoComplete');
goog.require('goog.ui.ac.Renderer');
goog.require('goog.ui.ac.InputHandler');
goog.require('goog.ui.LabelInput');
goog.require('goog.ui.Tooltip');


/**
 * @constructor
 * @extends {goog.ui.ac.AutoComplete}
 */
my.app.category.Suggest = function (url, inputElement, lastCategory, opt_domHelper) {
  var u = undefined;

  var matcher = new goog.ui.ac.RemoteArrayMatcher(url, false);
  var customRenderer = new my.app.category.Suggest.CustomRenderer;
  var renderer = new goog.ui.ac.Renderer(u, customRenderer);
  var inputHandler = new my.app.category.Suggest.InputHandler(null, null, false, 300);

  goog.base(this, matcher, renderer, inputHandler);
  this.setAutoHilite(false);

  inputHandler.attachAutoComplete(this);
  inputHandler.attachInput(inputElement);

  var defaultLabel = '全てのカテゴリから'
  var labelInput;
  /**
   * @type {goog.ui.LabelInput}
   */
  this.labelInput_ = labelInput = new goog.ui.LabelInput(defaultLabel);
  labelInput.decorate(inputElement);

  var tooltip;
  /**
   * @type {goog.ui.Tooltip}
   */
  this.tooltip_ = tooltip = new goog.ui.Tooltip(inputElement,
      !goog.string.isEmpty(lastCategory['path']) ? lastCategory['path'] : defaultLabel);
  tooltip.className += ' label';

  var eh = new goog.events.EventHandler(this);
  eh.listen(this, goog.ui.ac.AutoComplete.EventType.UPDATE, this.handleSelected);

  /**
   * Set saved condition as last category.
   * @type {Object}
   */
  this.lastSelectedRow_ = lastCategory;
}
goog.inherits(my.app.category.Suggest, goog.ui.ac.AutoComplete);


/**
 * @enum {string}
 */
my.app.category.Suggest.EventType = {
  UPDATE_CATEGORY: 'updatecategory'
};


/**
 * @type {Object}
 */
my.app.category.Suggest.DefaultRow = {
  'id': 0,
  'path': ''
};


my.app.category.Suggest.prototype.processBeforeInputBlur = function (inputHandler) {
  this.getBackInputTextIfNeeded_(inputHandler);
};


my.app.category.Suggest.prototype.clearSelection = function (inputHandler) {
  if (inputHandler.getActiveElement()) inputHandler.setValue('');
  this.tooltip_.setText('全てのカテゴリから');
  this.lastSelectedRow_ = my.app.category.Suggest.DefaultRow;
  this.dispatchUpdate_(my.app.category.Suggest.DefaultRow);
};


my.app.category.Suggest.prototype.getBackInputTextIfNeeded_ = function (inputHandler) {
  var value = inputHandler.getActiveElement() && inputHandler.getValue();
  if (goog.isString(value) && this.lastSelectedRow_['path'] !== value) {
    if (goog.string.isEmpty(value)) {
      // If an empty value, just clear all.
      this.clearSelection(inputHandler);
    } else {
      // Else, get back input value.
      inputHandler.setValue(this.lastSelectedRow_['path']);
    }
  }
};


/**
 * @param {goog.events.Event} e
 */
my.app.category.Suggest.prototype.handleSelected = function (e) {
  var row = e.row;
  if (row) {
    this.lastSelectedRow_ = row;
    this.tooltip_.setText(row['path']);
    this.dispatchUpdate_(row);
  }
};


/**
 * @param {Object}
 */
my.app.category.Suggest.prototype.dispatchUpdate_ = function (row) {
  this.dispatchEvent({
    type: my.app.category.Suggest.EventType.UPDATE_CATEGORY,
    category: row
  });
};


/** @inheritDoc */
my.app.category.Suggest.prototype.disposeInternal = function () {
  if (this.labelInput_) {
    this.labelInput_.dispose();
    this.labelInput_ = null;
  }
  if (this.tooltip_) {
    this.tooltip_.dispose();
    this.tooltip_ = null;
  }
  goog.base(this, 'disposeInternal');
};



/**
 * @constructor
 * @extends {goog.ui.ac.InputHandler}
 */
my.app.category.Suggest.InputHandler = function (opt_separators, opt_literals, opt_multi, opt_throttleTime) {
  goog.base(this, opt_separators, opt_literals, opt_multi, opt_throttleTime);
};
goog.inherits(my.app.category.Suggest.InputHandler, goog.ui.ac.InputHandler);


my.app.category.Suggest.InputHandler.prototype.handleBlur = function (e) {
  this.getAutoComplete().processBeforeInputBlur(this);
  goog.base(this, 'handleBlur', e);
};


my.app.category.Suggest.InputHandler.prototype.handleKeyUp = function (e) {
  if (e.target == this.activeElement_ && e.target.value == '') {
    this.getAutoComplete().clearSelection(this);
  }
};


my.app.category.Suggest.InputHandler.prototype.needKeyUpListener = function (e) {
  return true;
};


my.app.category.Suggest.InputHandler.prototype.selectRow = function (row, opt_multi) {
  this.setTokenText(row['path'], opt_multi);
  return false;
};




/**
 * @constructor
 */
my.app.category.Suggest.CustomRenderer = function () {};

my.app.category.Suggest.CustomRenderer.prototype.render = function (renderer, element, rows, token) {
  var dh = goog.dom.getDomHelper();
  var ul = dh.createDom('ul', 'dropdown-menu');
  token = goog.string.htmlEscape(token);
  goog.array.forEach(rows, function (row) {
    var content = my.app.category.Suggest.CustomRenderer.hiliteMatchingText(row.data.path, token);
    var a = dh.createDom('a', { 'href': 'javascript:void(0)' });
    a.innerHTML = content;
    renderer.hiliteMatchingText_(a, token);
    var li = dh.createDom('li', renderer.rowClassName, a);
    renderer.rowDivs_.push(li);
    ul.appendChild(li);
  });
  element.appendChild(ul);
  return element;
};


my.app.category.Suggest.CustomRenderer.hiliteMatchingText = function (text, token) {
  return goog.string.htmlEscape(text).replace(token, function (t) {return '<b>' + t + '</b>'});
};

