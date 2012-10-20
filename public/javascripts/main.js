goog.provide('main');

goog.require('App');
goog.require('goog.dom');

main = function (affiliateBase) {
  var app = App.getInstance();
  if (affiliateBase) app.setAffiliateBase(affiliateBase);
  app.decorate(goog.dom.getDocument().body);
};

goog.exportSymbol('main', main);

