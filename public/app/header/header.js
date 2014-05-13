
goog.provide('app.Header');

goog.require('goog.ui.Component');



/**
 * @constructor
 * @param {goog.dom.DomHelper=} opt_domHelper .
 * @extends {goog.ui.Component}
 */
app.Header = function(opt_domHelper) {
  goog.base(this, opt_domHelper);
};
goog.inherits(app.Header, goog.ui.Component);


/** @inheritDoc */
app.Header.prototype.createDom = function() {
  goog.base(this, 'createDom');
};


/** @inheritDoc */
app.Header.prototype.decorateInternal = function(element) {
  goog.base(this, 'decorateInternal', element);
};


/** @inheritDoc */
app.Header.prototype.canDecorate = function(element) {
  if (element && goog.dom.classes.has(element, 'header')) {
    this.tabsEl = goog.dom.getElementByClass('header-tabs', element);
    return this.tabsEl;
  }
  return false;
};


/** @inheritDoc */
app.Header.prototype.enterDocument = function() {
  goog.base(this, 'enterDocument');
};


/** @inheritDoc */
app.Header.prototype.disposeInternal = function() {
  goog.base(this, 'disposeInternal');
};
