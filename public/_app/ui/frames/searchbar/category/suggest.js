
goog.provide('app.ui.category.Suggest');

goog.require('goog.Timer');
goog.require('goog.ui.LabelInput');
goog.require('goog.ui.Tooltip');
goog.require('goog.ui.ac.AutoComplete');
goog.require('goog.ui.ac.InputHandler');
goog.require('goog.ui.ac.RemoteArrayMatcher');
goog.require('goog.ui.ac.Renderer');


/**
 * @constructor
 * @extends {goog.ui.ac.AutoComplete}
 */
app.ui.category.Suggest = function(url, inputElement, lastCategory, opt_domHelper) {
  var u = undefined;

  var matcher = new goog.ui.ac.RemoteArrayMatcher(url, false);
  var customRenderer = new app.ui.category.Suggest.CustomRenderer;
  var renderer = new goog.ui.ac.Renderer(u, customRenderer);
  var inputHandler = new app.ui.category.Suggest.InputHandler(null, null, false, 300);

  goog.base(this, matcher, renderer, inputHandler);
  this.setAutoHilite(false);

  inputHandler.attachAutoComplete(this);
  inputHandler.attachInput(inputElement);

  var defaultLabel = '全てのカテゴリから';
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
      !goog.string.isEmpty(lastCategory['CategoryPath']) ? lastCategory['CategoryPath'] : defaultLabel);
  tooltip.className += ' label';

  var eh = new goog.events.EventHandler(this);
  eh.listen(this, goog.ui.ac.AutoComplete.EventType.UPDATE, this.handleSelected);

  /**
   * Set saved condition as last category.
   * @type {Object}
   */
  this.lastSelectedRow_ = lastCategory;
};
goog.inherits(app.ui.category.Suggest, goog.ui.ac.AutoComplete);


/**
 * @enum {string}
 */
app.ui.category.Suggest.EventType = {
  UPDATE_CATEGORY: 'updatecategory'
};


/**
 * @type {Object}
 */
app.ui.category.Suggest.DefaultRow = {
  'CategoryId': 0,
  'CategoryPath': ''
};


app.ui.category.Suggest.prototype.processBeforeInputBlur = function(inputHandler) {
  this.getBackInputTextIfNeeded_(inputHandler);
};


app.ui.category.Suggest.prototype.clearSelection = function(inputHandler) {
  if (inputHandler.getActiveElement()) inputHandler.setValue('');
  this.tooltip_.setText('全てのカテゴリから');
  this.lastSelectedRow_ = app.ui.category.Suggest.DefaultRow;
  this.dispatchUpdate_(app.ui.category.Suggest.DefaultRow);
};


/**
 * @param {app.ui.category.Suggest.InputHandler} inputHandler
 */
app.ui.category.Suggest.prototype.getBackInputTextIfNeeded_ = function(inputHandler) {
  var value = inputHandler.getActiveElement() && inputHandler.getValue();
  if (goog.isString(value) && this.lastSelectedRow_['CategoryPath'] !== value) {
    if (goog.string.isEmpty(value)) {
      // If an empty value, just clear all.
      this.clearSelection(inputHandler);
    } else {
      // Else, get back input value.
      inputHandler.setValue(this.lastSelectedRow_['CategoryPath']);
    }
  }
};


/**
 * @param {Object} e
 */
app.ui.category.Suggest.prototype.handleSelected = function(e) {
  var row = e.row;
  if (row) {
    this.lastSelectedRow_ = row;
    this.tooltip_.setText(row['CategoryPath']);
    this.dispatchUpdate_(row);
  }
};


/**
 * @param {Object} row .
 */
app.ui.category.Suggest.prototype.dispatchUpdate_ = function(row) {
  this.dispatchEvent({
    type: app.ui.category.Suggest.EventType.UPDATE_CATEGORY,
    category: row
  });
};


/** @inheritDoc */
app.ui.category.Suggest.prototype.disposeInternal = function() {
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
app.ui.category.Suggest.InputHandler = function(opt_separators, opt_literals, opt_multi, opt_throttleTime) {
  goog.base(this, opt_separators, opt_literals, opt_multi, opt_throttleTime);
};
goog.inherits(app.ui.category.Suggest.InputHandler, goog.ui.ac.InputHandler);


/** @inheritDoc */
app.ui.category.Suggest.InputHandler.prototype.processFocus = function(target) {
  goog.base(this, 'processFocus', target);
  if (this.activeElement_ = target) {
    this.activeElement_.value = this.activeElement_.value;
  }
};


app.ui.category.Suggest.InputHandler.prototype.handleBlur = function(e) {
  this.getAutoComplete().processBeforeInputBlur(this);
  var input = this.getActiveElement();
  goog.base(this, 'handleBlur', e);
  if (input) {
    app.ui.category.Suggest.InputHandler.showEndOfValue(input);
  }
};


/**
 * @param {Element} inputElement
 */
app.ui.category.Suggest.InputHandler.showEndOfValue = function(inputElement) {
  // I don't understand why it needs defer (but it does)
  goog.Timer.callOnce(function() {
    inputElement.scrollLeft = inputElement.scrollWidth; // It's bigger, but who cares.
  });
};


/** @inheritDoc */
app.ui.category.Suggest.InputHandler.prototype.handleKeyUp = function(e) {
  if (e.target == this.activeElement_ && e.target.value == '') {
    this.getAutoComplete().clearSelection(this);
  }
};


/** @inheritDoc */
app.ui.category.Suggest.InputHandler.prototype.needKeyUpListener = function() {
  return true;
};


app.ui.category.Suggest.InputHandler.prototype.selectRow = function(row, opt_multi) {
  this.setTokenText(row['CategoryPath'], opt_multi);
  var inputElement = this.getActiveElement();
  if (inputElement) app.ui.category.Suggest.InputHandler.showEndOfValue(inputElement);
  return false;
};




/**
 * @constructor
 */
app.ui.category.Suggest.CustomRenderer = function() {};

app.ui.category.Suggest.CustomRenderer.prototype.render = function(renderer, element, rows, token) {
  var dh = goog.dom.getDomHelper();
  var ul = dh.createDom('ul', 'dropdown-menu');

  token = goog.string.htmlEscape(token);
  goog.array.forEach(rows, function(row) {
    var data = row.data;
    // var hasSubRows = data['IsLeaf'] == 'false' && goog.isArray(data['ChildCategory']);

    var li = app.ui.category.Suggest.CustomRenderer.createLi(renderer, data, token, dh, false, false);
    renderer.rowDivs_.push(li);

    // if (hasSubRows) {
    //   var subUl = dh.createDom('ul', 'dropdown-menu');
    //   goog.array.forEach(data['ChildCategory'], function (subRow) {
    //     var li = app.ui.category.Suggest.CustomRenderer.createLi(renderer, subRow, token, dh, false, true)
    //     renderer.rowDivs_.push(li);
    //     subUl.appendChild(li);
    //   });
    //   li.appendChild(subUl);
    // }

    ul.appendChild(li);
  });
  element.appendChild(ul);
  return element;
};


app.ui.category.Suggest.CustomRenderer.createLi = function(renderer, row, token, dh, hasSubRows, onlyName) {

  var content = app.ui.category.Suggest.CustomRenderer.hiliteMatchingText(
      onlyName ? row['CategoryName'] : row['CategoryPath'], token);
  var a = dh.createDom('a', { 'href': 'javascript:void(0)' });
  a.innerHTML = content;
  renderer.hiliteMatchingText_(a, token);
  var li = dh.createDom('li', renderer.rowClassName + (hasSubRows ? ' dropdown-submenu' : ''), a);

  return li;
};


app.ui.category.Suggest.CustomRenderer.hiliteMatchingText = function(text, token) {
  return goog.string.htmlEscape(text).replace(token, function(t) {return '<b>' + t + '</b>'});
};
