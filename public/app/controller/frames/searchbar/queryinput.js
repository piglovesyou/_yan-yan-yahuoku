
goog.provide('app.controller.QueryInput');

goog.require('goog.events.InputHandler');


/**
 * @constructor
 * @extends {goog.ui.Component}
 */
app.controller.QueryInput = function (opt_domHelper) {
  goog.base(this, opt_domHelper);
  var dh = this.getDomHelper();
};
goog.inherits(app.controller.QueryInput, goog.ui.Component);


app.controller.QueryInput.DefaultValue = 'キーワード';


/**
 * @type {goog.events.InputHandler}
 */
app.controller.QueryInput.prototype.inputHandler_;


/**
 * @return {!string}
 */
app.controller.QueryInput.prototype.getValue = function () {
  var elm = this.getElement();
  return elm ? goog.string.trim(elm.value) : '';
};


app.controller.QueryInput.prototype.enterDocument = function () {
  var frame = this.getParent().getParent();
  goog.asserts.assert(frame instanceof app.controller.Frame, 'Wrong parent for QueryInput!!!');
  goog.base(this, 'enterDocument');
};


app.controller.QueryInput.prototype.createDom = function () {
  var frame = this.getParent().getParent();
  goog.asserts.assert(frame instanceof app.controller.Frame, 'Wrong parent for queryInput!!');
  var condition = app.Model.getInstance().getTabQuery(frame.getId());
  goog.asserts.assert(condition, 'Model must have data for queryInput!');

  var element = this.getDomHelper().createDom('input', {
    type: 'text',
    placeholder: app.controller.QueryInput.DefaultValue,
    value: condition['query']
  });
  this.setElementInternal(element);
  this.inputHandler_ = new goog.events.InputHandler(element);
};


app.controller.QueryInput.prototype.disposeInternal = function () {
  if (this.inputHandler_) {
    this.inputHandler_.dispose();
    this.inputHandler_ = null;
  }
  goog.base(this, 'disposeInternal');
};
