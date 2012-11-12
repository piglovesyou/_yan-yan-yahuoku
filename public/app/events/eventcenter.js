
goog.provide('app.events.EventCenter');

goog.require('goog.events.EventTarget');


/**
 * @constructor
 * @extends {goog.events.EventTarget}
 */
app.events.EventCenter = function() {
  goog.base(this);
};
goog.inherits(app.events.EventCenter, goog.events.EventTarget);
goog.addSingletonGetter(app.events.EventCenter);

/**
 * @enum {string}
 */
app.events.EventCenter.EventType = {
  TAB_SORTED: 'tabsorted',
  TAB_CHANGED: 'tabchanged'
};


/**
 * @param {string} type
 * @param {Object} data
 */
app.events.EventCenter.prototype.dispatch = function(type, data) {
  this.dispatchEvent({
    type: type,
    data: data
  });
};

