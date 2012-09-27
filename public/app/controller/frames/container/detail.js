
goog.provide('app.controller.Detail');

goog.require('goog.ui.SplitPane');
goog.require('goog.style');
goog.require('app.ui.ThousandRows');


/**
 * @constructor
 * @extends {goog.ui.Scroller}
 */
app.controller.Detail = function (opt_domHelper) {
  goog.base(this, 'vertical', opt_domHelper);
}
goog.inherits(app.controller.Detail, goog.ui.Scroller);

app.controller.Detail.prototype.renderContent = function (data) {
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


/**
 * @param {boolean=} isFirst If FALSE, unrender and update.
 */
app.controller.Detail.prototype.clearContent = function (isFirst) {
  var dh = this.getDomHelper();
  var content = this.getContentElement();

  if (!isFirst) dh.removeChildren(content);
  content.appendChild(
      dh.createDom('h2', { 'style': 'color:lightgray;text-align:center' },
        'アイテムを選択してください'));
  if (!isFirst) this.update();
};


app.controller.Detail.prototype.createDom = function () {
  goog.base(this, 'createDom');
  this.clearContent(true);
};
