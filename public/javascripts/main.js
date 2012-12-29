goog.provide('main');

goog.require('App');
goog.require('app.Model');
goog.require('goog.Timer');
goog.require('goog.dom');


/**
 * @param {string} affiliateBase .
 * @param {boolean} isAuthed .
 */
main = function(affiliateBase, isAuthed) {
  var appInstance = App.getInstance();

  if (affiliateBase) appInstance.setAffiliateBase(affiliateBase);

  goog.Timer.callOnce(function() {
    app.model.updateAuthState(isAuthed); // XXX: Really?
  }, 500); // Waits for all instances initialized.

  appInstance.decorate(goog.dom.getDocument().body);
};

goog.exportSymbol('main', main);

