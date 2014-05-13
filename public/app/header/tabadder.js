
goog.provide('app.header.TabAdder');

goog.require('app.events.EventCenter');
goog.require('goog.asserts');
goog.require('goog.ui.Component');


/**
 * @param {goog.dom.DomHelper=} opt_domHelper
 * @constructor
 * @extends {goog.ui.Component}
 */
app.header.TabAdder = function(opt_domHelper) {
  goog.base(this, opt_domHelper);
};
goog.inherits(app.header.TabAdder, goog.ui.Component);


/**
 * @enum {string}
 */
app.header.TabAdder.EventType = {
  CLICK: 'tabadderclicked'
};


app.header.TabAdder.prototype.isVisible_ = true;


app.header.TabAdder.prototype.setVisible = function(show) {
  if (this.isVisible_ == show) return;
  goog.style.showElement(this.getElement(), this.isVisible_ = show);
};


/** @inheritDoc */
app.header.TabAdder.prototype.enterDocument = function() {
  goog.base(this, 'enterDocument');
  this.getHandler().listen(this.getElement(), goog.events.EventType.CLICK, function() {
    this.dispatchEvent(app.header.TabAdder.EventType.CLICK);
  });
};


/** @inheritDoc */
app.header.TabAdder.prototype.createDom = function() {
  var dh = this.getDomHelper();
  var element = dh.createDom('div', 'tab-adder');
  this.setElementInternal(element);
};
