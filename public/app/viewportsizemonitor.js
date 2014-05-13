
goog.provide('app.ViewportSizeMonitor');
goog.provide('app.ViewportSizeMonitor.EventType');

goog.require('goog.Timer');
goog.require('goog.dom.ViewportSizeMonitor');
goog.require('goog.events.EventHandler');
goog.require('goog.events.EventType');


/**
 * @constructor
 * @extends {goog.dom.ViewportSizeMonitor}
 */
app.ViewportSizeMonitor = function() {
  goog.base(this, window);

  /**
   * @private
   * @type {goog.events.EventHandler}
   */
  this.eh_ = new goog.events.EventHandler(this);

  /**
   * @private
   * @type {goog.Timer}
   */
  this.timer_ = new goog.Timer(100);

  this.eh_
      .listen(this.timer_, goog.Timer.TICK, this.handleResizeTimerTick_)
      .listen(this, goog.events.EventType.RESIZE, this.handleViewportResize_);
};
goog.inherits(app.ViewportSizeMonitor, goog.dom.ViewportSizeMonitor);
goog.addSingletonGetter(app.ViewportSizeMonitor);


/**
 * @enum {string}
 */
app.ViewportSizeMonitor.EventType = {
  DELAYED_RESIZE: 'delayedreisze'
};


/**
 * @private
 * @param {goog.events.Event} e An event provided by ViewportSizeMonitor.
 */
app.ViewportSizeMonitor.prototype.handleViewportResize_ = function(e) {
  if (this.timer_.enabled) {
    this.timer_.stop();
  }
  this.timer_.start();
};


/**
 * @private
 * @param {goog.events.Event} e A tick event.
 */
app.ViewportSizeMonitor.prototype.handleResizeTimerTick_ = function(e) {
  this.timer_.stop();
  this.dispatchEvent(app.ViewportSizeMonitor.EventType.DELAYED_RESIZE);
};


/** @inheritDoc */
app.ViewportSizeMonitor.prototype.disposeInternal = function() {
  if (this.eh_) {
    this.eh_.dispose();
    this.eh_ = null;
  }
  if (this.timer_) {
    this.timer_.dispose();
    this.timer_ = null;
  }
  goog.base(this, 'disposeInternal');
};
