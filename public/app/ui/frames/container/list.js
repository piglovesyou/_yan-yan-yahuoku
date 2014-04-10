
goog.provide('app.ui.List');

goog.require('app.soy.row');
goog.require('goog.soy');
goog.require('goog.ui.List');


/**
 * @constructor
 * @extends {goog.ui.Component}
 */
app.ui.List = function() {
  goog.base(this, app.ui.List.Item);
};
goog.inherits(app.ui.List, goog.ui.List);

/**
 * @constructor
 * @extends {goog.ui.List.Item}
 * @param {Number} index .
 * @param {Number} height .
 */
app.ui.List.Item = function(index, height) {
  goog.base(this, index, height, app.soy.row.renderContent);
};
goog.inherits(app.ui.List.Item, goog.ui.List.Item);

/** @inheritDoc */
app.ui.List.Item.prototype.createDom = function() {
  this.setElementInternal(goog.soy.renderAsFragment(app.soy.row.createDom));
};
