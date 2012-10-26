
goog.provide('app.controller.WelcomeDialog');

goog.require('app.ui.Dialog');
goog.require('app.ui.TabPane');


/**
 * @constructor
 * @extends {app.ui.Dialog}
 */
app.controller.WelcomeDialog = function (opt_domHelper) {
  goog.base(this, opt_domHelper);
  this.setModel(false);

  /**
   * @type {app.ui.TabPane}
   */
  this.tabPane_ = new app.ui.TabPane(opt_domHelper);
};
goog.inherits(app.controller.WelcomeDialog, app.ui.Dialog);


app.controller.WelcomeDialog.prototype.launch = function () {
  goog.base(this, 'launch', '/about');
};


app.controller.WelcomeDialog.prototype.decorateLoadedContent_ = function () {
  var dh = this.getDomHelper();

  var content = this.getContentElement()
  this.tabPane_.decorate(content);

  dh.append(this.getTitleElement(), dh.getElementByClass('nav-tabs', content));

  // goog.style.setHeight(content, content.offsetHeight);
};

app.controller.WelcomeDialog.prototype.disposeInternal = function () {
  if (this.tabPane_) {
    this.tabPane_.dispose();
    this.tabPane_ = null;
  }
  goog.base(this, 'disposeInternal');
};
