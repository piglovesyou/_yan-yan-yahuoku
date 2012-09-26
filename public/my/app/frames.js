
goog.provide('my.app.Frames');

goog.require('my.app.Frame');


/**
 * @constructor
 * @extends {goog.ui.Component}
 */
my.app.Frames = function (firstFrameId, opt_domHelper) {
  goog.base(this, opt_domHelper);
  this.currSelectedFrame_ = this.createFrame(firstFrameId, false);
}
goog.inherits(my.app.Frames, goog.ui.Component);


my.app.Frames.prototype.renderFrame = function (id) {
  var frame = this.getChild(id);
  if (frame && !frame.isInDocument()) {
    frame.render(this.getContentElement());
  }
};


/**
 * @param {string} id
 */
my.app.Frames.prototype.selectFrame = function (id) {
  this.currSelectedFrame_.exitDocument();
  goog.dom.classes.enable(this.currSelectedFrame_.getElement(), 'selected', false);
  var frame = /** @type {?my.app.Frame} */(this.getChild(id));
  if (!frame) {
    // When it rendered, always be selected state.
    frame = this.createFrame(id, true);
  } else {
    goog.dom.classes.enable(frame.getElement(), 'selected', true);
    frame.enterDocument();
  }
  this.currSelectedFrame_ = frame;
};


/**
 * @type {?my.app.Frame}
 */
my.app.Frames.prototype.currSelectedFrame_;


/**
 * @return {my.app.Frame}
 */
my.app.Frames.prototype.getCurrSelectedFrame = function () {
  return this.currSelectedFrame_;
};


/**
 * @param {string} id Tab id the frame belonging to.
 * @param {boolean} render
 * @return {my.app.Frame}
 */
my.app.Frames.prototype.createFrame = function (id, render) {
  var frame = new my.app.Frame(id, this.getDomHelper());
  this.addChild(frame, render);
  return frame;
};


/** @inheritDoc */
my.app.Frames.prototype.createDom = function () {
  goog.asserts.fail('Doesn\'t support render() method.');
}


my.app.Frames.prototype.decorateInternal = function (element) {
  goog.base(this, 'decorateInternal', element);
  var dh = this.getDomHelper();
  
  var frame = this.getChildAt(0);
  goog.asserts.assert(frame);

  if (this.firstFrameElement_) {
    frame.decorateInternal(this.firstFrameElement_);
  } else {
    frame.createDom()
    dh.appendChild(this.getElement(), frame.getElement());
  }
};


my.app.Frames.prototype.canDecorate = function (element) {
  if (element) {
    var dh = this.getDomHelper();
    // can be none.
    this.firstFrameElement_ = dh.getElementByClass('frame', element);
    if (this.firstFrameElement_) {
      goog.asserts.assert(goog.dom.classes.has(this.firstFrameElement_, 'selected'), 'First frame must have className selected.');
    }
    return true;
  }
  return false;
};
