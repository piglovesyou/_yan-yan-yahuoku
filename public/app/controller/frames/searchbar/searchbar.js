
goog.provide('app.controller.Searchbar');

goog.require('app.controller.searchbar.Switch');
goog.require('app.controller.Category');
goog.require('app.controller.QueryInput');
goog.require('goog.ui.Button');
goog.require('app.ui.ButtonRenderer');
goog.require('goog.ui.Component');
goog.require('goog.string');
goog.require('app.controller.searchbar.Label');


/**
 * @constructor
 * @extends {goog.ui.Component}
 */
app.controller.Searchbar = function (opt_domHelper) {
  goog.base(this, opt_domHelper);
  var dh = this.getDomHelper();

  this.switch_ = new app.controller.searchbar.Switch(dh);
  this.addChild(this.switch_);

  this.categorySuggest_ = new app.controller.Category(dh);
  this.addChild(this.categorySuggest_);

  this.queryInput_ = new app.controller.QueryInput(dh);
  this.addChild(this.queryInput_);
  
  this.label_ = new app.controller.searchbar.Label(dh);
  this.addChild(this.label_);

  this.button_ = new goog.ui.Button('検索', 
      goog.ui.ButtonRenderer.getInstance(), dh);
  this.button_.addClassName('btn');
  this.addChild(this.button_);
}
goog.inherits(app.controller.Searchbar, goog.ui.Component);


app.controller.Searchbar.EventType = {
  SEARCH: 'search'
};


app.controller.Searchbar.prototype.enterDocument = function () {
  goog.base(this, 'enterDocument');
  this.getHandler()
    .listen(this, goog.ui.Component.EventType.ACTION, function(e) {
      // XXX: e.preventDefault() causes goog.structs.Pool error
      // XXX: .. fixed?
      this.dispatchEvent(app.controller.Searchbar.EventType.SEARCH);
    });
};


app.controller.Searchbar.prototype.formElement_;

  
app.controller.Searchbar.prototype.getQuery = function () {
  return this.queryInput_.getValue();
};


/**
 * TODO: Delete this method. Just let label listens.
 */
app.controller.Searchbar.prototype.updateLabel = function (total, query, category) {
  this.label_.updateContent(total, query, category);
};


app.controller.Searchbar.prototype.createDom = function () {
  var dh = this.getDomHelper();

  // Prepare to append
  this.switch_.createDom();
  this.categorySuggest_.createDom();
  this.queryInput_.createDom();
  this.label_.createDom();
  this.button_.createDom();

  var element = dh.createDom('div', 'searchbar',
      this.formElement_ =
        dh.createDom('form', {
            className: 'form-inline',
            onsubmit: function () {return false}
          },
          this.switch_.getElement(),
          dh.createTextNode('\n'),
          this.queryInput_.getElement(),
          dh.createTextNode('\n'),
          this.categorySuggest_.getElement(),
          dh.createTextNode('\n'),
          this.button_.getElement(),
          dh.createTextNode('\n'),
          this.label_.getElement()
        ));
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
