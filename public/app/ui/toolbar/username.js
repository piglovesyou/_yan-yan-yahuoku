
goog.provide('app.ui.Username');

goog.require('goog.asserts');
goog.require('goog.ui.Component');
goog.require('goog.ui.Tooltip');


/**
 * @param {goog.dom.DomHelper=} opt_domHelper A dom helper.
 * @constructor
 * @extends {goog.ui.Component}
 */
app.ui.Username = function(opt_domHelper) {
  goog.base(this, opt_domHelper);
};
goog.inherits(app.ui.Username, goog.ui.Component);


/** @type {Element} */
app.ui.Username.prototype.contentElement_;


/**
 * @type {goog.ui.Tooltip}
 */
app.ui.Username.prototype.tooltip_;


/** @inheritDoc */
app.ui.Username.prototype.getContentElement = function() {
  return this.contentElement_;
};


/** @inheritDoc */
app.ui.Username.prototype.decorateInternal = function(element) {
  goog.base(this, 'decorateInternal', element);
};


/** @inheritDoc */
app.ui.Username.prototype.canDecorate = function(element) {
  if (element) {
    var content = goog.dom.getElementByClass('username-content');
    if (content) {
      this.contentElement_ = content;
      return true;
    }
  }
  return false;
};


/** @inheritDoc */
app.ui.Username.prototype.enterDocument = function() {
  goog.base(this, 'enterDocument');
  this.getHandler()
    .listen(this.getElement(), goog.events.EventType.CLICK, this.handleClick_)
    .listen(app.model, app.events.EventType.AUTH_STATE_CHANGED,
            this.handleAuthComplete_);
};


/**
 * @private
 * @param {goog.events.Event} e A click event.
 */
app.ui.Username.prototype.handleClick_ = function(e) {
  if (app.model.isAuthed()) {
    // TODO: I want goog.ui.Prompt before replacing url.
    window.location.href = '/auth/logout';
  } else {
    app.ui.common.AuthWindow.getInstance().launch(true);
  }
};


/**
 * @private
 * @param {goog.events.Event} e Dispatched by AuthWindow.
 */
app.ui.Username.prototype.handleAuthComplete_ = function(e) {
  this.updateContent_();
};


/**
 * @private
 */
app.ui.Username.prototype.updateContent_ = function() {
  this.getDomHelper().setTextContent(
      this.getContentElement(),
        app.model.isAuthed() ? '認証解除' : '認証');
  if (!this.tooltip_) {
    this.tooltip_ = new goog.ui.Tooltip(this.getElement(),
                                        null, this.getDomHelper());
    this.tooltip_.className += ' label';
  }
  this.tooltip_.setText(app.model.isAuthed() ?
      'ヤフーオークションとの認証とタブの状態の情報を消去します' :
      'このページから商品をウォッチリストに追加することができます');
};


/** @inheritDoc */
app.ui.Username.prototype.disposeInternal = function() {
  if (this.tooltip_) {
    this.tooltip_.dispose();
    this.tooltip_ = null;
  }
  goog.base(this, 'disposeInternal');
};
