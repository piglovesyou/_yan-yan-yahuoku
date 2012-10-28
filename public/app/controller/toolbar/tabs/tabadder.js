
goog.provide('app.controller.TabAdder');

goog.require('app.events.EventCenter');
goog.require('goog.ui.Component');
goog.require('goog.asserts');
goog.require('app.string');


/**
 * @param {goog.dom.DomHelper=} opt_domHelper
 * @constructor
 * @extends {goog.ui.Component}
 */
app.controller.TabAdder = function (opt_domHelper) {
  goog.base(this, opt_domHelper);
};
goog.inherits(app.controller.TabAdder, goog.ui.Component);


/**
 * @enum {string}
 */
app.controller.TabAdder.EventType = {
  CLICK: 'tabadderclicked'
};


app.controller.TabAdder.prototype.isVisible_ = true;


app.controller.TabAdder.prototype.setVisible = function (show) {
  if (this.isVisible_ == show) return;
  goog.style.showElement(this.getElement(), this.isVisible_ = show);
};


/** @inheritDoc */
app.controller.TabAdder.prototype.enterDocument = function () {
  goog.base(this, 'enterDocument');
  this.getHandler().listen(this.getElement(), goog.events.EventType.CLICK, function () {
    this.dispatchEvent(app.controller.TabAdder.EventType.CLICK);
  });
};


/** @inheritDoc */
app.controller.TabAdder.prototype.createDom = function () {
  var dh = this.getDomHelper();
  var element = dh.createDom('div', 'tab-adder');
  this.setElementInternal(element);
};
