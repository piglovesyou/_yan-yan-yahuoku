
goog.provide('app.TagInput');
goog.provide('app.taginput');

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
goog.addSingletonGetter(app.TagInput);


app.TagInput.EventType = {
  TAG_UPDATE: 'tagupdate'
};

app.TagInput.prototype.buildUrl = function() {
  var dh = this.getDomHelper();

  var tagEls = goog.array.filter(goog.dom.getChildren(this.wrapEl), app.TagInput.isTagEl_);

  var datasetList = goog.array.map(tagEls, goog.dom.dataset.getAll);

  var url = new goog.Uri;
  var q = url.getQueryData();
  goog.array.forEach(datasetList, function(dataset) {
    q.add(dataset['type'], dataset['value']);
  });

  if (q.containsKey('query')) {
    q.set('query', q.getValues('query').join(' '));
    url.setPath('/items/search');
  } else {
    url.setPath('/items/categoryLeaf');
  }

  return url;
};


/** @inheritDoc */
app.TagInput.prototype.createDom = function() {
  goog.base(this, 'createDom');
};


/** @inheritDoc */
app.TagInput.prototype.decorateInternal = function(element) {
  goog.base(this, 'decorateInternal', element);

  this.inputEl = this.getElementByClass('header-input-textbox');
  this.wrapEl = this.getElementByClass('header-input-leftcontent');
  this.rightEl = this.getElementByClass('header-input-rightcontent');
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

  this.suggest = new app.taginput.Suggest(this.inputEl);

  eh.listen(this.suggest, goog.ui.ac.AutoComplete.EventType.UPDATE, this.handleSuggestUpdate);
  eh.listen(this.suggest, app.taginput.Suggest.InputHandler.EventType.KEY, this.handleInputKey);

  goog.base(this, 'enterDocument');

  this.reposition();
};


app.TagInput.prototype.handleSuggestUpdate = function(e) {
  if (e.row) {
    // Append category tag.
    this.updateCategoryTag_(e.row);
    this.dispatchEvent(app.TagInput.EventType.TAG_UPDATE);
  } else if (this.inputEl.value) {
    // Append token tag.
    // this.insertTag_(this.inputEl.value);
    this.insertTag_(
        goog.soy.renderAsFragment(app.soy.taginput.tokenTag, { 'value': this.inputEl.value }));
    this.dispatchEvent(app.TagInput.EventType.TAG_UPDATE);
  }
};


app.TagInput.prototype.updateCategoryTag_ = function(row) {
  var oldTag = this.getElementByClass('button-tag-category');
  if (oldTag) goog.dom.removeNode(oldTag);
  this.insertTag_(
      goog.soy.renderAsFragment(app.soy.taginput.categoryTag,
        /** @type {ObjectInterface.Category} */(row)), true);
};


/** @inheritDoc */
app.TagInput.prototype.disposeInternal = function() {
  goog.base(this, 'disposeInternal');
};

















/** @param {Element} el .  */
app.taginput.onTagFocus = function(el) {
  app.TagInput.getInstance().decorateTagEl(el);
};

app.TagInput.prototype.decorateTagEl = function(el) {
  this.decorateFocusable(el, this.handleTagKey);
};

app.TagInput.prototype.reposition = function() {
  goog.style.setBorderBoxSize(this.inputEl,
      new goog.math.Size(this.calcInputWidth_(), 0));
};

app.TagInput.prototype.decorateFocusable = function(el, keyHandler) {
  if (el.eh) el.eh.dispose();
  (el.eh = new goog.events.EventHandler)
    .listen(el, 'blur', this.onFocusableBlur_, null, this)
    .listen(new goog.events.KeyHandler(el), goog.events.KeyHandler.EventType.KEY, keyHandler, null, this);
};

/**
 * @param {goog.events.Event} e .
 */
app.TagInput.prototype.handleInputKey = function(e) {
  var el = e.target;
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
};

app.TagInput.prototype.focusPrevious_ = function(el) {
  var sibling = this.getPreviousFocusable_(el);
  if (sibling) {
    sibling.focus();
    return true;
  }
  return false;
};

app.TagInput.prototype.focusNext_ = function(el) {
  var sibling = this.getNextFocusable_(el);
  if (sibling) {
    sibling.focus();
    return true;
  }
  return false;
};

app.TagInput.prototype.removeTag_ = function(el) {
  if (el.tagName == goog.dom.TagName.INPUT) return;
  if (el.eh) el.eh.dispose();
  goog.dom.removeNode(el);
  this.dispatchEvent(app.TagInput.EventType.TAG_UPDATE);
};

app.TagInput.prototype.onFocusableBlur_ = function(e) {
  goog.asserts.assert(e.target);
  e.target.eh.dispose();
  e.target.eh = null;
};

/**
 * @param {Element} tagEl .
 * @param {boolean} first .
 */
app.TagInput.prototype.insertTag_ = function(tagEl, first) {
  var displayStyle = this.inputEl.style.display;
  this.inputEl.style.display = 'none';
  var lastTagEl;

  if (first || !(lastTagEl = this.getPreviousFocusable_(this.inputEl))) {
    goog.dom.insertChildAt(this.wrapEl, tagEl, 0);
  } else {
    goog.dom.insertSiblingAfter(tagEl, lastTagEl);
  }

  this.reposition();
  this.inputEl.style.display = displayStyle;
  goog.Timer.callOnce(function() { this.inputEl.value = '' }, null, this);
};

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

app.TagInput.prototype.handleWrapClick = function(e) {
  var tagEl = this.findTagFromEventTarget_(e.target);
  if (tagEl) {
    this.removeTag_(tagEl);
    e.preventDefault();
    this.reposition();
    this.dispatchEvent(app.TagInput.EventType.TAG_UPDATE);
  }
};

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
};
