
goog.provide('my.app.searchbar.CategorySuggest');

goog.require('goog.ui.Component');
goog.require('my.ui.Suggest');




/**
 * @constructor
 * @extends {goog.ui.Component}
 */
my.app.searchbar.CategorySuggest = function (opt_domHelper) {
  goog.base(this, opt_domHelper);
}
goog.inherits(my.app.searchbar.CategorySuggest, goog.ui.Component);


/**
 * @type {my.ui.Suggest}
 */
my.app.searchbar.CategorySuggest.prototype.suggest_;


/**
 * @type {Element}
 */
my.app.searchbar.CategorySuggest.prototype.inputElement_;


/** @inheritDoc */
my.app.searchbar.CategorySuggest.prototype.enterDocument = function () {
  goog.base(this, 'enterDocument');
  this.suggest_ = new my.ui.Suggest('/api/categorySuggest', 
      this.inputElement_, this.getDomHelper());
  console.log(this.suggest_);
};


/** @inheritDoc */
my.app.searchbar.CategorySuggest.prototype.createDom = function () {
  var dh = this.getDomHelper();
  var element = 
      dh.createDom('div', 'span4',
        this.inputElement_ = 
          dh.createDom('input', {
            type:'text',
            placeholder: 'Category search...'
          }));
  this.setElementInternal(element);
};
