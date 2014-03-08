
goog.provide('app.ui.List');

goog.require('goog.ui.List');


/**
 * @constructor
 * @param {Function|function(new:goog.ui.List.Item,
 *         number, number, Function=, goog.dom.DomHelper=)} rowRenderer
 * @param {number=} opt_rowCountPerPage .
 * @param {goog.dom.DomHelper=} opt_domHelper .
 * @extends {goog.ui.Component}
 */
app.ui.List = function(rowRenderer, opt_rowCountPerPage, opt_domHelper) {
  goog.base(this, rowRenderer, opt_rowCountPerPage, opt_domHelper);
};
goog.inherits(app.ui.List, goog.ui.List);


