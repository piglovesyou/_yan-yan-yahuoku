
goog.provide('my.app.Searchbar');

goog.require('goog.ui.Component');


/**
 * @constructor
 * @extends {goog.ui.Component}
 */
my.app.Searchbar = function (opt_domHelper) {
  var u = undefined;
  goog.base(this, u, u, opt_domHelper);
}
goog.inherits(my.app.Searchbar, goog.ui.Component);


my.app.Searchbar.prototype.createDom = function () {
  var dh = this.getDomHelper();
  var element = dh.createDom('div', 'searchbar',
      dh.createDom('div', 'textsearch',
        dh.createDom('input', { })),
      dh.createDom('div', 'categorysearch',
        dh.createDom('input', {})));
  this.setElementInternal(element);
};
