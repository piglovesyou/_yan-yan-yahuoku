goog.provide('main');

goog.require('App');
goog.require('goog.dom');

main = function () {
  var app = App.getInstance();
  app.decorate(goog.dom.getDocument().body);
};

goog.exportSymbol('main', main);

