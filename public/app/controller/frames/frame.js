
goog.provide('app.controller.Frame');

goog.require('app.controller.Searchbar');
goog.require('app.controller.Container');


/**
 * @constructor
 * @extends {goog.ui.Component}
 */
app.controller.Frame = function (id, opt_domHelper) {
  goog.base(this, opt_domHelper);
  this.setId(id);

  this.searchbar_ = new app.controller.Searchbar(this.getDomHelper());
  this.addChild(this.searchbar_);
  this.container_ = new app.controller.Container(this.getDomHelper());
  this.addChild(this.container_);


  /**
   * @type {Object}
   */
  this.currCategory_ = app.model.getTabQuery(this.getId())['category'];
}
goog.inherits(app.controller.Frame, goog.ui.Component);


app.controller.Frame.prototype.enterDocument = function () {
  goog.base(this, 'enterDocument');

  this.getHandler()
    .listen(this, app.controller.Searchbar.EventType.SEARCH, this.handleSearch_)
    .listen(this, app.controller.category.Suggest.EventType.UPDATE_CATEGORY, this.handleUpdateCategory_);
};


app.controller.Frame.prototype.handleSearch_ = function (e) {
  var searchbar = e.target;
  var query = searchbar.getQuery();
  if (goog.isString(query)) {
    app.model.setTabQuery(this.getId(), {
      'query': query,
      'category': this.currCategory_
    });
    this.container_.refreshByQuery(query, this.currCategory_['CategoryId']);

  }
};


app.controller.Frame.prototype.handleUpdateCategory_ = function (e) {
  var category = /** @type {Object} */(e.category);
  if (category) {
    this.currCategory_ = category;
  }
};


app.controller.Frame.prototype.createDom = function () {
  var dh = this.getDomHelper();
  this.searchbar_.createDom();
  this.container_.createDom();
  this.setElementInternal(dh.createDom('div', ['frame', 'selected'],
        this.searchbar_.getElement(),
        this.container_.getElement()));
};


app.controller.Frame.prototype.decorateInternal = function (element) {
  goog.base(this, 'decorateInternal', element);
  this.container_.decorateInternal(this.containerElement_);
};


app.controller.Frame.prototype.canDecorate = function (element) {
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



