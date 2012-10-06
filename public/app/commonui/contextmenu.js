
goog.provide('app.ui.ContextMenu');

goog.require('goog.ui.Container');



/**
 * @param {goog.dom.DomHelper=} opt_domHelper
 * @constructor
 * @extends {goog.ui.Control}
 */
app.ui.ContextMenu = function (opt_domHelper) {
  goog.base(this, '', app.ui.ContextMenu.Renderer.getInstance(), opt_domHelper);

  this.render();
};
goog.inherits(app.ui.ContextMenu, goog.ui.Control);
goog.addSingletonGetter(app.ui.ContextMenu);


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
app.ui.ContextMenu.prototype.selectedIndex_ = -1;


/**
 * @type {?Element|StyleSheet}
 */
app.ui.ContextMenu.prototype.styleSheetElement_;


/**
 * @type {?Array.<*>}
 */
app.ui.ContextMenu.prototype.records_;


/**
 * @param {boolean} next
 */
app.ui.ContextMenu.prototype.rotate_ = function (next) {
  this.updateRotateIndex_(next ? ++this.currRotateIndex_ : --this.currRotateIndex_);
};


/**
 * @param {number} index
 */
app.ui.ContextMenu.prototype.updateRotateIndex_ = function (index) {
  goog.asserts.assert(this.isVisible(), 'Should be visible.');
  var style = app.ui.ContextMenu.styleFactory_(this.currRotateIndex_ = index, this.translateX_);
  goog.style.installStyles(style, this.styleSheetElement_);
};


/**
 * @param {Element} targetElm
 * @param {Array.<*>} records
 */
app.ui.ContextMenu.prototype.launch = function (targetElm, records) {
  goog.asserts.assert(!this.isVisible(), 'Why it\'s already visible?');
  goog.asserts.assert(!this.styleSheetElement_, 'Stylesheet element should be removed on dismiss.');

  this.setHandleMouseEvents(true);

  var dh = this.getDomHelper();
  goog.style.installStyles(
      app.ui.ContextMenu.styleFactory_(this.currRotateIndex_),
      this.styleSheetElement_);

  goog.array.forEach(records, function (record) {
    this.addChild(new app.ui.ContextMenu.Item(dh), true);
  }, this);
  this.records_ = records;

  this.setVisible(true);
  goog.Timer.callOnce(function () {
    this.updateRotateIndex_(0);
  }, 0, this);
};


/**
 * @type {?goog.events.MouseWheelHandler}
 */
app.ui.ContextMenu.prototype.mouseWheelHandler_;


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


app.ui.ContextMenu.prototype.dismiss = function () {
  this.removeChildren(true);
  goog.style.uninstallStyles(this.styleSheetElement_);

  this.records_ = null;
  this.setVisible(false);

  this.setHandleMouseEvents(false);
};


/**
 * Supposed to be called by renderer.
 * @param {Element} content
 */
app.ui.ContextMenu.prototype.setContentElement = function (content) {
  this.contentElement_ = content;
};


/** @inheritDoc */
app.ui.ContextMenu.prototype.getContentElement = function () {
  return this.contentElement_;
};


/**
 * @param {number} rotateIndex
 * @param {?number=} opt_translateX
 */
app.ui.ContextMenu.styleFactory_ = function (rotateIndex, opt_translateX) {
  var s = '';
  var degFrag = 360 / 5;
  for (var i=1;i<=5;i++) {
    var deg = degFrag * ((i-1) + rotateIndex);
    s += '.menu-item:nth-child(' + i + '){' +
           '-webkit-transform:rotate(' + deg + 'deg)' + (opt_translateX ? 'translate(' + opt_translateX + 'px,0)':'') + '}' + 
         '.menu-item:nth-child(' + i + ') .menu-item-inner{' +
           '-webkit-transform:rotate(' + -deg + 'deg)}';
  }
  return s;
};














/**
 * @param {goog.dom.DomHelper=} opt_domHelper
 * @constructor
 * @extends {goog.ui.Component}
 */
app.ui.ContextMenu.Item = function (opt_domHelper) {
  goog.base(this, opt_domHelper);
}
goog.inherits(app.ui.ContextMenu.Item, goog.ui.Component);


/** @inheritDoc */
app.ui.ContextMenu.Item.prototype.enterDocument = function () {
  goog.base(this, 'enterDocument');
};


/** @inheritDoc */
app.ui.ContextMenu.Item.prototype.createDom = function () {
  var dh = this.getDomHelper();
  var element = dh.createDom('div', 'menu-item',
      dh.createDom('div', 'menu-item-inner' ,'yeah'));
  this.setElementInternal(element);
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
  element.appendChild(dh.createDom('div', 'container',
        contentElement = dh.createDom('div', 'container-inner')));
  control.setContentElement(contentElement);
  control.setVisible(false);
  return element;
};

