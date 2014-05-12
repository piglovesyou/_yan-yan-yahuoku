
goog.provide('app.Detail');

goog.require('app.soy.detail');
goog.require('goog.ui.Component');




/**
 * @constructor
 * @param {goog.dom.DomHelper=} opt_domHelper .
 * @extends {goog.ui.Component}
 */
app.Detail = function(opt_domHelper) {
  goog.base(this, opt_domHelper);
};
goog.inherits(app.Detail, goog.ui.Component);

app.Detail.prototype.request = function(id) {
  if (this.xhr_) this.xhr_.dispose();
  var eh = this.getHandler();
  this.xhr_ = new goog.net.XhrIo;

  var url = new goog.Uri('/auction/auctionItem');
  url.setParameterValue('auctionID', id);

  // this.xhr_.send(url, 'GET', function(e) {
  // });
  // TODO: xhrio will accepts callback func

  eh.listen(this.xhr_, goog.net.EventType.SUCCESS, function(e) {
    var json = e.target.getResponseJson();
    console.log(json);
    if (!json) return;
    var auctionItem = goog.getObjectByName('ResultSet.Result', json);
    if (!auctionItem) return;
    this.renderContent(auctionItem);
  });
  this.xhr_.send(url, 'GET');
};

/**
 * @param {ObjectInterface.Detail} data Json data of auction item.
 */
app.Detail.prototype.renderContent = function(data) {
  goog.soy.renderElement(this.getContentElement(),
      app.soy.detail.renderContent,
      /** @type {ObjectInterface.Detail} */(data));
};














/** @inheritDoc */
app.Detail.prototype.decorateInternal = function(element) {
  goog.base(this, 'decorateInternal', element);
  this.contentEl = this.getElementByClass('main-detail-content');
};


app.Detail.prototype.getContentElement = function() {
  return this.contentEl;
};






/** @inheritDoc */
app.Detail.prototype.createDom = function() {
  goog.base(this, 'createDom');
};

/** @inheritDoc */
app.Detail.prototype.canDecorate = function(element) {
  if (element) {
    return true;
  }
  return false;
};


/** @inheritDoc */
app.Detail.prototype.enterDocument = function() {
  goog.base(this, 'enterDocument');
};


/** @inheritDoc */
app.Detail.prototype.disposeInternal = function() {
  goog.base(this, 'disposeInternal');
};
