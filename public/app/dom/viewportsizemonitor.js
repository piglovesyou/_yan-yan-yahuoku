
goog.provide('app.dom.ViewportSizeMonitor');

goog.require('goog.dom.ViewportSizeMonitor');


/**
 * @constructor
 * @extends {goog.dom.ViewportSizeMonitor}
 */
app.dom.ViewportSizeMonitor = function () {
  goog.base(this, window);
};
goog.inherits(app.dom.ViewportSizeMonitor, goog.dom.ViewportSizeMonitor);
goog.addSingletonGetter(app.dom.ViewportSizeMonitor);

