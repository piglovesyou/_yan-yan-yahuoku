
goog.provide('app.ui.Dialog');

goog.require('goog.ui.Dialog');



/**
 * @constructor
 * @extends {goog.ui.Dialog}
 */
app.ui.Dialog = function (opt_domHelper) {
  goog.base(this, 'modal', false, opt_domHelper);
  this.setButtonSet(null);
};
goog.inherits(app.ui.Dialog, goog.ui.Dialog);


/**
 */
app.ui.Dialog.prototype.decorateLoadedContent_;


/**
 * @param {string} url
 */
app.ui.Dialog.prototype.launch = function (url) {
  if (!this.wasContentLoaded_) {
    app.model.getRemoteHtml(url, this.handleHtmlLoad_, this);
    this.setContent('Loading..')
  }
  this.setVisible(true);
};


app.ui.Dialog.prototype.wasContentLoaded_ = false;


/**
 * @param {boolean} err
 * @param {string} html
 */
app.ui.Dialog.prototype.handleHtmlLoad_ = function (err, html) {
  if (err) {
    this.setVisible(false);
    return;
  }
  this.setContent(html);

  var dh = this.getDomHelper();
  dh.append(this.getTitleElement(),
      dh.getElementByClass('modal-content-title', this.getContentElement()));

  if (goog.isFunction(this.decorateLoadedContent_)) this.decorateLoadedContent_();
  this.wasContentLoaded_ = true;
  this.reposition();
};


/**
 * TODO: We can just override all process in dialog's createDom
 */
app.ui.Dialog.prototype.createDom = function () {
  goog.base(this, 'createDom');
  var dh = this.getDomHelper();
  goog.dom.classes.add(this.getTitleElement(),
      goog.getCssName(this.getCssClass(), 'header'));
  goog.dom.classes.add(this.getContentElement(),
      goog.getCssName(this.getCssClass(), 'body'));
  goog.dom.classes.add(this.getButtonElement(),
      goog.getCssName(this.getCssClass(), 'footer'));
  goog.dom.classes.add(this.getTitleCloseElement(), 'close');
  dh.setTextContent(this.getTitleCloseElement(), '×');
};
