
goog.provide('app.App');

goog.require('goog.events.EventTarget');
goog.require('app.List');
goog.require('app.TagInput');
goog.require('app.Detail');
goog.require('app.Header');



/**
 * @constructor
 * @extends goog.events.EventTarget
 */
app.App = function() {
  goog.base(this);

  var eh = new goog.events.EventHandler(this);
  var bodyEl = goog.dom.getElementByClass('body');

  var header = new app.Header;
  header.decorate(goog.dom.getElementByClass('header'));



  var taginput = new app.TagInput;
  taginput.decorate(goog.dom.getElementByClass('tag-input'));

  var list = new app.List;
  list.search(taginput.buildUrl());
  list.decorate(goog.dom.getElementByClass('pane-list'));

  var detail = new app.Detail;
  detail.decorate(goog.dom.getElementByClass('pane-detail'));

  eh.listen(taginput, app.TagInput.EventType.TAG_UPDATE, function(e) {
      list.search(taginput.buildUrl());
    })
    .listen(list, goog.ui.list.EventType.UPDATE_TOTAL,
        taginput.updateRightContent, false, taginput)
    .listen(list, goog.ui.list.EventType.CLICKROW, function(e) {
      var row = /** @type {ObjectInterface.Item} */(e.data);
      detail.request(row.AuctionID);
    })
    .listen(this, app.header.Tab.EventType.DELEGATE_RENDER_FRAME, function (e) {
      e.render(bodyEl);
    }, false, this)
};
goog.inherits(app.App, goog.events.EventTarget);
goog.addSingletonGetter(app.App);

