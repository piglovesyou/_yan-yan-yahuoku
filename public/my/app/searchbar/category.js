
goog.provide('my.app.searchbar.Category');

goog.require('goog.ui.Component');
goog.require('my.app.category.Suggest');




/**
 * XXX: Do I want this Class? my.app.searchbar.category.Suggest can be
 *      directly appended to an instance of Searchbar.
 * @constructor
 * @extends {goog.ui.Component}
 */
my.app.searchbar.Category = function (opt_domHelper) {
  goog.base(this, opt_domHelper);
}
goog.inherits(my.app.searchbar.Category, goog.ui.Component);


/**
 * @type {my.app.category.Suggest}
 */
my.app.searchbar.Category.prototype.suggest_;


/**
 * @type {Element}
 */
my.app.searchbar.Category.prototype.inputElement_;


/** @inheritDoc */
my.app.searchbar.Category.prototype.enterDocument = function () {
  goog.base(this, 'enterDocument');

  var condition = this.getCondition_();
  var suggest = this.suggest_ = new my.app.category.Suggest('/api/categorySuggest', 
      this.inputElement_, condition['category'], this.getDomHelper());
  suggest.setParentEventTarget(this);
};


my.app.searchbar.Category.prototype.getCondition_ = function () {
  var frame = this.getParent().getParent();
  goog.asserts.assert(frame instanceof my.app.Frame, 'Wrong parent for category!');
  var condition = my.Model.getInstance().getTabQuery(frame.getId());
  goog.asserts.assert(condition, 'Model must have data for category.');
  return condition;
};


/** @inheritDoc */
my.app.searchbar.Category.prototype.createDom = function () {
  var condition = this.getCondition_();
  var dh = this.getDomHelper();
  var element = 
      this.inputElement_ = 
        dh.createDom('input', {
          type:'text',
          value: condition['category']['path']
        });
  this.setElementInternal(element);
};
