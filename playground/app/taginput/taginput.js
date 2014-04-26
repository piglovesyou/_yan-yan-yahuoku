
goog.provide('app.TagInput');

goog.require('goog.ui.Component');
goog.require('app.taginput.Positioning');



/**
 * @constructor
 * @param {goog.dom.DomHelper=} opt_domHelper .
 * @extends {goog.ui.Component}
 */
app.TagInput = function(opt_domHelper) {
  goog.base(this, opt_domHelper);
};
goog.inherits(app.TagInput, goog.ui.Component);


/** @inheritDoc */
app.TagInput.prototype.createDom = function() {
  goog.base(this, 'createDom');
};


/** @inheritDoc */
app.TagInput.prototype.decorateInternal = function(element) {
  goog.base(this, 'decorateInternal', element);
};


/** @inheritDoc */
app.TagInput.prototype.canDecorate = function(element) {
  if (element) {
    return true;
  }
  return false;
};


/** @inheritDoc */
app.TagInput.prototype.enterDocument = function() {
  app.taginput.Positioning.getInstance().monitor(this.getElementByClass('header-input-leftcontent'));
  goog.base(this, 'enterDocument');
};


/** @inheritDoc */
app.TagInput.prototype.disposeInternal = function() {
  goog.base(this, 'disposeInternal');
};
