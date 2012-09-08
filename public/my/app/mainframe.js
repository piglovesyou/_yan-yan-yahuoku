
goog.provide('my.app.MainFrame');

goog.require('my.app.Frame');


/**
 * @constructor
 * @extends {goog.ui.Component}
 */
my.app.MainFrame = function (firstFrameId, opt_domHelper) {
  goog.base(this, opt_domHelper);
  this.currSelectedFrame_ = this.createFrame(firstFrameId, false);
}
goog.inherits(my.app.MainFrame, goog.ui.Component);


my.app.MainFrame.prototype.renderFrame = function (id) {
  var frame = this.getChild(id);
  if (frame && !frame.isInDocument()) {
    frame.render(this.getContentElement());
  }
};


/**
 * @param {string} id
 */
my.app.MainFrame.prototype.selectFrame = function (id) {
  this.currSelectedFrame_.exitDocument();
  goog.dom.classes.enable(this.currSelectedFrame_.getElement(), 'selected', false);
  var frame = this.getChild(id);
  if (!frame) {
    var frame = this.createFrame(id);
    frame.render(this.getContentElement());
  } else {
    goog.dom.classes.enable(frame.getElement(), 'selected', true);
    frame.enterDocument();
  }
  this.currSelectedFrame_ = frame;
};


my.app.MainFrame.prototype.currSelectedFrame_;


my.app.MainFrame.prototype.getCurrSelectedFrame = function () {
  return this.currSelectedFrame_;
};


/**
 * @param {string} id Tab id the frame belonging to.
 * @param {boolean} render
 */
my.app.MainFrame.prototype.createFrame = function (id, render) {
  frame = new my.app.Frame(this.getDomHelper());
  frame.setId(id);
  this.addChild(frame, render);
  return frame;
};


my.app.MainFrame.prototype.decorateInternal = function (element) {
  goog.base(this, 'decorateInternal', element);
  var dh = this.getDomHelper();
  
  var frame = this.getChildAt(0);
  goog.asserts.assert(frame);
  frame.decorate(this.firstFrameElement_);
  goog.asserts.assert(goog.dom.classes.has(this.firstFrameElement_, 'selected'));
};


my.app.MainFrame.prototype.canDecorate = function (element) {
  if (element) {
    var dh = this.getDomHelper();
    var firstFrame = dh.getElementByClass('frame', element);
    if (firstFrame) {
      this.firstFrameElement_ = firstFrame;
      return true;
    }
  }
  return false;
};
