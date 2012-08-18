goog.provide('my.app');
goog.require('goog.dom');

my.app = function () {
  var elm = goog.dom.createDom('h1', {
    style: 'font-size: 600%'
  }, 'yeah..');
  goog.dom.append(document.body, elm);
};

goog.exportSymbol('my.app', my.app);

