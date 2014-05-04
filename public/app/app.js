
goog.provide('app.App');

goog.require('app.TagInput');
goog.require('app.List');



/**
 * @constructor
 */
app.App = function () {
  var taginput = app.TagInput.getInstance();
  taginput.decorate(goog.dom.getElementByClass('header-input'));

  var list = new app.List;
  list.search(taginput.buildUrl());
  list.decorate(goog.dom.getElementByClass('main-list'));

  goog.events.listen(taginput, app.TagInput.EventType.TAG_UPDATE, function(e) {
    list.search(taginput.buildUrl());
  })
};
