
goog.provide('my.app.Searchbar');

goog.require('goog.ui.Component');


/**
 * @constructor
 * @extends {goog.ui.Component}
 */
my.app.Searchbar = function (opt_domHelper) {
  goog.base(this, opt_domHelper);
}
goog.inherits(my.app.Searchbar, goog.ui.Component);


my.app.Searchbar.prototype.createDom = function () {
  var dh = this.getDomHelper();
  var element = dh.createDom('div', 'searchbar',
      dh.createDom('div', 'textsearch',
        dh.createDom('input', {
          type:'text',
          placeholder: 'Search by text...'
        })),
      dh.createDom('div', 'categorysearch',
        dh.createDom('input', {
          type:'text',
          placeholder: 'Category search...'
        })));
  this.setElementInternal(element);
};
