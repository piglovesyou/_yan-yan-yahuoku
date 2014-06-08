
goog.provide('app.TagInput');
goog.provide('app.taginput');

goog.require('app.ViewportSizeMonitor');
goog.require('app.soy.taginput');
goog.require('app.taginput.Suggest');
goog.require('goog.Timer');
goog.require('goog.asserts');
goog.require('goog.dom');
goog.require('goog.dom.classes');
goog.require('goog.dom.dataset');
goog.require('goog.dom.selection');
goog.require('goog.events');
goog.require('goog.events.InputHandler');
goog.require('goog.events.KeyHandler');
goog.require('goog.structs.Set');
goog.require('goog.style');
goog.require('goog.ui.Component');




/**
 * @constructor
 * @param {goog.dom.DomHelper=} opt_domHelper .
 * @extends {goog.ui.Component}
 */
app.TagInput = function(opt_domHelper) {
  goog.base(this, opt_domHelper);
};
goog.inherits(app.TagInput, goog.ui.Component);

/**
 * @enum {string}
 */
app.TagInput.EventType = {
  TAG_UPDATE: 'tagupdate'
};

/**
 * @return {ObjectInterface.TabQuery} .
 */
app.TagInput.prototype.getInputs = function() {
  var rv = /** @type {!ObjectInterface.TabQuery} */({});
  this.forEachTagDataset_(function(dataset) {
    goog.object.forEach(dataset, function(v, k) {
      (rv[k] || (rv[k] = [])).push(v);
    });
  });
  return rv;
};

/**
 * @private
 * @param {function(Object, number, Array)} fn .
 */
app.TagInput.prototype.forEachTagDataset_ = function(fn) {
  var tagEls = this.collectTagEls_();
  var datasetList = goog.array.map(tagEls,
      /** @type {function ((Element|null), number, ?): ?|null} */
      (goog.dom.dataset.getAll));
  goog.array.forEach(datasetList, fn);
};

/**
 * @private
 * @return {Array.<Element>} .
 */
app.TagInput.prototype.collectTagEls_ = function() {
  return goog.array.filter(
      goog.dom.getChildren(this.wrapEl), app.TagInput.isTagEl_);
};

/** @inheritDoc */
app.TagInput.prototype.createDom = function() {
  this.setElementInternal(
    /**@type{Element}*/(goog.soy.renderAsFragment(app.soy.taginput.createDom)));
  this.decorateInternal(this.getElement());
};


/** @inheritDoc */
app.TagInput.prototype.decorateInternal = function(element) {
  goog.base(this, 'decorateInternal', element);

  this.inputEl = this.getElementByClass('tag-input-textbox');
  this.wrapEl = this.getElementByClass('tag-input-leftcontent');
  this.rightEl = this.getElementByClass('tag-input-rightcontent');
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

  // this.wrapEl
  eh.listen(this.wrapEl, 'click', this.handleWrapClick);

  // suggest
  this.suggest = new app.taginput.Suggest(this.inputEl);
  eh.listen(this.suggest,
      goog.ui.ac.AutoComplete.EventType.UPDATE, this.handleSuggestUpdate);
  eh.listen(this.suggest,
      app.taginput.Suggest.InputHandler.EventType.KEY, this.handleInputKey);
  eh.listen(app.ViewportSizeMonitor.getInstance(),
          app.ViewportSizeMonitor.EventType.DELAYED_RESIZE, this.reposition);

  // tags
  goog.array.forEach(this.collectTagEls_(), this.attachKeyEventOnTag_, this);

  // append tags stored in localStorage.
  this.deployTags_();

  // setup children and reposition inputEl
  goog.base(this, 'enterDocument');
  this.reposition();
};

/**
 * @param {goog.events.Event} e .
 */
app.TagInput.prototype.handleSuggestUpdate = function(e) {
  var queryValue;
  if (e.row) {
    // Append category tag.
    this.updateCategoryTag_(/** @type {ObjectInterface.Category} */(e.row));

  } else if (queryValue = this.inputEl.value) {
    // Update model
    var data = app.model.getTabQuery(app.util.getTabId(this));
    if (!data.query) {}
    else if (goog.array.contains(data.query, queryValue)) {
      this.inputEl.value = '';
      return;
    }
    (data.query || (data.query = [])).push(queryValue);
    app.model.setTabQuery(app.util.getTabId(this), data);

    // Append token tag.
    this.insertTagEl_(
        /**@type{Element}*/(goog.soy.renderAsFragment(
          app.soy.taginput.tokenTag, { queryValue: queryValue })));
  }
};

/**
 * @private
 * @param {ObjectInterface.Category} row .
 */
app.TagInput.prototype.updateCategoryTag_ = function(row) {
  var oldTag = this.getElementByClass('button-tag-category');
  if (oldTag) this.removeTag_(oldTag, true);

  // Update model
  var data = app.model.getTabQuery(app.util.getTabId(this));
  data.category = row;
  app.model.setTabQuery(app.util.getTabId(this), data);

  this.insertTagEl_(
      /**@type{Element}*/(goog.soy.renderAsFragment(
        app.soy.taginput.categoryTag, row)), true);
};


/** @inheritDoc */
app.TagInput.prototype.disposeInternal = function() {
  goog.base(this, 'disposeInternal');
};

















/***/
app.TagInput.prototype.reposition = function() {
  goog.style.setBorderBoxSize(this.inputEl,
      new goog.math.Size(this.calcInputWidth_(), 0));
};

/**
 * @private
 * @param {Element} el .
 */
app.TagInput.prototype.attachKeyEventOnTag_ = function(el) {
  if (el.eh) el.eh.dispose();
  (el.eh = new goog.events.EventHandler)
    .listen(new goog.events.KeyHandler(el),
        goog.events.KeyHandler.EventType.KEY, this.handleTagKey, false, this);
};

/**
 * @param {goog.events.Event} e .
 */
app.TagInput.prototype.handleInputKey = function(e) {
  var el = /** @type {Element} */(e.target);
  switch (e.keyCode) {
    // Steel ENTER key from a "ac.InputHandler".
    case goog.events.KeyCodes.ENTER:
      this.suggest.selectHilited(); // Always fires "UPDATE" event.
      e.preventDefault();
    case goog.events.KeyCodes.BACKSPACE:
    case goog.events.KeyCodes.LEFT:
      if (goog.dom.selection.getStart(el)) return;
      if (this.focusPrevious_(el)) e.preventDefault();
      break;
  }
};

/**
 * @param {goog.events.Event} e .
 */
app.TagInput.prototype.handleTagKey = function(e) {
  var el = /** @type {Element} */(e.target);
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
};

/**
 * @private
 * @param {Element} el .
 * @return {boolean} .
 */
app.TagInput.prototype.focusPrevious_ = function(el) {
  var sibling = this.getPreviousFocusable_(el);
  if (sibling) {
    sibling.focus();
    return true;
  }
  return false;
};

/**
 * @private
 * @param {Element} el .
 * @return {boolean} .
 */
app.TagInput.prototype.focusNext_ = function(el) {
  var sibling = this.getNextFocusable_(el);
  if (sibling) {
    sibling.focus();
    return true;
  }
  return false;
};

/**
 * @private
 * @param {Element} el .
 * @param {boolean=} opt_suppressEvent .
 */
app.TagInput.prototype.removeTag_ = function(el, opt_suppressEvent) {
  if (el.tagName == goog.dom.TagName.INPUT) return;
  if (el.eh) el.eh.dispose();

  // Update model
  var data = app.model.getTabQuery(app.util.getTabId(this));
  var dataset = goog.dom.dataset.getAll(el);
  var tagId = dataset['id'];
  var tagType = dataset['type'];
  goog.asserts.assert(tagId, tagType);
  switch (tagType) {
    case 'category':
      delete data.category;
    case 'query':
      goog.array.remove(data.query, tagId);
  }
  app.model.setTabQuery(app.util.getTabId(this), data);

  // Remove dom
  goog.dom.removeNode(el);
  if (!opt_suppressEvent) {
    this.dispatchEvent(app.TagInput.EventType.TAG_UPDATE);
  }
};

/**
 * @private
 * @param {goog.events.Event} e .
 */
app.TagInput.prototype.onFocusableBlur_ = function(e) {
  goog.asserts.assert(e.target);
  e.target.eh.dispose();
  e.target.eh = null;
};

/**
 * @private
 * @param {Element} el .
 * @param {boolean=} first .
 */
app.TagInput.prototype.insertTagEl_ = function(el, first) {
  var displayStyle = this.inputEl.style.display;
  this.inputEl.style.display = 'none';
  var lastTagEl;

  if (first || !(lastTagEl = this.getPreviousFocusable_(this.inputEl))) {
    goog.dom.insertChildAt(this.wrapEl, el, 0);
  } else {
    goog.dom.insertSiblingAfter(el, lastTagEl);
  }
  this.attachKeyEventOnTag_(/** @type {Element} */(el));

  this.reposition();
  this.inputEl.style.display = displayStyle;
  goog.Timer.callOnce(function() { this.inputEl.value = '' }, undefined, this);

  this.dispatchEvent(app.TagInput.EventType.TAG_UPDATE);
};

/**
 * @private
 * @return {number} .
 */
app.TagInput.prototype.calcInputWidth_ = function() {
  var lastTag = this.getLastTag_();
  var wrapSize = goog.style.getContentBoxSize(this.wrapEl);
  if (!lastTag) return wrapSize.width;

  var tagPos = goog.style.getRelativePosition(lastTag, this.wrapEl);
  var tagSize = goog.style.getBorderBoxSize(lastTag);
  var BETWEEN_TAG_AND_TEXTBOX = 10;
  var MINIMUM_WIDTH = 80;

  var width = wrapSize.width - tagPos.x -
              tagSize.width - BETWEEN_TAG_AND_TEXTBOX;
  if (width < MINIMUM_WIDTH) return wrapSize.width;
  return width;
};

app.TagInput.prototype.getPreviousFocusable_ = function(target) {
  return this.getSiblingFocusable_(target, goog.dom.getPreviousElementSibling);
};

app.TagInput.prototype.getNextFocusable_ = function(target) {
  return this.getSiblingFocusable_(target, goog.dom.getNextElementSibling);
};

app.TagInput.prototype.getSiblingFocusable_ = function(target, getSibling) {
  var el;
  while (el = getSibling(target))
    if (goog.dom.isFocusableTabIndex(el))
      return el;
  return null;
};

app.TagInput.prototype.getLastTag_ = function() {
  return this.getPreviousFocusable_(this.inputEl);
};

/**
 * @param {goog.events.Event} e .
 */
app.TagInput.prototype.handleWrapClick = function(e) {
  var tagEl = this.findTagFromEventTarget_(/** @type {Element} */(e.target));
  if (tagEl) {
    this.removeTag_(tagEl);
    e.preventDefault();
    this.reposition();
  }
};

/**
 * @private
 * @param {Element} et .
 */
app.TagInput.prototype.findTagFromEventTarget_ = function(et) {
  return goog.dom.getAncestor(et, app.TagInput.isTagEl_);
};

app.TagInput.isTagEl_ = function(node) {
  return goog.dom.classes.has(node, 'button-tag');
};

app.TagInput.prototype.updateRightContent = function(data) {
  if (!this.isInDocument()) return;
  goog.soy.renderElement(this.rightEl,
      app.soy.taginput.rightContent, data);
  this.reposition();
};

app.TagInput.prototype.deployTags_ = function() {
  var data = app.model.getTabQuery(app.util.getTabId(this));

  goog.asserts.assert(data);

  if (!data.category && (!data.query || goog.array.isEmpty(data.query))) {
    // Tab needs an event to renderContent.
    this.dispatchEvent(app.TagInput.EventType.TAG_UPDATE);
    return;
  }

  if (data.category) {
    this.insertTagEl_(
        /**@type{Element}*/(goog.soy.renderAsFragment(app.soy.taginput.categoryTag,
          data.category)), true);
  }

  if (data.query) {
    goog.array.forEach(data.query, function(q) {
      this.insertTagEl_(
          /**@type{Element}*/(goog.soy.renderAsFragment(app.soy.taginput.tokenTag,
            { queryValue: q })));
    }, this);
  }
};
