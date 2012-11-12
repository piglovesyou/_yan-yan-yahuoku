
goog.provide('app.ui.Category');

goog.require('goog.ui.Component');
goog.require('app.ui.category.Suggest');




/**
 * XXX: Do I want this Class? app.ui.category.Suggest can be
 *      directly appended to an instance of Searchbar.
 * @constructor
 * @extends {goog.ui.Component}
 */
app.ui.Category = function (opt_domHelper) {
  goog.base(this, opt_domHelper);
}
goog.inherits(app.ui.Category, goog.ui.Component);


/**
 * @type {app.ui.category.Suggest}
 */
app.ui.Category.prototype.suggest_;


/**
 * @type {Element}
 */
app.ui.Category.prototype.inputElement_;


/** @inheritDoc */
app.ui.Category.prototype.enterDocument = function () {
  goog.base(this, 'enterDocument');

  var condition = this.getCondition_();
  var suggest = this.suggest_ = new app.ui.category.Suggest('/api/categorySuggest', 
      this.inputElement_, condition['category'], this.getDomHelper());
  suggest.setParentEventTarget(this);
};


app.ui.Category.prototype.getCondition_ = function () {
  var frame = this.getParent().getParent();
  goog.asserts.assert(frame instanceof app.ui.Frame, 'Wrong parent for category!');
  var condition = app.model.getTabQuery(frame.getId());
  goog.asserts.assert(condition, 'Model must have data for category.');
  return condition;
};


/** @inheritDoc */
app.ui.Category.prototype.createDom = function () {
  var condition = this.getCondition_();
  var dh = this.getDomHelper();
  var element = 
      this.inputElement_ = 
        dh.createDom('input', {
          type:'text',
          value: condition['category']['CategoryPath']
        });
  app.ui.category.Suggest.InputHandler.showEndOfValue(this.inputElement_);
  this.setElementInternal(element);
};
