goog.provide('main');

goog.require('App');
goog.require('goog.dom');

main = function () {
  var app = new App();
  app.decorate(goog.dom.getDocument().body);
};

goog.exportSymbol('main', main);

