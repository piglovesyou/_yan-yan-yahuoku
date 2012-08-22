
goog.provide('my.dom.ViewportSizeMonitor');

goog.require('goog.dom.ViewportSizeMonitor');


/**
 * @constructor
 * @extends {goog.dom.ViewportSizeMonitor}
 */
my.dom.ViewportSizeMonitor = function () {
  goog.base(this, window);
};
goog.inherits(my.dom.ViewportSizeMonitor, goog.dom.ViewportSizeMonitor);
goog.addSingletonGetter(my.dom.ViewportSizeMonitor);

