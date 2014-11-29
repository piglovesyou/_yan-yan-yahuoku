
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

/**
 * @param {string} id AuctionID
 */
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
    if (!json) return;
    var auctionItem = goog.getObjectByName('ResultSet.Result', json);
    if (!auctionItem) return;
    this.renderContent(auctionItem);
  });

  this.xhr_.send(url, 'GET');
};


/**
 * Do I wand goog.string.format?
 * @param {Object} data Json data of auction item.
 * @suppress {checkTypes}
 */
app.Detail.prototype.renderContent = function(data) {
  this.getElement().scrollTop = 0;
  data['Description'] = soydata.SanitizedHtml.from(
      goog.html.uncheckedconversions.safeHtmlFromStringKnownToSatisfyTypeContract(
        goog.string.Const.from(data['Description']), data['Description']));
  goog.soy.renderElement(this.getContentElement(),
      app.soy.detail.renderContent,
      /** @type {ObjectInterface.Item} */(data));

  this.adjustBodyHeight();
  this.afterImageLoad_(this.adjustBodyHeight, this);
};


/**
 * @private
 * @param {Function} fn .
 * @param {Object} context .
 */
app.Detail.prototype.afterImageLoad_ = function(fn, context) {
  var dh = this.getDomHelper();
  var eh = this.getHandler();
  var imgEls = dh.getElementsByTagNameAndClass('img',
      null, this.getContentElement());
  if (!goog.array.isEmpty(imgEls)) {
    var len = imgEls.length;
    goog.array.forEach(imgEls, function(imgEl) {
      eh.listenOnce(imgEl, goog.events.EventType.LOAD, function() {
        if (!--len) {
          fn.call(context);
        }
      });
    });
  }
};


/** @inheritDoc */
app.Detail.prototype.createDom = function() {
  this.setElementInternal(/**@type{Element}*/(goog.soy.renderAsFragment(
      app.soy.detail.createDom)));
};


/***/
app.Detail.prototype.adjustBodyHeight = function() {
  var dh = this.getDomHelper();
  var bodyEl = this.getElementByClass('detail-body');
  if (bodyEl) {
    var outerSize = goog.style.getContentBoxSize(this.getElement());
    goog.style.setBorderBoxSize(bodyEl,
        new goog.math.Size(outerSize.width,
          outerSize.height - bodyEl.offsetTop));
    goog.style.setWidth(bodyEl, '');
  }
};

