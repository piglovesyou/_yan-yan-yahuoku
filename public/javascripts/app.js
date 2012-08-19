goog.provide('my.app');
goog.require('goog.dom');
goog.require('my.ds.Xhr');

my.app = function () {
  var xhr = my.ds.Xhr.getInstance();
  xhr.get('/api/categoryTree', {
    'category': 23336
  }, function (err, data) {
    goog.dom.append(document.body, data.toString());
  });
};

goog.exportSymbol('my.app', my.app);

