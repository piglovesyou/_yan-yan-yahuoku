
goog.provide('app.ui.AuthWindow');

goog.require('goog.events.EventTarget');



/**
 * @constructor
 * @extends {goog.events.EventTarget}
 */
app.ui.AuthWindow = function () {
  goog.base(this);
};
goog.inherits(app.ui.AuthWindow, goog.events.EventTarget);
goog.addSingletonGetter(app.ui.AuthWindow);


app.ui.AuthWindow.prototype.window_;


app.ui.AuthWindow.prototype.launch = function () {
  goog.window.popup('http://www.google.com');
};
