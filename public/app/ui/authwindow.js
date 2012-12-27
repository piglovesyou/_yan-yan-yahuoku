
goog.provide('app.ui.common.AuthWindow');
goog.provide('app.ui.common.authwindow');

goog.require('goog.events.EventTarget');
goog.require('goog.window');



/**
 * @constructor
 * @extends {goog.events.EventTarget}
 */
app.ui.common.AuthWindow = function() {
  goog.base(this);
};
goog.inherits(app.ui.common.AuthWindow, goog.events.EventTarget);
goog.addSingletonGetter(app.ui.common.AuthWindow);


/**
 * @enum {string}
 */
app.ui.common.AuthWindow.EventType = {
  AUTHORIZED: 'authorized',
  UNAUTHORIZED: 'unauthorized'
};


/**
 * @const
 */
app.ui.common.AuthWindow.Options = {
  'target': goog.window.DEFAULT_POPUP_TARGET,
  'width': goog.window.DEFAULT_POPUP_WIDTH,
  'height': goog.window.DEFAULT_POPUP_HEIGHT,
  'top': 140,
  'left': 500,
  'toolbar': false,
  'location': false,
  'statusbar': false,
  'menubar': false,
  'resizable': false
};


/**
 * @type {Window}
 */
app.ui.common.AuthWindow.prototype.window_;


/**
 */
app.ui.common.AuthWindow.prototype.launch = function() {
  this.window_ = goog.window.open('/auth/login',
                                  app.ui.common.AuthWindow.Options, window);
};


/**
 */
app.ui.common.AuthWindow.prototype.closeWindow = function() {
  goog.asserts.assert(this.window_, 'Why you don\'t have one?');
  this.window_.close();
};


/*
 * Methods below can be only called from auth window.
 */

/**
 */
app.ui.common.AuthWindow.prototype.dispatchAuthCompolete = function() {
  goog.asserts.assert(this.window_,
      '\'dispatchAuthCompolete\' should be called by a popup window.');
  this.dispatchEvent(app.ui.common.AuthWindow.EventType.AUTHORIZED);
};


/**
 * This should be called only in a popup window.
 */
app.ui.common.authwindow.authCompolete = function() {
  var win = app.ui.common.AuthWindow.getInstance();
  win.closeWindow();
  win.dispatchAuthCompolete();
};
goog.exportSymbol('app.ui.common.authwindow.dispatchAuthCompolete');
