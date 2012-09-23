
goog.provide('my.app.Searchbar');

goog.require('my.app.searchbar.CategorySuggest');
goog.require('goog.ui.Component');
goog.require('my.ui.Suggest');


/**
 * @constructor
 * @extends {goog.ui.Component}
 */
my.app.Searchbar = function (opt_domHelper) {
  goog.base(this, opt_domHelper);
  var dh = this.getDomHelper();

  this.categorySuggest_ = new my.app.searchbar.CategorySuggest(dh);
  this.addChild(this.categorySuggest_);
}
goog.inherits(my.app.Searchbar, goog.ui.Component);


my.app.Searchbar.prototype.enterDocument = function () {
  goog.base(this, 'enterDocument');
};


my.app.Searchbar.prototype.createDom = function () {
  var dh = this.getDomHelper();

  this.categorySuggest_.createDom();

  var element = dh.createDom('div', 'searchbar row',
      dh.createDom('div', 'span4',
        dh.createDom('input', {
          type:'text',
          placeholder: 'Search by text...'
        })),
      this.categorySuggest_.getElement());
  this.setElementInternal(element);
};

my.app.Searchbar.prototype.disposeInternal = function () {
  if (this.suggest_) {
    this.suggest_.dispose();
    this.suggest_ = null;
  }
  goog.base(this, 'disposeInternal');
};
