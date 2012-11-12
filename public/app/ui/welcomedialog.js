
goog.provide('app.ui.WelcomeDialog');

goog.require('app.ui.common.Dialog');
goog.require('app.ui.common.TabPane');


/**
 * @constructor
 * @extends {app.ui.common.Dialog}
 */
app.ui.WelcomeDialog = function (opt_domHelper) {
  goog.base(this, opt_domHelper);
  this.setModel(false);

  /**
   * @type {app.ui.common.TabPane}
   */
  this.tabPane_ = new app.ui.common.TabPane(opt_domHelper);
};
goog.inherits(app.ui.WelcomeDialog, app.ui.common.Dialog);


app.ui.WelcomeDialog.prototype.launch = function () {
  goog.base(this, 'launch', '/about');
};


app.ui.WelcomeDialog.prototype.decorateLoadedContent_ = function () {
  var dh = this.getDomHelper();

  var content = this.getContentElement()
  this.tabPane_.decorate(content);

  dh.append(this.getTitleElement(), dh.getElementByClass('nav-tabs', content));

  // goog.style.setHeight(content, content.offsetHeight);
};

app.ui.WelcomeDialog.prototype.disposeInternal = function () {
  if (this.tabPane_) {
    this.tabPane_.dispose();
    this.tabPane_ = null;
  }
  goog.base(this, 'disposeInternal');
};
