
goog.provide('app.ui.TabAdder');

goog.require('app.events.EventCenter');
goog.require('app.string');
goog.require('goog.asserts');
goog.require('goog.ui.Component');


/**
 * @param {goog.dom.DomHelper=} opt_domHelper
 * @constructor
 * @extends {goog.ui.Component}
 */
app.ui.TabAdder = function(opt_domHelper) {
  goog.base(this, opt_domHelper);
};
goog.inherits(app.ui.TabAdder, goog.ui.Component);


/**
 * @enum {string}
 */
app.ui.TabAdder.EventType = {
  CLICK: 'tabadderclicked'
};


app.ui.TabAdder.prototype.isVisible_ = true;


app.ui.TabAdder.prototype.setVisible = function(show) {
  if (this.isVisible_ == show) return;
  goog.style.showElement(this.getElement(), this.isVisible_ = show);
};


/** @inheritDoc */
app.ui.TabAdder.prototype.enterDocument = function() {
  goog.base(this, 'enterDocument');
  this.getHandler().listen(this.getElement(), goog.events.EventType.CLICK, function() {
    this.dispatchEvent(app.ui.TabAdder.EventType.CLICK);
  });
};


/** @inheritDoc */
app.ui.TabAdder.prototype.createDom = function() {
  var dh = this.getDomHelper();
  var element = dh.createDom('div', 'tab-adder');
  this.setElementInternal(element);
};
