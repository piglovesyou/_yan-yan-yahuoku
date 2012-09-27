
goog.provide('app.controller.Searchbar');

goog.require('app.controller.Category');
goog.require('app.controller.QueryInput');
goog.require('goog.ui.Button');
goog.require('app.ui.ButtonRenderer');
goog.require('goog.ui.Component');
goog.require('goog.string');


/**
 * @constructor
 * @extends {goog.ui.Component}
 */
app.controller.Searchbar = function (opt_domHelper) {
  goog.base(this, opt_domHelper);
  var dh = this.getDomHelper();

  this.categorySuggest_ = new app.controller.Category(dh);
  this.addChild(this.categorySuggest_);

  this.queryInput_ = new app.controller.QueryInput(dh);
  this.addChild(this.queryInput_);
  
  this.button_ = new goog.ui.Button('search', 
      app.ui.NativeButtonRenderer.getInstance(), dh);
}
goog.inherits(app.controller.Searchbar, goog.ui.Component);


app.controller.Searchbar.EventType = {
  SEARCH: 'search'
};


app.controller.Searchbar.prototype.enterDocument = function () {
  goog.base(this, 'enterDocument');
  this.getHandler()
    .listen(this.formElement_, goog.events.EventType.SUBMIT, this.handleSubmit_);
};


app.controller.Searchbar.prototype.formElement_;


app.controller.Searchbar.prototype.handleSubmit_ = function (e) {
  this.dispatchEvent(app.controller.Searchbar.EventType.SEARCH);
  e.preventDefault();
  return false;
};

  
app.controller.Searchbar.prototype.getQuery = function () {
  return this.queryInput_.getValue();
};


app.controller.Searchbar.prototype.createDom = function () {
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

app.controller.Searchbar.prototype.disposeInternal = function () {
  if (this.categorySuggest_) {
    this.categorySuggest_.dispose();
    this.categorySuggest_ = null;
  }
  if (this.queryInput_) {
    this.queryInput_.dispose();
    this.queryInput_ = null;
  }
  if (this.button_) {
    this.button_.dispose();
    this.button_ = null;
  }
  goog.base(this, 'disposeInternal');
};
