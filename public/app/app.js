
goog.provide('app.App');

goog.require('app.TagInput');
goog.require('app.List');



/**
 * @constructor
 */
app.App = function () {
  var taginput = app.TagInput.getInstance();
  taginput.decorate(goog.dom.getElementByClass('header-input'));

  var data = new app.list.Data('/items/search'); // Url to request remote JSON
  data.setObjectNameTotalInJson('ResultSet.@attributes.totalResultsAvailable');
  data.setObjectNameRowsInJson('ResultSet.Result.Item');
  var list = new app.List;
  list.setData(data);
  list.decorate(goog.dom.getElementByClass('main-list'));

};
