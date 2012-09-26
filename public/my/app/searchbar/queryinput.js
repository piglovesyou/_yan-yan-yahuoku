
goog.provide('my.app.searchbar.QueryInput');

goog.require('goog.events.InputHandler');


/**
 * @constructor
 * @extends {goog.ui.Component}
 */
my.app.searchbar.QueryInput = function (opt_domHelper) {
  goog.base(this, opt_domHelper);
  var dh = this.getDomHelper();
};
goog.inherits(my.app.searchbar.QueryInput, goog.ui.Component);


my.app.searchbar.QueryInput.DefaultValue = 'キーワード';


/**
 * @type {goog.events.InputHandler}
 */
my.app.searchbar.QueryInput.prototype.inputHandler_;


/**
 * @return {!string}
 */
my.app.searchbar.QueryInput.prototype.getValue = function () {
  var elm = this.getElement();
  return elm ? goog.string.trim(elm.value) : '';
};


my.app.searchbar.QueryInput.prototype.enterDocument = function () {
  var frame = this.getParent().getParent();
  goog.asserts.assert(frame instanceof my.app.Frame, 'Wrong parent for QueryInput!!!');
  goog.base(this, 'enterDocument');
};


my.app.searchbar.QueryInput.prototype.createDom = function () {
  var element = this.getDomHelper().createDom('input', {
    type: 'text',
    placeholder: my.app.searchbar.QueryInput.DefaultValue
  });
  this.setElementInternal(element);
  this.inputHandler_ = new goog.events.InputHandler(element);
};


my.app.searchbar.QueryInput.prototype.disposeInternal = function () {
  if (this.inputHandler_) {
    this.inputHandler_.dispose();
    this.inputHandler_ = null;
  }
  goog.base(this, 'disposeInternal');
};
