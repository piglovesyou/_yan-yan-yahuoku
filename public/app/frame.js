goog.provide('app.Frame');

goog.require('goog.ui.Component');



/**
 * @constructor
 * @param {string} id .
 * @param {goog.dom.DomHelper=} opt_domHelper .
 * @extends {goog.ui.Component}
 */
app.Frame = function(id, opt_domHelper) {
  goog.base(this, opt_domHelper);

  this.id = id;
};
goog.inherits(app.Frame, goog.ui.Component);


/** @inheritDoc */
app.Frame.prototype.createDom = function() {
  goog.base(this, 'createDom');
};


/** @inheritDoc */
app.Frame.prototype.decorateInternal = function(element) {
  goog.base(this, 'decorateInternal', element);
};


/** @inheritDoc */
app.Frame.prototype.canDecorate = function(element) {
  if (element) {
    return true;
  }
  return false;
};


/** @inheritDoc */
app.Frame.prototype.enterDocument = function() {
  goog.base(this, 'enterDocument');
};


/** @inheritDoc */
app.Frame.prototype.disposeInternal = function() {
  goog.base(this, 'disposeInternal');
};
