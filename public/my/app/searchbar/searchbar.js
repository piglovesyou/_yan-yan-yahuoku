
goog.provide('my.app.Searchbar');

goog.require('my.app.searchbar.Category');
goog.require('my.app.searchbar.QueryInput');
goog.require('goog.ui.Button');
goog.require('my.ui.ButtonRenderer');
goog.require('goog.ui.Component');
goog.require('goog.string');


/**
 * @constructor
 * @extends {goog.ui.Component}
 */
my.app.Searchbar = function (opt_domHelper) {
  goog.base(this, opt_domHelper);
  var dh = this.getDomHelper();

  this.categorySuggest_ = new my.app.searchbar.Category(dh);
  this.addChild(this.categorySuggest_);

  this.queryInput_ = new my.app.searchbar.QueryInput(dh);
  this.addChild(this.queryInput_);
  
  this.button_ = new goog.ui.Button('search', 
      my.ui.NativeButtonRenderer.getInstance(), dh);
}
goog.inherits(my.app.Searchbar, goog.ui.Component);


my.app.Searchbar.EventType = {
  SEARCH: 'search'
};


my.app.Searchbar.prototype.enterDocument = function () {
  goog.base(this, 'enterDocument');
  this.getHandler()
    .listen(this.formElement_, goog.events.EventType.SUBMIT, function (e) {
      this.dispatchEvent(my.app.Searchbar.EventType.SEARCH);
      e.preventDefault();
    });
};


my.app.Searchbar.prototype.formElement_;


my.app.Searchbar.prototype.getQuery = function () {
  return this.queryInput_.getValue();
};


my.app.Searchbar.prototype.createDom = function () {
  var dh = this.getDomHelper();

  // Prepare to append
  this.categorySuggest_.createDom();
  this.queryInput_.createDom();
  this.button_.createDom();

  var element = dh.createDom('div', 'searchbar',
      this.formElement_ =
        dh.createDom('form', {
            className: 'form-inline',
            action: ''
          },
          this.queryInput_.getElement(),
          dh.createTextNode('\n'),
          this.categorySuggest_.getElement(),
          dh.createTextNode('\n'),
          this.button_.getElement()));
  this.setElementInternal(element);
};

my.app.Searchbar.prototype.disposeInternal = function () {
  if (this.suggest_) {
    this.suggest_.dispose();
    this.suggest_ = null;
  }
  goog.base(this, 'disposeInternal');
};
