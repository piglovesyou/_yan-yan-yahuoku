goog.provide('main');

goog.require('my.App');

main = function () {
  var app = new my.App();
  app.decorate(document.body);
};

goog.exportSymbol('main', main);

