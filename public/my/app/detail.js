
goog.provide('my.app.Detail');

goog.require('goog.ui.SplitPane');
goog.require('goog.style');
goog.require('my.ui.ThousandRows');


/**
 * @constructor
 * @extends {goog.ui.Scroller}
 */
my.app.Detail = function (opt_domHelper) {
  goog.base(this, 'vertical', opt_domHelper);
}
goog.inherits(my.app.Detail, goog.ui.Scroller);

my.app.Detail.prototype.renderContent = function (data) {
  var dh = this.getDomHelper();
  var container = this.getContentElement();
  dh.removeChildren(container);
  
  var images = dh.createDom('div', {className: 'photos', 'style':'text-align:center'}); 

  var imageCount = 0;
  var self = this;
  goog.object.forEach(data.Img, function (url) {
    imageCount++;
    images.appendChild(dh.createDom('img', {
      'src': url,
      'onload': function () {
        if (--imageCount == 0) {
          self.update();
        }
      }
    }));
  });
  container.appendChild(images);
};

my.app.Detail.prototype.createDom = function () {
  goog.base(this, 'createDom');
  var dh = this.getDomHelper();
  this.getContentElement().appendChild(
          dh.createDom('h2', {
            'style': 'color:lightgray;text-align:center'
          }, 'アイテムを選択してください'));
};
