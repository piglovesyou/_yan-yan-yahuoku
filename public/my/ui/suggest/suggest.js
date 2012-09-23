
goog.provide('my.ui.Suggest');

goog.require('goog.ui.ac.RemoteArrayMatcher');
goog.require('goog.ui.ac.AutoComplete');
goog.require('goog.ui.ac.Renderer');
goog.require('goog.ui.ac.InputHandler');
goog.require('goog.ui.LabelInput');


/**
 * @constructor
 * @extends {goog.ui.ac.AutoComplete}
 */
my.ui.Suggest = function (url, inputElement, opt_domHelper) {
  var u = undefined;

  var matcher = new goog.ui.ac.RemoteArrayMatcher(url, false);
  var customRenderer = new my.ui.Suggest.CustomRenderer;
  var renderer = new goog.ui.ac.Renderer(u, customRenderer);
  var inputHandler = new goog.ui.ac.InputHandler(null, null, true, 300);

  goog.base(this, matcher, renderer, inputHandler);

  inputHandler.attachAutoComplete(this);
  inputHandler.attachInputs(inputElement);

  var labelInput = new goog.ui.LabelInput;
  labelInput.decorate(inputElement);
}
goog.inherits(my.ui.Suggest, goog.ui.ac.AutoComplete);


/**
 * @constructor
 */
my.ui.Suggest.CustomRenderer = function () {};

my.ui.Suggest.CustomRenderer.prototype.render = function (renderer, element, rows, token) {
  var dh = goog.dom.getDomHelper();
  var ul = dh.createDom('ul', 'dropdown-menu');
  token = goog.string.htmlEscape(token);
  goog.array.forEach(rows, function (row) {
    var content = my.ui.Suggest.CustomRenderer.hiliteMatchingText(row.data.path, token);
    console.log(content);
    var a = dh.createDom('a', { 'href': 'javascript:void(0)' });
    a.innerHTML = content;
    renderer.hiliteMatchingText_(a, token);
    var li = dh.createDom('li', null, a);
    renderer.rowDivs_.push(li);
    ul.appendChild(li);
  });
  element.appendChild(ul);
  return element;
};


my.ui.Suggest.CustomRenderer.hiliteMatchingText = function (text, token) {
  return goog.string.htmlEscape(text).replace(token, function (t) {return '<b>' + t + '</b>'});
};

