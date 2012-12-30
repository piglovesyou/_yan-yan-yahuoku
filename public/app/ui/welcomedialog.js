
goog.provide('app.ui.WelcomeDialog');

goog.require('app.ui.TabPane');
goog.require('app.ui.common.Dialog');


/**
 * @param {goog.dom.DomHelper=} opt_domHelper .
 * @constructor
 * @extends {app.ui.common.Dialog}
 */
app.ui.WelcomeDialog = function(opt_domHelper) {
  goog.base(this, opt_domHelper);
  this.setModal(false);
  this.setButtonSet(null);

  /**
   * @type {app.ui.TabPane}
   * @private
   */
  this.tabPane_ = new app.ui.TabPane(opt_domHelper);
};
goog.inherits(app.ui.WelcomeDialog, app.ui.common.Dialog);


/** */
app.ui.WelcomeDialog.prototype.show = function() {
  this.showWithRemoteContent('/about');
};


/** @inheritDoc */
app.ui.WelcomeDialog.prototype.decorateLoadedContent = function() {
  var dh = this.getDomHelper();

  var content = this.getContentElement();
  this.tabPane_.decorate(content);

  dh.append(this.getTitleElement(), dh.getElementByClass('nav-tabs', content));

  // goog.style.setHeight(content, content.offsetHeight);
};


/** @inheritDoc */
app.ui.WelcomeDialog.prototype.createDom = function() {
  goog.base(this, 'createDom');
  goog.dom.classes.add(this.getElement(), 'modal-welcome');
};


/** @inheritDoc */
app.ui.WelcomeDialog.prototype.disposeInternal = function() {
  if (this.tabPane_) {
    this.tabPane_.dispose();
    this.tabPane_ = null;
  }
  goog.base(this, 'disposeInternal');
};
