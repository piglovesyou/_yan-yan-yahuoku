
goog.provide('my.app.Frame');

goog.require('my.app.Searchbar');
goog.require('my.app.Container');


/**
 * @constructor
 * @extends {goog.ui.Component}
 */
my.app.Frame = function (id, opt_domHelper) {
  goog.base(this, opt_domHelper);
  this.setId(id);

  this.searchbar_ = new my.app.Searchbar(this.getDomHelper());
  this.addChild(this.searchbar_);
  this.container_ = new my.app.Container(this.getDomHelper());
  this.addChild(this.container_);
}
goog.inherits(my.app.Frame, goog.ui.Component);


my.app.Frame.prototype.enterDocument = function () {
  goog.base(this, 'enterDocument');

  this.getHandler()
    .listen(this, my.app.Searchbar.EventType.SEARCH, this.handleSearch_)
    .listen(this, my.app.category.Suggest.EventType.UPDATE_CATEGORY, this.handleUpdateCategory_);
};


my.app.Frame.prototype.handleSearch_ = function (e) {
  var searchbar = e.target;
  var query = searchbar.getQuery();
  if (goog.isString(query)) {
    my.Model.getInstance().setTabQuery(this.getId(), {
      'query': query,
      'category': this.currCategory_
    });
    this.container_.refreshByQuery(query, this.currCategory_['id']);

  }
};


/**
 * {
 *   'id': categoryId,
 *   'path': categoryPath
 * }
 * @type {?Object}
 */
my.app.Frame.prototype.currCategory_ = {
  'id': 0,
  'path': ''
};


my.app.Frame.prototype.handleUpdateCategory_ = function (e) {
  var category = /** @type {Object} */(e.category);
  if (category) {
    this.currCategory_ = category;
  }
};


my.app.Frame.prototype.createDom = function () {
  var dh = this.getDomHelper();
  this.searchbar_.createDom();
  this.container_.createDom();
  this.setElementInternal(dh.createDom('div', ['frame', 'selected'],
        this.searchbar_.getElement(),
        this.container_.getElement()));
};


my.app.Frame.prototype.decorateInternal = function (element) {
  goog.base(this, 'decorateInternal', element);
  this.container_.decorateInternal(this.containerElement_);
};


my.app.Frame.prototype.canDecorate = function (element) {
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




my.app.Frame.Model = function () {
  this.query = '';
  this.category = my.app.category.Suggest.DefaultCategory;
};
