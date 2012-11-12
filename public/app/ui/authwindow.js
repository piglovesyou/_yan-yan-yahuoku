
goog.provide('app.ui.common.AuthWindow');

goog.require('goog.events.EventTarget');



/**
 * @constructor
 * @extends {goog.events.EventTarget}
 */
app.ui.common.AuthWindow = function() {
  goog.base(this);
};
goog.inherits(app.ui.common.AuthWindow, goog.events.EventTarget);
goog.addSingletonGetter(app.ui.common.AuthWindow);


app.ui.common.AuthWindow.prototype.window_;


app.ui.common.AuthWindow.prototype.launch = function() {
  goog.window.popup('http://www.google.com');
};
