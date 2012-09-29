
goog.provide('app.controller.Category');

goog.require('goog.ui.Component');
goog.require('app.controller.category.Suggest');




/**
 * XXX: Do I want this Class? app.controller.category.Suggest can be
 *      directly appended to an instance of Searchbar.
 * @constructor
 * @extends {goog.ui.Component}
 */
app.controller.Category = function (opt_domHelper) {
  goog.base(this, opt_domHelper);
}
goog.inherits(app.controller.Category, goog.ui.Component);


/**
 * @type {app.controller.category.Suggest}
 */
app.controller.Category.prototype.suggest_;


/**
 * @type {Element}
 */
app.controller.Category.prototype.inputElement_;


/** @inheritDoc */
app.controller.Category.prototype.enterDocument = function () {
  goog.base(this, 'enterDocument');

  var condition = this.getCondition_();
  var suggest = this.suggest_ = new app.controller.category.Suggest('/api/categorySuggest', 
      this.inputElement_, condition['category'], this.getDomHelper());
  suggest.setParentEventTarget(this);
};


app.controller.Category.prototype.getCondition_ = function () {
  var frame = this.getParent().getParent();
  goog.asserts.assert(frame instanceof app.controller.Frame, 'Wrong parent for category!');
  var condition = app.Model.getInstance().getTabQuery(frame.getId());
  goog.asserts.assert(condition, 'Model must have data for category.');
  return condition;
};


/** @inheritDoc */
app.controller.Category.prototype.createDom = function () {
  var condition = this.getCondition_();
  var dh = this.getDomHelper();
  var element = 
      this.inputElement_ = 
        dh.createDom('input', {
          type:'text',
          value: condition['category']['CategoryPath']
        });
  this.setElementInternal(element);
};
