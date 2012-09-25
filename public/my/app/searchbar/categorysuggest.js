
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
my.app.category.Suggest = function (url, inputElement, opt_domHelper) {
  var u = undefined;

  var matcher = new goog.ui.ac.RemoteArrayMatcher(url, false);
  var customRenderer = new my.app.category.Suggest.CustomRenderer;
  var renderer = new goog.ui.ac.Renderer(u, customRenderer);
  var inputHandler = new my.app.category.Suggest.InputHandler(null, null, false, 300);

  goog.base(this, matcher, renderer, inputHandler);

  inputHandler.attachAutoComplete(this);
  inputHandler.attachInput(inputElement);

  var labelText = '全てのカテゴリから';

  var labelInput;
  /**
   * @type {goog.ui.LabelInput}
   */
  this.labelInput_ = labelInput = new goog.ui.LabelInput(labelText);
  labelInput.decorate(inputElement);

  var tooltip;
  /**
   * @type {goog.ui.Tooltip}
   */
  this.tooltip_ = tooltip = new goog.ui.Tooltip(inputElement, labelText);;
  tooltip.className += ' label';

  var eh = new goog.events.EventHandler(this);
  eh.listen(this, goog.ui.ac.AutoComplete.EventType.UPDATE, this.handleSelected);

}
goog.inherits(my.app.category.Suggest, goog.ui.ac.AutoComplete);


/**
 * @enum {string}
 */
my.app.category.Suggest.EventType = {
  UPDATE_CATEGORY: 'updatecategory'
};


/**
 * @type {string|nubmer}
 */
my.app.category.Suggest.DefaultCategory = 0;


/**
 * @param {goog.events.Event} e
 */
my.app.category.Suggest.prototype.handleSelected = function (e) {
  var row = e.row;
  if (row) {
    this.tooltip_.setText(row.path);
    this.dispatchUpdate_(row.id);
  }
};


/**
 * @param {string|number} id
 */
my.app.category.Suggest.prototype.dispatchUpdate_ = function (id) {
  this.dispatchEvent({
    'type': my.app.category.Suggest.EventType.UPDATE_CATEGORY,
    'categoryId': id
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


my.app.category.Suggest.InputHandler.prototype.handleKeyUp = function (e) {
  if (e.target == this.activeElement_ && e.target.value == '') {
    this.getAutoComplete().dispatchUpdate_(my.app.category.Suggest.DefaultCategory);
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
    var li = dh.createDom('li', null, a);
    renderer.rowDivs_.push(li);
    ul.appendChild(li);
  });
  element.appendChild(ul);
  return element;
};


my.app.category.Suggest.CustomRenderer.hiliteMatchingText = function (text, token) {
  return goog.string.htmlEscape(text).replace(token, function (t) {return '<b>' + t + '</b>'});
};

