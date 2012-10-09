
goog.provide('app.ui.ContextMenu');

goog.require('goog.ui.Container');



/**
 * @param {goog.dom.DomHelper=} opt_domHelper
 * @constructor
 * @extends {goog.ui.Control}
 */
app.ui.ContextMenu = function (opt_domHelper) {
  goog.base(this, '', app.ui.ContextMenu.Renderer.getInstance(), opt_domHelper);
  this.setSupportedState(goog.ui.Component.State.HOVER   , false);
  this.setSupportedState(goog.ui.Component.State.ACTIVE  , false);

  this.render();
  this.setVisible(false);
  this.setEnabled(false);
};
goog.inherits(app.ui.ContextMenu, goog.ui.Control);
goog.addSingletonGetter(app.ui.ContextMenu);


/**
 * @type {boolean}
 */
app.ui.ContextMenu.prototype.dismissing_ = false;


/**
 * @type {number}
 */
app.ui.ContextMenu.prototype.translateX_ = 70;


/**
 * @type {number}
 */
app.ui.ContextMenu.prototype.currRotateIndex_ = -1;


/**
 * @type {number}
 */
app.ui.ContextMenu.prototype.hilitedIndex_ = -1;


/**
 * @type {?Element|StyleSheet}
 */
app.ui.ContextMenu.prototype.styleSheetElement_;


/**
 * Only reference to records object.
 * We release it everytime on dismiss.
 * @type {?Array.<*>} 
 */
app.ui.ContextMenu.prototype.records_;


/**
 * @type {?goog.events.MouseWheelHandler}
 */
app.ui.ContextMenu.prototype.mouseWheelHandler_;


/**
 * @param {boolean} next
 */
app.ui.ContextMenu.prototype.rotate_ = function (next) {
  var index;
  if (next) {
    ++this.currRotateIndex_;
    var index = this.hilitedIndex_ - 1;
    if (!this.getChildAt(index)) index = this.getChildCount() - 1;
  } else {
    --this.currRotateIndex_;
    var index = this.hilitedIndex_ + 1;
    if (!this.getChildAt(index)) index = 0;
  }
  console.log(index);
  this.updateRotateIndex_(this.currRotateIndex_);
  this.hilite_(index);
};


/**
 * @param {number} index
 */
app.ui.ContextMenu.prototype.updateRotateIndex_ = function (index) {
  goog.asserts.assert(this.isEnabled(), 'Should be enabled.');
  this.installStyles(this.records_.length, this.currRotateIndex_ = index, this.translateX_);
};


/**
 * @param {Element} targetElm
 * @param {Array.<*>} records
 */
app.ui.ContextMenu.prototype.launch = function (targetElm, records) {
  if (this.dismissing_) return;
  goog.asserts.assert(!this.styleSheetElement_, 'Stylesheet element should be removed on dismiss.');

  // Init variables.
  this.records_ = records;

  // Setup stylesheets and events.
  this.installStyles(records.length, this.currRotateIndex_, 0);
  this.setHandleMouseEvents(true);

  // Create menu item.
  var dh = this.getDomHelper();
  goog.array.forEach(records, function (record, index) {
    this.addChildAt(new app.ui.ContextMenu.Item(record, dh), index, true);
    // if (index == 0) this.hilite_(0);
  }, this);

  // Make this visible and enable to handle.
  this.setVisible(true);

  // Showing menu.
  goog.Timer.callOnce(function () {
    this.setEnabled(true);
    this.updateRotateIndex_(0);

    // Get focused.
    this.lastActiveElement_ = dh.getDocument().activeElement;
    this.getKeyEventTarget().focus();
  }, 0, this);
};


app.ui.ContextMenu.prototype.hilite_ = function (index) {
  // goog.asserts.assert(, 'Stylesheet element should be removed on dismiss.');
  var old = this.getChildAt(this.hilitedIndex_);
  if (old) old.setSelected(false);
  this.getChildAt(this.hilitedIndex_ = index).setSelected(true);
};


app.ui.ContextMenu.prototype.dismiss = function () {
  if (this.dismissing_) return;
  this.dismissing_ = true;
  this.installStyles(this.records_.length, this.currRotateIndex_-1, 0);
  this.setEnabled(false);

  goog.Timer.callOnce(function () {
  
    this.setVisible(false);

    this.removeChildren(true);
    goog.style.uninstallStyles(this.styleSheetElement_);
    this.styleSheetElement_ = null;

    this.setHandleMouseEvents(false);

    this.records_ = null;
    this.dismissing_ = false;
    this.currRotateIndex_ = -1;
    this.hilitedIndex_ = -1;

    if (this.lastActiveElement_) this.lastActiveElement_.focus();
  }, 300, this);
};


/** @inheritDoc */
app.ui.ContextMenu.prototype.setHandleMouseEvents = function (enable) {
  goog.base(this, 'setHandleMouseEvents', enable);
  var eh = this.getHandler();
  var element = this.getElement();
  if (enable) {
    if (!this.mouseWheelHandler_) {
      this.mouseWheelHandler_ = new goog.events.MouseWheelHandler(this.getElement());
    }

    eh.listen(this.mouseWheelHandler_,
        goog.events.MouseWheelHandler.EventType.MOUSEWHEEL, this.handleMouseWheel_);
  } else {
    eh.unlisten(this.mouseWheelHandler_,
        goog.events.MouseWheelHandler.EventType.MOUSEWHEEL, this.handleMouseWheel_);
  }
};


/**
 * @param {goog.events.MouseWheelEvent} e
 */
app.ui.ContextMenu.prototype.handleMouseWheel_ = function (e) {
  this.rotate_(e.detail > 0);
  e.preventDefault();
};


app.ui.ContextMenu.prototype.installStyles = function (count, rotateIndex, translateX) {
  if (this.styleSheetElement_) goog.style.uninstallStyles(this.styleSheetElement_);
  this.styleSheetElement_ = goog.style.installStyles(
      app.ui.ContextMenu.styleFactory_(count, rotateIndex, translateX),
      this.getDomHelper().getDocument());
};


app.ui.ContextMenu.prototype.enterDocument = function () {
  goog.base(this, 'enterDocument');
  this.getHandler()
    .listen(this, goog.ui.Component.EventType.ENTER, function (e) {
      var child = e.target;
      if (child instanceof app.ui.ContextMenu.Item) {
        console.log(this.getChildIndex_(child));
        this.hilite_(this.getChildIndex_(child));
      }
    });
};


app.ui.ContextMenu.prototype.getChildIndex_ = function (child) {
  var index = -1;
  var id = child.getId();
  goog.array.find(this.getChildIds(), function (childId, childIndex) {
    return childId == id && !!(index = childIndex);
  });
  return index;
};


/**
 * Supposed to be called by renderer.
 * @param {Element} content
 */
app.ui.ContextMenu.prototype.setContentElement = function (content) {
  this.contentElement_ = content;
};


app.ui.ContextMenu.prototype.handleKeyEventInternal = function (e) {
  switch (e.keyCode) {
    case goog.events.KeyCodes.RIGHT:
    case goog.events.KeyCodes.DOWN:
      this.rotate_(true);
      return true;
    case goog.events.KeyCodes.LEFT:
    case goog.events.KeyCodes.UP:
      this.rotate_(false);
      return true;
    case goog.events.KeyCodes.SPACE:
    case goog.events.KeyCodes.ENTER:
      return this.performActionInternal(e);
  }
  return false;
};


app.ui.ContextMenu.prototype.handleMouseDown = function (e) {
  if (e.target == this.getElement() && this.isVisible() && this.isEnabled()) {
    this.dismiss();
    e.stopPropagation();
    return;
  }
  goog.base(this, 'handleMouseDown', e);
};


/** @inheritDoc */
app.ui.ContextMenu.prototype.getContentElement = function () {
  return this.contentElement_;
};


/**
 * @param {number} rotateIndex
 * @param {number} translateX
 */
app.ui.ContextMenu.styleFactory_ = function (count, rotateIndex, translateX) {
  var s = '';
  var degFrag = 360 / count;
  for (var i=0;i<count;i++) {
    var deg = degFrag * (i + rotateIndex) -90;
    s += '.menu-item:nth-child(' + (i+1) + '){' +
           '-webkit-transform:rotate(' + deg + 'deg)translate(' + translateX + 'px,0)}' + 
         '.menu-item:nth-child(' + (i+1) + ') .menu-item-inner{' +
           '-webkit-transform:rotate(' + -deg + 'deg)}';
  }
  return s;
};




/**
 * @constructor
 * @extends {goog.ui.ControlRenderer}
 */
app.ui.ContextMenu.Renderer = function () {
  goog.base(this);
};
goog.inherits(app.ui.ContextMenu.Renderer, goog.ui.ControlRenderer);
goog.addSingletonGetter(app.ui.ContextMenu.Renderer);


/** @inheritDoc */
app.ui.ContextMenu.Renderer.prototype.createDom = function (control) {
  var dh = control.getDomHelper();
  var element = goog.base(this, 'createDom', control);
  var contentElement;
  goog.dom.setProperties(element, {
    'className': 'contextmenu-overlay'
    // , 'style', 'display:none'
  });
  element.appendChild(dh.createDom('div', 'contextmenu',
        contentElement = dh.createDom('div', 'contextmenu-inner')));
  control.setContentElement(contentElement);
  return element;
};























/**
 * @param {goog.dom.DomHelper=} opt_domHelper
 * @constructor
 * @extends {goog.ui.Component}
 */
app.ui.ContextMenu.Item = function (content, opt_domHelper) {
  goog.base(this, content, app.ui.ContextMenu.Item.Renderer.getInstance(), opt_domHelper);
  // Enable 
  this.setSupportedState(goog.ui.Component.State.SELECTED, true);
  // Disable
  // this.setSupportedState(goog.ui.Component.State.DISABLED, false);
  // this.setSupportedState(goog.ui.Component.State.HOVER   , false);
  // this.setSupportedState(goog.ui.Component.State.ACTIVE  , false);
  // this.setSupportedState(goog.ui.Component.State.FOCUSED , false);
};
goog.inherits(app.ui.ContextMenu.Item, goog.ui.Control);


// /** @inheritDoc */
// app.ui.ContextMenu.Item.prototype.enterDocument = function () {
//   goog.base(this, 'enterDocument');
// };


/** @inheritDoc */
app.ui.ContextMenu.Item.prototype.createDom = function () {
  var dh = this.getDomHelper();
  var element = dh.createDom('div', 'menu-item',
      dh.createDom('div', 'menu-item-inner i', this.getContent()));
  this.setElementInternal(element);
};




/**
 * @constructor
 * @extends {goog.ui.ControlRenderer}
 */
app.ui.ContextMenu.Item.Renderer = function () {
  goog.base(this);
};
goog.inherits(app.ui.ContextMenu.Item.Renderer, goog.ui.ControlRenderer);
goog.addSingletonGetter(app.ui.ContextMenu.Item.Renderer);

