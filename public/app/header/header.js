
goog.provide('app.Header');

goog.require('app.header.Tabs');
goog.require('goog.ui.Component');



/**
 * @constructor
 * @param {goog.dom.DomHelper=} opt_domHelper .
 * @extends {goog.ui.Component}
 */
app.Header = function(opt_domHelper) {
  goog.base(this, opt_domHelper);

  this.addChild(this.tabs = new app.header.Tabs);
};
goog.inherits(app.Header, goog.ui.Component);


/** @inheritDoc */
app.Header.prototype.decorateInternal = function(element) {
  goog.base(this, 'decorateInternal', element);
  this.tabs.decorateInternal(this.getElementByClass('header-tabs'));
};


/** @inheritDoc */
app.Header.prototype.enterDocument = function() {
  goog.base(this, 'enterDocument');
  var eh = this.getHandler();
  // eh.listen(this, app.header.Tab.EventType.DELEGATE_RENDER_FRAME, function () {
  //   console.log('yeah..');
  // })
};


/** @inheritDoc */
app.Header.prototype.disposeInternal = function() {
  goog.base(this, 'disposeInternal');
};
