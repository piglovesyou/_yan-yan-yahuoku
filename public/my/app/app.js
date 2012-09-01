
goog.provide('my.App');

goog.require('goog.ui.Component');
goog.require('goog.events.EventType');
goog.require('my.ui.ThousandRows');

goog.require('my.ds.Xhr');
goog.require('my.dom.ViewportSizeMonitor');


/**
 * @param {goog.dom.DomHelper=} opt_domHelper
 * @constructor
 * @extends {goog.ui.Component}
 */
my.App = function (opt_domHelper) {
  goog.base(this, opt_domHelper);
};
goog.inherits(my.App, goog.ui.Component);

/** @inheritDoc */
my.App.prototype.enterDocument = function () {
  goog.base(this, 'enterDocument');
  var vsm = my.dom.ViewportSizeMonitor.getInstance()
  this.getHandler()
    .listen(vsm, goog.events.EventType.RESIZE, function (e) {
      this.resetLayoutSize_(e.target.getSize());
      this.thousandRows_.update();
    });
  this.resetLayoutSize_(vsm.getSize());

};

my.App.prototype.resetLayoutSize_ = function (size) {
  goog.style.setHeight(this.containerElement_,
      size.height - this.toolbarHeight_);
};

/**
 * @type {?goog.ui.ThousandRows}
 */
my.App.prototype.thousandRows_;

/** @inheritDoc */
my.App.prototype.decorateInternal = function (element) {
  this.initializeSize_();

  this.thousandRows_ = new my.ui.ThousandRows(160, 50);
  var model = new my.ui.ThousandRows.Model(
                  this.thousandRows_.baseName + this.thousandRows_.getId(),
                  '/api/search?query=ベアブリック+23', 10000, true);
  this.thousandRows_.setModel(model);
  this.thousandRows_.decorate(this.containerElement_);
};

/**
 * @type {?number}
 */
my.App.prototype.toolbarHeight_;
my.App.prototype.initializeSize_ = function () {
  this.toolbarHeight_ = this.toolbarElement_.offsetHeight;
};

/** @inheritDoc */
my.App.prototype.canDecorate = function (element) {
  if (element) {
    var dh = this.getDomHelper();
    var toolbar = dh.getElementByClass('toolbar', element);
    var container = dh.getElementByClass('container', element);
    if (toolbar && container) {
      this.toolbarElement_ = toolbar;
      this.containerElement_ = container;
      this.setElementInternal(element);
      return true;
    }
  }
  return false;
};
