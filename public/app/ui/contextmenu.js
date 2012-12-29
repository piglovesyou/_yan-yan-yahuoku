
goog.provide('app.ui.ContextMenu');

goog.require('app.dom');
goog.require('goog.ui.Container');
goog.require('goog.ui.Tooltip');



/**
 * Usage:
 *   var menu = app.ui.ContextMenu.getInstance();
 *   var component = new goog.ui.Component();
 *   component.decorate(goog.dom.getElement('target'));
 *   goog.events.listen(component.getElement(), 'mousedown', function (e) {
 *     menu.launch(e, [
 *       {content: '9'},
 *       {content: 'b'},
 *       {content: 'g'},
 *       {content: 'l'},
 *       {content: 'j'}
 *     ]);
 *   });
 * @param {goog.dom.DomHelper=} opt_domHelper .
 * @constructor
 * @extends {goog.ui.Container}
 */
app.ui.ContextMenu = function(opt_domHelper) {
  goog.base(this, null,
            app.ui.ContextMenu.Renderer.getInstance(), opt_domHelper);
  // this.setSupportedState(goog.ui.Component.State.HOVER   , false);
  // this.setSupportedState(goog.ui.Component.State.ACTIVE  , false);

  /**
   * @private
   * @type {goog.ui.Tooltip}
   */
  this.tooltip_ = new goog.ui.Tooltip(null, null, opt_domHelper);
  this.tooltip_.className += ' label';
  this.tooltip_.setShowDelayMs(this.tooltip_.getShowDelayMs() * 3);

  this.render();
  this.setVisible(false);
  this.setEnabled(false);
};
goog.inherits(app.ui.ContextMenu, goog.ui.Container);
goog.addSingletonGetter(app.ui.ContextMenu);


/**
 * @enum {string}
 */
app.ui.ContextMenu.EventTarget = {
  SELECT: 'itemselected',
  LAUNCH: 'launch',
  DISMISS: 'dismiss'
};


/**
 * @private
 * @type {boolean}
 */
app.ui.ContextMenu.prototype.dismissing_ = false;


/**
 * @private
 * @type {number}
 */
app.ui.ContextMenu.prototype.translateX_ = 50;


/**
 * @private
 * @type {number}
 */
app.ui.ContextMenu.prototype.currRotateIndex_ = -1;


/**
 * @private
 * @type {number}
 */
app.ui.ContextMenu.prototype.hilitedIndex_ = -1;


/**
 * @private
 * @type {Element|StyleSheet}
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
 * @param {boolean} next .
 * @private
 */
app.ui.ContextMenu.prototype.rotate_ = function(next) {
  this.updateRotateIndex_(next ?
      ++this.currRotateIndex_ : --this.currRotateIndex_);
  if (this.hilitedIndex_ < 0) return;

  var index;
  if (next) {
    index = this.hilitedIndex_ - 1;
    if (!this.getChildAt(index)) index = this.getChildCount() - 1;
  } else {
    index = this.hilitedIndex_ + 1;
    if (!this.getChildAt(index)) index = 0;
  }
  this.hilite_(index);
};


/**
 * @param {number} index .
 * @private
 */
app.ui.ContextMenu.prototype.updateRotateIndex_ = function(index) {
  goog.asserts.assert(this.isEnabled(), 'Should be enabled.');
  this.installStyles(this.records_.length,
                     this.currRotateIndex_ = index, this.translateX_);
};


/**
 * @param {!goog.events.Event} e .
 * @param {Array.<*>} records .
 */
app.ui.ContextMenu.prototype.launch = function(e, records) {
  if (this.dismissing_) return;
  goog.asserts.assert(!this.styleSheetElement_,
                      'Stylesheet element should be removed on dismiss.');

  var targetEl = e.currentTarget; // TODO: Are you sure?
  if (targetEl) {
    goog.style.showElement(this.targetGhostElement_, true);
    goog.style.setSize(this.targetGhostElement_, goog.style.getSize(targetEl));
    goog.style.setPageOffset(this.targetGhostElement_,
                             goog.style.getPageOffset(targetEl));
  } else {
    goog.style.showElement(this.targetGhostElement_, false);
  }

  // Init variables.
  this.records_ = records;

  this.reposition_(new goog.math.Coordinate(e.clientX, e.clientY));

  // Setup stylesheets and events.
  this.installStyles(records.length, this.currRotateIndex_, 0);
  // this.setHandleMouseEvents(true);

  // Create menu item.
  var dh = this.getDomHelper();
  goog.array.forEach(records, function(record, index) {
    this.addChildAt(new app.ui.ContextMenu.Item(record.content, dh),
                    index, true);
    // if (index == 0) this.hilite_(0);
  }, this);

  // Make this visible and enable to handle.
  this.setVisible(true);

  // Showing menu.
  goog.Timer.callOnce(function() {
    this.setEnabled(true);
    this.updateRotateIndex_(0);

    // Get focused.
    this.lastActiveElement_ = dh.getDocument().activeElement;
    this.getKeyEventTarget().focus();
    this.dispatchEvent(app.ui.ContextMenu.EventTarget.LAUNCH);
  }, 0, this);
};


/**
 * @param {goog.math.Coordinate} pos .
 * @private
 */
app.ui.ContextMenu.prototype.reposition_ = function(pos) {
  goog.style.setPosition(this.positionOriginElement_, pos);
};


/**
 * @param {number} index The item index to hilite.
 * @private
 */
app.ui.ContextMenu.prototype.hilite_ = function(index) {
  this.unhilite_();
  if (this.records_[index].desc) {
    this.tooltip_.setText(this.records_[index].desc);
  }
  this.getChildAt(this.hilitedIndex_ = index).setHighlighted(true);
};


/**
 * @private
 */
app.ui.ContextMenu.prototype.unhilite_ = function() {
  var old = this.getChildAt(this.hilitedIndex_);
  if (old) old.setHighlighted(false);
  this.hilitedIndex_ = -1;
};


/**
 * @param {boolean=} selected .
 */
app.ui.ContextMenu.prototype.dismiss = function(selected) {
  this.dismissing_ = true;

  if (selected) {
  } else {
    this.installStyles(this.records_.length, this.currRotateIndex_ - 1, 0);
  }
  this.setEnabled(false);
  // this.tooltip_.startHideTimer();

  goog.Timer.callOnce(function() {

    this.setVisible(false);

    this.removeChildren(true);
    if (this.styleSheetElement_) {
      goog.style.uninstallStyles(this.styleSheetElement_);
      this.styleSheetElement_ = null;
    }

    // this.setHandleMouseEvents(false);

    this.records_ = null;
    this.dismissing_ = false;
    this.currRotateIndex_ = -1;
    this.hilitedIndex_ = -1;
    goog.dom.classes.enable(this.getElement(), 'isHiding', false);

    if (this.lastActiveElement_) this.lastActiveElement_.focus();

    this.dispatchEvent(app.ui.ContextMenu.EventTarget.LAUNCH);
  }, 300, this);
};


/** @inheritDoc */
app.ui.ContextMenu.prototype.setEnabled = function(enable) {
  goog.base(this, 'setEnabled', enable);
  var eh = this.getHandler();
  var element = this.getElement();
  if (enable) {
    if (!this.mouseWheelHandler_) {
      this.mouseWheelHandler_ =
        new goog.events.MouseWheelHandler(this.getElement());
    }
    eh.listen(this.mouseWheelHandler_,
              goog.events.MouseWheelHandler.EventType.MOUSEWHEEL,
              this.handleMouseWheel_);
  } else if (this.mouseWheelHandler_) {
    eh.unlisten(this.mouseWheelHandler_,
                goog.events.MouseWheelHandler.EventType.MOUSEWHEEL,
                this.handleMouseWheel_);
  }
};


/**
 * @param {goog.events.MouseWheelEvent} e .
 * @private
 */
app.ui.ContextMenu.prototype.handleMouseWheel_ = function(e) {
  this.rotate_(e.detail > 0);
  e.preventDefault();
};


/**
 * @param {number} count The number of menu items.
 * @param {number} rotateIndex .
 * @param {number} translateX .
 */
app.ui.ContextMenu.prototype.installStyles = function(count, rotateIndex,
                                                      translateX) {
  if (this.styleSheetElement_) {
    goog.style.uninstallStyles(this.styleSheetElement_);
  }
  this.styleSheetElement_ = goog.style.installStyles(
      app.ui.ContextMenu.styleFactory_(count, rotateIndex, translateX),
      this.getDomHelper().getDocument());
};


/** @inheritDoc */
app.ui.ContextMenu.prototype.enterDocument = function() {
  goog.base(this, 'enterDocument');
  this.getHandler()

    // Listener for items.
    .listen(this, [
        goog.ui.Component.EventType.ENABLE,
        goog.ui.Component.EventType.DISABLE
      ], function(e) {
        goog.dom.classes.enable(this.getElement(),
          goog.getCssName(this.renderer_.getCssClass(this), 'disabled'),
            this.isEnabled());
      })

    // Listener for items.
    .listen(this, [
        goog.ui.Component.EventType.ENTER,
        goog.ui.Component.EventType.ACTION
      ], function(e) {
        if (this.dismissing_) return;
        var child = e.target;
        if (child instanceof app.ui.ContextMenu.Item) {
          this.hilite_(this.getChildIndex_(child));
        }
      })
    .listen(this, goog.ui.Component.EventType.ACTION, function(e) {
      this.selectCurrentHilited_();
    })
    .listen(this, goog.ui.Component.EventType.LEAVE, function(e) {
      this.unhilite_();
    });
};


/**
 * @param {app.ui.ContextMenu.Item} child .
 * @return {number} Index of the child.
 * @private
 */
app.ui.ContextMenu.prototype.getChildIndex_ = function(child) {
  var index = -1;
  var id = child.getId();
  goog.array.find(this.getChildIds(), function(childId, childIndex) {
    return childId == id && !!(index = childIndex);
  });
  return index;
};


/**
 * @type {Element}
 */
app.ui.ContextMenu.prototype.positionOriginElement_;


/**
 * @type {Element}
 */
app.ui.ContextMenu.prototype.targetGhostElement_;


/**
 * @param {Element} element .
 */
app.ui.ContextMenu.prototype.setTargetGhostElement = function(element) {
  this.targetGhostElement_ = element;
};


/**
 * @param {Element} element .
 */
app.ui.ContextMenu.prototype.setPositionOriginElement = function(element) {
  this.tooltip_.attach(element);
  this.positionOriginElement_ = element;
};


/**
 * Supposed to be called by renderer.
 * @param {Element} content .
 */
app.ui.ContextMenu.prototype.setContentElement = function(content) {
  this.contentElement_ = content;
};


/** @inheritDoc */
app.ui.ContextMenu.prototype.handleKeyEventInternal = function(e) {
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
      this.selectCurrentHilited_();
      return true;
  }
  return false;
};


/**
 * @override
 * @param {number} index .
 * @return {app.ui.ContextMenu.Item} .
 */
app.ui.ContextMenu.prototype.getChildAt;


/**
 * @private
 */
app.ui.ContextMenu.prototype.selectCurrentHilited_ = function() {
  var item = this.getChildAt(this.hilitedIndex_);
  if (!item) return;
  item.processSelected();
  this.dispatchEvent({
    type: app.ui.ContextMenu.EventTarget.SELECT,
    record: this.records_[this.hilitedIndex_]
  });
  this.dismissing_ = true;
  goog.dom.classes.enable(this.getElement(), 'isHiding', true);
  goog.Timer.callOnce(function() {
    this.dismiss(true);
  }, 300, this);
};


/**
 * @param {!goog.events.Event} e .
 */
app.ui.ContextMenu.prototype.handleMouseDown = function(e) {
  if (this.wasOverlayClicked_(e.target) &&
      this.isVisible() &&
      this.isEnabled()) {
    this.dismiss();
    e.stopPropagation();
    return;
  }
  goog.base(this, 'handleMouseDown', e);
};


/**
 * @param {Element} et HtmlElement.
 * @private
 * @return {boolean} .
 */
app.ui.ContextMenu.prototype.wasOverlayClicked_ = function(et) {
  return app.dom.getAncestorFromEventTargetByClass(this.getElement(),
            'menu-item', et) == this.getElement();
};


/** @inheritDoc */
app.ui.ContextMenu.prototype.getContentElement = function() {
  return this.contentElement_;
};


/**
 * @param {number} count .
 * @param {number} rotateIndex .
 * @param {number} translateX .
 * @return {string} The styel string.
 * @private
 */
app.ui.ContextMenu.styleFactory_ = function(count, rotateIndex, translateX) {
  var s = '';
  var degFrag = 360 / count;
  for (var i = 0; i < count; i++) {
    var deg = degFrag * (i + rotateIndex) - 90;
    s += '.menu-item:nth-child(' + (i + 1) + '){' +
           '-webkit-transform:rotate(' + deg + 'deg) ' +
           'translate(' + translateX + 'px,0)}' +
         '.menu-item:nth-child(' + (i + 1) + ') .menu-item-inner{' +
           '-webkit-transform:rotate(' + -deg + 'deg)}';
  }
  return s;
};




/**
 * @constructor
 * @extends {goog.ui.ContainerRenderer}
 */
app.ui.ContextMenu.Renderer = function() {
  goog.base(this);
};
goog.inherits(app.ui.ContextMenu.Renderer, goog.ui.ContainerRenderer);
goog.addSingletonGetter(app.ui.ContextMenu.Renderer);


/** @inheritDoc */
app.ui.ContextMenu.Renderer.prototype.createDom = function(control) {
  var dh = control.getDomHelper();
  var element = goog.base(this, 'createDom', control);
  var positionOriginElement, contentElement, targetGhost;
  goog.dom.setProperties(element, {
    'className': 'contextmenu-overlay'
    // , 'style', 'display:none'
  });
  dh.append(element,
      targetGhost = dh.createDom('div', 'contextmenu-targetghost'),
      positionOriginElement = dh.createDom('div', 'contextmenu',
        contentElement = dh.createDom('div', 'contextmenu-inner')));
  control.setPositionOriginElement(positionOriginElement);
  control.setTargetGhostElement(targetGhost);
  control.setContentElement(contentElement);
  return element;
};























/**
 * @param {goog.ui.ControlContent} content .
 * @param {goog.dom.DomHelper=} opt_domHelper .
 * @constructor
 * @extends {goog.ui.Control}
 */
app.ui.ContextMenu.Item = function(content, opt_domHelper) {
  goog.base(this, content,
            app.ui.ContextMenu.Item.Renderer.getInstance(), opt_domHelper);
  // Enable
  // this.setSupportedState(goog.ui.Component.State.SELECTED, true);
  // Disable
  // this.setSupportedState(goog.ui.Component.State.DISABLED, false);
  // this.setSupportedState(goog.ui.Component.State.HOVER   , false);
  // this.setSupportedState(goog.ui.Component.State.ACTIVE  , false);
  this.setSupportedState(goog.ui.Component.State.FOCUSED, false);
};
goog.inherits(app.ui.ContextMenu.Item, goog.ui.Control);


/**/
app.ui.ContextMenu.Item.prototype.processSelected = function() {
  this.renderer_.processSelected(this);
};


/** @inheritDoc */
app.ui.ContextMenu.Item.prototype.handleMouseDown = function(e) {
  e.stopPropagation();
  goog.base(this, 'handleMouseDown', e);
};


/** @inheritDoc */
app.ui.ContextMenu.Item.prototype.createDom = function() {
  var dh = this.getDomHelper();
  var element = dh.createDom('div', 'menu-item',
      dh.createDom('a', {
        'href': 'javascript:void(0)',
        'className': 'menu-item-inner i'
      }, this.getContent()));
  this.setElementInternal(element);
};


/**
 * @constructor
 * @extends {goog.ui.ControlRenderer}
 */
app.ui.ContextMenu.Item.Renderer = function() {
  goog.base(this);
};
goog.inherits(app.ui.ContextMenu.Item.Renderer, goog.ui.ControlRenderer);
goog.addSingletonGetter(app.ui.ContextMenu.Item.Renderer);


/**
 * @param {app.ui.ContextMenu.Item} item .
 */
app.ui.ContextMenu.Item.Renderer.prototype.processSelected = function(item) {
  goog.dom.classes.add(item.getElement(), 'blinking');
};
