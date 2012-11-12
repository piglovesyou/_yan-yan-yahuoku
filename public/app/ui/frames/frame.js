
goog.provide('app.ui.Frame');

goog.require('app.ui.Container');
goog.require('app.ui.Searchbar');


/**
 * @constructor
 * @extends {goog.ui.Component}
 */
app.ui.Frame = function(id, opt_domHelper) {
  goog.base(this, opt_domHelper);
  this.setId(id);

  this.searchbar_ = new app.ui.Searchbar(this.getDomHelper());
  this.addChild(this.searchbar_);
  this.container_ = new app.ui.Container(this.getDomHelper());
  this.addChild(this.container_);


  /**
   * @type {Object}
   */
  this.currCategory_ = app.model.getTabQuery(this.getId())['category'];
};
goog.inherits(app.ui.Frame, goog.ui.Component);


app.ui.Frame.prototype.getContainer = function() {
  return this.container_;
};


app.ui.Frame.prototype.enterDocument = function() {
  goog.base(this, 'enterDocument');
  this.getHandler()
    .listen(this, app.ui.Searchbar.EventType.SEARCH, this.handleSearch_)
    .listen(this, app.ui.category.Suggest.EventType.UPDATE_CATEGORY, this.handleUpdateCategory_);
};


app.ui.Frame.prototype.handleSearch_ = function(e) {
  var searchbar = e.target;
  var query = searchbar.getQuery();
  if (goog.isString(query)) {
    app.model.setTabQuery(this.getId(), {
      'query': query,
      'category': this.currCategory_
    });
    // TODO: listen, don't call here.
    this.container_.refreshByQuery(query, this.currCategory_['CategoryId']);
    this.searchbar_.updateLabel(null, query, this.currCategory_['CategoryName']);
  }
};


app.ui.Frame.prototype.handleUpdateCategory_ = function(e) {
  var category = /** @type {Object} */(e.category);
  if (category) {
    this.currCategory_ = category;
  }
};


app.ui.Frame.prototype.createDom = function() {
  var dh = this.getDomHelper();
  this.searchbar_.createDom();
  this.container_.createDom();
  this.setElementInternal(dh.createDom('div', ['frame', 'selected'],
        this.searchbar_.getElement(),
        this.container_.getElement()));
};


app.ui.Frame.prototype.decorateInternal = function(element) {
  goog.base(this, 'decorateInternal', element);
  this.container_.decorateInternal(this.containerElement_);
};


app.ui.Frame.prototype.canDecorate = function(element) {
  if (element) {
    var dh = this.getDomHelper();
    var searchbar = dh.getElementByClass('searchbar', element);
    var container = dh.getElementByClass('container', element);
    if (container) {
      this.containerElement_ = container;
      return true;
    }
  }
  return false;
};



