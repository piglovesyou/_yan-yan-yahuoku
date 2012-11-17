
goog.provide('app.ui.Username');

goog.require('goog.asserts');
goog.require('goog.ui.Component');


/**
 * @param {goog.dom.DomHelper=} opt_domHelper A dom helper.
 * @constructor
 * @extends {goog.ui.Component}
 */
app.ui.Username = function(opt_domHelper) {
  goog.base(this, opt_domHelper);
};
goog.inherits(app.ui.Username, goog.ui.Component);


/** @inheritDoc */
app.ui.Username.prototype.enterDocument = function() {
  goog.base(this, 'enterDocument');
  this.getHandler()
    .listen(this.getElement(), goog.events.EventType.CLICK, this.handleClick_)
    .listen(app.ui.common.AuthWindow.getInstance(),
            app.ui.common.AuthWindow.EventType.AUTH_COMPLETE,
            this.handleAuthComplete_);
};


/**
 * @private
 * @param {goog.events.Event} e A click event.
 */
app.ui.Username.prototype.handleClick_ = function(e) {
  app.ui.common.AuthWindow.getInstance().launch();
};


/**
 * @private
 * @param {goog.events.Event} e Dispatched by AuthWindow.
 */
app.ui.Username.prototype.handleAuthComplete_ = function(e) {
  // console.log(e.type);
};
