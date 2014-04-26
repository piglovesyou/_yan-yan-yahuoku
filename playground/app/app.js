
goog.provide('app.App');

goog.require('app.TagInput');



/**
 * @constructor
 */
app.App = function () {
  var taginput = app.TagInput.getInstance();
  taginput.decorate(goog.dom.getElementByClass('header-input'));
};
