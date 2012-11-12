
goog.provide('app.ui.QueryInput');

goog.require('goog.events.InputHandler');


/**
 * @constructor
 * @extends {goog.ui.Component}
 */
app.ui.QueryInput = function(opt_domHelper) {
  goog.base(this, opt_domHelper);
  var dh = this.getDomHelper();
};
goog.inherits(app.ui.QueryInput, goog.ui.Component);


app.ui.QueryInput.DefaultValue = 'キーワード';


/**
 * @type {goog.events.InputHandler}
 */
app.ui.QueryInput.prototype.inputHandler_;


/**
 * @return {!string}
 */
app.ui.QueryInput.prototype.getValue = function() {
  var elm = this.getElement();
  return elm ? goog.string.trim(elm.value) : '';
};


app.ui.QueryInput.prototype.enterDocument = function() {
  var frame = this.getParent().getParent();
  goog.asserts.assert(frame instanceof app.ui.Frame, 'Wrong parent for QueryInput!!!');
  goog.base(this, 'enterDocument');
};


app.ui.QueryInput.prototype.createDom = function() {
  var frame = this.getParent().getParent();
  goog.asserts.assert(frame instanceof app.ui.Frame, 'Wrong parent for queryInput!!');
  var condition = app.model.getTabQuery(frame.getId());
  goog.asserts.assert(condition, 'Model must have data for queryInput!');

  var element = this.getDomHelper().createDom('input', {
    type: 'text',
    placeholder: app.ui.QueryInput.DefaultValue,
    value: condition['query']
  });
  this.setElementInternal(element);
  this.inputHandler_ = new goog.events.InputHandler(element);
};


app.ui.QueryInput.prototype.disposeInternal = function() {
  if (this.inputHandler_) {
    this.inputHandler_.dispose();
    this.inputHandler_ = null;
  }
  goog.base(this, 'disposeInternal');
};
