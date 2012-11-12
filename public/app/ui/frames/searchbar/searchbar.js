
goog.provide('app.ui.Searchbar');

goog.require('app.ui.searchbar.Switch');
goog.require('app.ui.Category');
goog.require('app.ui.QueryInput');
goog.require('goog.ui.Button');
goog.require('goog.ui.Component');
goog.require('goog.string');
goog.require('app.ui.searchbar.Label');


/**
 * @constructor
 * @extends {goog.ui.Component}
 */
app.ui.Searchbar = function (opt_domHelper) {
  goog.base(this, opt_domHelper);
  var dh = this.getDomHelper();

  this.switch_ = new app.ui.searchbar.Switch(dh);
  this.addChild(this.switch_);

  this.categorySuggest_ = new app.ui.Category(dh);
  this.addChild(this.categorySuggest_);

  this.queryInput_ = new app.ui.QueryInput(dh);
  this.addChild(this.queryInput_);
  
  this.label_ = new app.ui.searchbar.Label(dh);
  this.addChild(this.label_);

  this.button_ = new goog.ui.Button('s', null, dh);
  this.button_.addClassName('btn');
  this.button_.addClassName('i');
  this.addChild(this.button_);
}
goog.inherits(app.ui.Searchbar, goog.ui.Component);


app.ui.Searchbar.EventType = {
  SEARCH: 'search'
};


app.ui.Searchbar.prototype.enterDocument = function () {
  goog.base(this, 'enterDocument');
  this.getHandler()
    .listen(this, goog.ui.Component.EventType.ACTION, function(e) {
      // XXX: e.preventDefault() causes goog.structs.Pool error
      // XXX: .. fixed?
      this.dispatchEvent(app.ui.Searchbar.EventType.SEARCH);
    });
};

  
app.ui.Searchbar.prototype.getQuery = function () {
  return this.queryInput_.getValue();
};


/**
 * TODO: Delete this method. Just let label listens.
 */
app.ui.Searchbar.prototype.updateLabel = function (total, query, category) {
  this.label_.updateContent(total, query, category);
};


app.ui.Searchbar.prototype.createDom = function () {
  var dh = this.getDomHelper();

  // Prepare to append
  this.switch_.createDom();
  this.categorySuggest_.createDom();
  this.queryInput_.createDom();
  this.label_.createDom();
  this.button_.createDom();

  var element = dh.createDom('div', 'searchbar',
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

app.ui.Searchbar.prototype.disposeInternal = function () {
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
