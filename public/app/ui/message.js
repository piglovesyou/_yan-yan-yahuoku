
goog.provide('app.ui.Message');

goog.require('app.dom.ViewportSizeMonitor');
goog.require('goog.Timer');
goog.require('goog.events.EventType');
goog.require('goog.structs.LinkedMap');




/**
 * @constructor
 * @extends {goog.events.EventTarget}
 */
app.ui.Message = function() {
  goog.base(this);

  /**
   * @type {goog.events.EventHandler}
   * @private
   */
  this.eh_ = new goog.events.EventHandler(this);

  this.eh_
      .listen(app.dom.ViewportSizeMonitor.getInstance(),
              app.dom.ViewportSizeMonitor.EventType.DELAYED_RESIZE,
              this.handleWindowResize_)
      .listen(this, app.ui.Message.EventType.CLOSE,
              this.handleClickClose_)
      .listen(this, app.ui.Message.EventType.READY_TO_DISPOSE,
              this.handleReadyToDispose_);

  /**
   * @type {Array}
   * @private
   */
  this.boxes_ = [];

};
goog.inherits(app.ui.Message, goog.events.EventTarget);
goog.addSingletonGetter(app.ui.Message);


/**
 * @enum {string}
 */
app.ui.Message.EventType = {
  CLOSE: 'close',
  READY_TO_DISPOSE: 'readytodispose'
};


/**
 * @param {string} content .
 */
app.ui.Message.prototype.alert = function(content) {
  this.create_('', content);
};


/**
 * @param {string} content .
 */
app.ui.Message.prototype.info = function(content) {
  this.create_('info', content);
};


/**
 * @param {string} content .
 */
app.ui.Message.prototype.error = function(content) {
  this.create_('error', content);
};


/**
 * @param {string} content .
 */
app.ui.Message.prototype.success = function(content) {
  this.create_('success', content);
};


/**
 * @param {string} type .
 * @param {string} content .
 * @private
 */
app.ui.Message.prototype.create_ = function(type, content) {
  var box = new app.ui.Message.Box_(type, content);
  this.boxes_.push(box);
  box.setParentEventTarget(this);
  box.render();
  this.repositionIfAny_();
};


/**
 * @param {goog.events.Event} e .
 * @private
 */
app.ui.Message.prototype.handleClickClose_ = function(e) {
  var box = e.target;
  goog.asserts.assertInstanceof(box, app.ui.Message.Box_);
  this.removeFromList_(box);
  box.willDisapear();
  this.repositionIfAny_();
};


/**
 * Remove just from list, not dispose it.
 * @param {app.ui.Message.Box_} box .
 * @private
 */
app.ui.Message.prototype.removeFromList_ = function(box) {
  goog.asserts.assertInstanceof(box, app.ui.Message.Box_);
  this.boxes_.splice(this.getIndex_(box), 1);
};


/**
 * @param {goog.events.Event} e .
 * @private
 */
app.ui.Message.prototype.handleReadyToDispose_ = function(e) {
  var box = e.target;
  goog.asserts.assertInstanceof(box, app.ui.Message.Box_);
  box.dispose();
};


/**
 * @param {goog.events.Event} e .
 * @private
 */
app.ui.Message.prototype.handleWindowResize_ = function(e) {
  this.repositionIfAny_();
};


/**
 * Reposition all boxes.
 * @private
 */
app.ui.Message.prototype.repositionIfAny_ = function() {
  if (goog.array.isEmpty(this.boxes_)) return;
  var x = this.calcX_();
  this.forEach_(function(e, i) {
    e.reposition(new goog.math.Coordinate(x, 5 + i * 40));
  });
};


/**
 * @param {app.ui.Message.Box_} box .
 * @return {number} .
 * @private
 */
app.ui.Message.prototype.getIndex_ = function(box) {
  var id = box.getId();
  var rv;
  goog.array.find(this.boxes_, function(e, i) {
    if (e.getId() === id) {
      rv = i;
      return true;
    }
    return false;
  }, this);
  return rv;
};


/**
 * @return {number} .
 * @private
 */
app.ui.Message.prototype.calcX_ = function() {
  goog.asserts.assert(!goog.array.isEmpty(this.boxes_));
  var viewportWidth = app.dom.ViewportSizeMonitor.getInstance().getSize().width;
  var elementWidth = this.boxes_[0].getElement().offsetWidth;
  return viewportWidth / 2 - elementWidth / 2;
};


/**
 * @param {Function} fn .
 * @private
 */
app.ui.Message.prototype.forEach_ = function(fn) {
  goog.array.forEach(this.boxes_, fn, this);
};


/** @inheritDoc */
app.ui.Message.prototype.disposeInternal = function() {
  if (this.eh_) {
    this.eh_.dispose();
    this.eh_ = null;
  }
  if (!goog.array.isEmpty(this.boxes_)) {
    this.forEach_(function(box) {
      this.removeChild(box, true);
      box.dispose();
    });
  }
  this.boxes_ = null;
  goog.base(this, 'disposeInternal');
};










/**
 * @type {app.ui.Message}
 */
app.message = app.ui.Message.getInstance();







/**
 * @param {string} type .
 * @param {string} content .
 * @param {?goog.dom.DomHelper} opt_domHelper .
 * @constructor
 * @extends {goog.ui.Component}
 * @private
 */
app.ui.Message.Box_ = function(type, content, opt_domHelper) {
  goog.base(this, opt_domHelper);

  /**
   * @type {string}
   * @private
   */
  this.type_ = type;

  /**
   * @type {string} Content string or HTML.
   * @private
   */
  this.content_ = content;

  /**
   * @type {goog.math.Coordinate}
   * @private
   */
  this.pos_ = new goog.math.Coordinate();

  var lifetime;
  switch (type) {
    case 'info':
      lifetime = 25 * 1000; break;
    case '': // alert
    case 'error':
    case 'success':
      lifetime = 15 * 1000; break;
  }

  /**
   * @type {goog.Timer}
   * @private
   */
  this.lifetimer_ = new goog.Timer(lifetime);

};
goog.inherits(app.ui.Message.Box_, goog.ui.Component);


/** @type {Element} */
app.ui.Message.Box_.prototype.closeButtonElement_;


/**
 * False right after creating DOM.
 * @type {boolean}
 */
app.ui.Message.Box_.prototype.isVisible_;


/**
 * @param {goog.math.Coordinate} newPos .
 */
app.ui.Message.Box_.prototype.reposition = function(newPos) {
  if (goog.math.Coordinate.equals(this.pos_, newPos)) return;
  var el = this.getElement();
  goog.style.setStyle(el, 'transform',
      app.ui.Message.Box_.createTransformValue_(this.pos_ = newPos));
  if (!this.isVisible_) {
    this.setVisibleInternal_(true);
  }
};


/**
 * @param {goog.math.Coordinate} pos .
 * @return {number} .
 * @private
 */
app.ui.Message.Box_.createTransformValue_ = function(pos) {
  return 'translate(' + pos.x + 'px,' + pos.y + 'px)';
};


/**
 * @param {boolean} visible .
 * @private
 */
app.ui.Message.Box_.prototype.setVisibleInternal_ = function(visible) {
  if (this.isVisible_ = visible) {
    this.lifetimer_.start();
    this.getElement().style.opacity = 1;
  } else {
    this.getElement().style.opacity = 0;
  }
};


/** @inheritDoc */
app.ui.Message.Box_.prototype.createDom = function() {
  var dh = this.getDomHelper();
  var className = ['alert'];
  if (!goog.string.isEmpty(this.type_)) {
    className.push('alert-' + this.type_);
  }
  var element = dh.createDom('div', className, this.closeButtonElement_ =
                             dh.createDom('button', 'close', '×'),
      dh.htmlToDocumentFragment(this.content_));
  this.setElementInternal(element);
  this.setVisibleInternal_(false);
};


/** @inheritDoc */
app.ui.Message.Box_.prototype.enterDocument = function() {
  goog.base(this, 'enterDocument');
  this.getHandler()
    .listen(this.closeButtonElement_,
            goog.events.EventType.CLICK, this.delegateClose_)
    .listen(this.lifetimer_, goog.Timer.TICK, this.delegateClose_)
    .listen(app.events.EventCenter.getInstance(),
              goog.events.EventType.TRANSITIONEND, this.handleTransitionEnd_);

};


/**
 * @private
 */
app.ui.Message.Box_.prototype.delegateClose_ = function() {
  this.dispatchEvent(app.ui.Message.EventType.CLOSE);
};


/**
 */
app.ui.Message.Box_.prototype.willDisapear = function() {
  this.setVisibleInternal_(false);
  this.getHandler().listenOnce(app.events.EventCenter.getInstance(),
    goog.events.EventType.TRANSITIONEND, function(e) {
      if (e.target === this.getElement() &&
          e.getBrowserEvent().propertyName === 'opacity') {
        this.dispatchEvent(app.ui.Message.EventType.READY_TO_DISPOSE);
      }
    });
};


/**
 * @param {goog.events.BrowserEvent} e .
 * @private
 */
app.ui.Message.Box_.prototype.handleTransitionEnd_ = function(e) {
  if (e.target === this.getElement() &&
      e.getBrowserEvent().propertyName === 'opacity') {
    goog.dom.classes.enable(this.getElement(), 'isVisible', this.isVisible_);
  }
};


/** @inheritDoc */
app.ui.Message.Box_.prototype.disposeInternal = function() {
  this.pos_ = null;
  goog.base(this, 'disposeInternal');
};
