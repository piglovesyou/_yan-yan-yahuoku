
goog.provide('app.App');

goog.require('app.TagInput');



/**
 * @constructor
 */
app.App = function () {
  var taginput = new app.TagInput;
  taginput.decorate(goog.dom.getElementByClass('header-input'));
};
