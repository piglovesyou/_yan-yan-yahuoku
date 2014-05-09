
goog.provide('app.SplitPane');
goog.require('goog.ui.SplitPane');



/**
 * @param {goog.ui.Component} firstComponent Left or Top component.
 * @param {goog.ui.Component} secondComponent Right or Bottom component.
 * @param {goog.ui.SplitPane.Orientation} orientation SplitPane orientation.
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper.
 * @extends {goog.ui.Component}
 * @constructor
 */
app.SplitPane = function(firstComponent, secondComponent, orientation,
    opt_domHelper) {
  goog.base(this, firstComponent, secondComponent, orientation,
    opt_domHelper);
};
goog.inherits(app.SplitPane, goog.ui.SplitPane);

