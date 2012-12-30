
goog.provide('app.ui.common.Dialog');

goog.require('goog.ui.Dialog');



/**
 * @param {goog.dom.DomHelper=} opt_domHelper .
 * @constructor
 * @extends {goog.ui.Dialog}
 */
app.ui.common.Dialog = function(opt_domHelper) {
  goog.base(this, 'modal', false, opt_domHelper);
  // this.setBackgroundElementOpacity(.15);
};
goog.inherits(app.ui.common.Dialog, goog.ui.Dialog);


/**
 * @type {?Function}
 * @protected
 */
app.ui.common.Dialog.prototype.decorateLoadedContent;


/**
 * @param {string} url .
 */
app.ui.common.Dialog.prototype.showWithRemoteContent = function(url) {
  if (!this.wasContentLoaded_) {
    app.model.getRemoteHtml(url, this.handleHtmlLoad_, this);
    this.setContent('Loading..');
  }
  this.setVisible(true);
};


/**
 * @type {boolean}
 * @private
 */
app.ui.common.Dialog.prototype.wasContentLoaded_ = false;


/**
 * @param {boolean} err .
 * @param {string} html .
 * @private
 */
app.ui.common.Dialog.prototype.handleHtmlLoad_ = function(err, html) {
  if (err) {
    this.setVisible(false);
    return;
  }
  this.setContent(html);

  var dh = this.getDomHelper();
  dh.append(this.getTitleElement(),
      dh.getElementByClass('modal-content-title', this.getContentElement()));

  if (goog.isFunction(this.decorateLoadedContent)) {
    this.decorateLoadedContent();
  }
  this.reposition();

  this.wasContentLoaded_ = true;
};


/**
 * TODO: We can just override all process in dialog's createDom
 */
app.ui.common.Dialog.prototype.createDom = function() {
  goog.base(this, 'createDom');
  app.ui.common.Dialog.addCssNameForBootstrap(this);
};


/**
 * @param {goog.ui.Dialog} dialog .
 */
app.ui.common.Dialog.addCssNameForBootstrap = function(dialog) {
  var dh = dialog.getDomHelper();
  goog.dom.classes.add(dialog.getTitleElement(),
      goog.getCssName(dialog.getCssClass(), 'header'));
  goog.dom.classes.add(dialog.getContentElement(),
      goog.getCssName(dialog.getCssClass(), 'body'));
  goog.dom.classes.add(dialog.getButtonElement(),
      goog.getCssName(dialog.getCssClass(), 'footer'));
  goog.dom.classes.add(dialog.getTitleCloseElement(), 'close');
  dh.setTextContent(dialog.getTitleCloseElement(), '×');
};
