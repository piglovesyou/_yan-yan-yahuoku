
goog.provide('app.App');

goog.require('app.List');
goog.require('app.TagInput');
goog.require('app.Detail');



/**
 * @constructor
 */
app.App = function() {
  var taginput = new app.TagInput;
  taginput.decorate(goog.dom.getElementByClass('header-input'));

  var list = new app.List;
  list.search(taginput.buildUrl());
  list.decorate(goog.dom.getElementByClass('main-list'));

  var detail = new app.Detail;
  detail.decorate(goog.dom.getElementByClass('main-detail'));

  goog.events.listen(taginput, app.TagInput.EventType.TAG_UPDATE, function(e) {
    list.search(taginput.buildUrl());
  });
  goog.events.listen(list, goog.ui.list.EventType.UPDATE_TOTAL,
      taginput.updateRightContent, false, taginput);
  goog.events.listen(list, goog.ui.list.EventType.CLICKROW, function(e) {
    var row = /** @type {ObjectInterface.Item} */(e.data);
    detail.request(row.AuctionID);
  });

};
