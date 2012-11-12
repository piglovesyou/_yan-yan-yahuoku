
goog.provide('app.ui.Frames');

goog.require('app.ui.Frame');


/**
 * @constructor
 * @extends {goog.ui.Component}
 */
app.ui.Frames = function (firstFrameId, opt_domHelper) {
  goog.base(this, opt_domHelper);
  this.currSelectedFrame_ = this.createFrame(firstFrameId, false);
}
goog.inherits(app.ui.Frames, goog.ui.Component);


app.ui.Frames.prototype.renderFrame = function (id) {
  var frame = this.getChild(id);
  if (frame && !frame.isInDocument()) {
    frame.render(this.getContentElement());
  }
};


/**
 * @param {string} id
 */
app.ui.Frames.prototype.selectFrame = function (id) {
  goog.dom.classes.enable(this.currSelectedFrame_.getElement(), 'selected', false);
  var frame = /** @type {?app.ui.Frame} */(this.getChild(id));
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
 * @type {?app.ui.Frame}
 */
app.ui.Frames.prototype.currSelectedFrame_;


/**
 * @return {app.ui.Frame}
 */
app.ui.Frames.prototype.getCurrSelectedFrame = function () {
  return this.currSelectedFrame_;
};


/**
 * @param {string} id Tab id the frame belonging to.
 * @param {boolean} render
 * @return {app.ui.Frame}
 */
app.ui.Frames.prototype.createFrame = function (id, render) {
  var frame = new app.ui.Frame(id, this.getDomHelper());
  this.addChild(frame, render);
  return frame;
};


/** @inheritDoc */
app.ui.Frames.prototype.createDom = function () {
  goog.asserts.fail('Doesn\'t support render() method.');
}


/** @inheritDoc */
app.ui.Frames.prototype.decorateInternal = function (element) {
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


app.ui.Frames.prototype.canDecorate = function (element) {
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
