
goog.provide('app.events.EventCenter');

goog.require('goog.events.EventTarget');


/**
 * @constructor
 * @extends {goog.events.EventTarget}
 */
app.events.EventCenter = function() {
  goog.base(this);

  this.eh_ = new goog.events.EventHandler(this);
  this.eh_.listen(goog.dom.getDocument().body,
                  goog.events.EventType.TRANSITIONEND,
                  this.handleTransitionEnd_);
};
goog.inherits(app.events.EventCenter, goog.events.EventTarget);
goog.addSingletonGetter(app.events.EventCenter);


/**
 * @enum {string}
 */
app.events.EventCenter.EventType = {
  TAB_SORTED: 'tabsorted',
  TAB_CHANGED: 'tabchanged',
  TRANSITIONEND: 'transitionend'
};


/**
 * @param {goog.events.BrowserEvent} e .
 * @private
 */
app.events.EventCenter.prototype.handleTransitionEnd_ = function(e) {
  this.dispatchEvent(e);
};


/**
 * @param {string} type .
 * @param {Object} data .
 */
app.events.EventCenter.prototype.dispatch = function(type, data) {
  this.dispatchEvent({
    type: type,
    data: data
  });
};


/** @inheritDoc */
app.events.EventCenter.prototype.disposeInternal = function() {
  if (this.eh_) {
    this.eh_.dispose();
    this.eh_ = null;
  }
  goog.base(this, 'disposeInternal');
};



