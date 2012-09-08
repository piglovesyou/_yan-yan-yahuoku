
goog.provide('my.events.EventCenter');

goog.require('goog.events.EventTarget');


/**
 * @constructor
 * @extends {goog.events.EventTarget}
 */
my.events.EventCenter = function () {
  goog.base(this);
};
goog.inherits(my.events.EventCenter, goog.events.EventTarget);
goog.addSingletonGetter(my.events.EventCenter);

/**
 * @enum {string}
 */
my.events.EventCenter.EventType = {
  TAB_SORTED: 'tabsorted',
  TAB_CHANGED: 'tabchanged'
};


/**
 * @param {string} type
 * @param {Object} data
 */
my.events.EventCenter.prototype.dispatch = function (type, data) {
  this.dispatchEvent({
    type: type,
    data: data
  });
};

