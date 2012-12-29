
goog.provide('app.ui.common.AuthWindow');
goog.provide('app.ui.common.authwindow');

goog.require('app.events.EventType');
goog.require('goog.events.EventTarget');
goog.require('goog.window');



/**
 * @constructor
 * @extends {goog.events.EventTarget}
 */
app.ui.common.AuthWindow = function() {
  goog.base(this);

  /**
   * @type {goog.events.EventHandler}
   * @private
   */
  this.eh_ = new goog.events.EventHandler(this);

  this.eh_.listen(app.model, app.events.EventType.AUTH_STATE_CHANGED,
                  this.handleAuthStateChanged_);
};
goog.inherits(app.ui.common.AuthWindow, goog.events.EventTarget);
goog.addSingletonGetter(app.ui.common.AuthWindow);


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
 * @type {Window} A child popup window.
 */
app.ui.common.AuthWindow.prototype.window_;


/**
 * @param {goog.events.Event} e .
 * @private
 */
app.ui.common.AuthWindow.prototype.handleAuthStateChanged_ = function(e) {
  if (this.window_) {
    this.closePopupWindow_();
  }
};


/**
 * @param {boolean} toLogin .
 */
app.ui.common.AuthWindow.prototype.launch = function(toLogin) {
  this.window_ = goog.window.open(toLogin ? '/auth/login' : '/auth/logout',
                                  app.ui.common.AuthWindow.Options, window);
};


/**
 * @private
 */
app.ui.common.AuthWindow.prototype.closePopupWindow_ = function() {
  goog.asserts.assert(this.window_, 'Why you don\'t have one?');
  this.window_.close();
  this.window_ = null;
};


/**
 */
app.ui.common.AuthWindow.prototype.processAuthCompleted = function() {
  this.closePopupWindow_();
  app.model.updateAuthState(true); // XXX: Always true? Really?
};


/** @inheritDoc */
app.ui.common.AuthWindow.prototype.disposeInternal = function() {
  if (this.eh_) {
    this.eh_.dispose();
    this.eh_ = null;
  }
  goog.base(this, 'disposeInternal');
};
