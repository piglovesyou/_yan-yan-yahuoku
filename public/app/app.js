
goog.provide('app.App');

goog.require('goog.ui.Component');
goog.require('app.List');
goog.require('app.TagInput');
goog.require('app.Detail');
goog.require('app.Header');



/**
 * @constructor
 * @extends goog.ui.Component
 */
app.App = function(rootEl) {
  goog.base(this);

  this.header = new app.Header;
  this.addChild(this.header);

  this.decorate(rootEl);

  // var eh = new goog.events.EventHandler(this);

  // header.decorate(goog.dom.getElementByClass('header'));

  // var taginput = new app.TagInput;
  // taginput.decorate(goog.dom.getElementByClass('tag-input'));

  // var list = new app.List;
  // list.search(taginput.buildUrl());
  // list.decorate(goog.dom.getElementByClass('pane-list'));

  // var detail = new app.Detail;
  // detail.decorate(goog.dom.getElementByClass('pane-detail'));

  // eh.listen(taginput, app.TagInput.EventType.TAG_UPDATE, function(e) {
  //     list.search(taginput.buildUrl());
  //   })
  //   .listen(list, goog.ui.list.EventType.UPDATE_TOTAL,
  //       taginput.updateRightContent, false, taginput)
  //   .listen(list, goog.ui.list.EventType.CLICKROW, function(e) {
  //     var row = /** @type {ObjectInterface.Item} */(e.data);
  //     detail.request(row.AuctionID);
  //   })
};
goog.inherits(app.App, goog.ui.Component);


app.App.prototype.decorateInternal = function(element) {
  goog.base(this, 'decorateInternal', element);

  this.header.decorateInternal(goog.dom.getElementByClass('header'));

  this.bodyEl = goog.dom.getElementByClass('body');
  goog.asserts.assert(this.bodyEl);
};

app.App.prototype.enterDocument = function() {
  var eh = this.getHandler();
  eh.listen(this, app.header.Tab.EventType.DELEGATE_RENDER_FRAME, function (e) {
    e.render(this.bodyEl);
  }, false, this)

  goog.base(this, 'enterDocument');
}
