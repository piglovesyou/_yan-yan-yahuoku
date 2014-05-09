
goog.provide('app.Detail');

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

// app.Detail.prototype.renderContent = function(data) {
//   console.log('yeah');
//   // goog.soy.renderElement(this.getContentElement(), 
//   //     /** @type {ObjectInterface.Detail} */(data));
// };

/**
 * Do I wand goog.string.format?
 * @param {Object} data Json data of auction item.
 */
app.Detail.prototype.renderContent = function(data) {
  console.log('boo');
  var dh = this.getDomHelper();
  var esc = goog.string.htmlEscape;

  var container = this.getContentElement();
  // this.prepareContent_(true);

  this.auctionId_ = esc(data['AuctionID']);

  var safe_link = this.safeItemLink_ = esc(data['AuctionItemUrl']);
  var safe_title = this.safeTitle_ = esc(data['Title']);

  // this.titleInnerElement_.appendChild(
  //   goog.soy.renderAsFragment(app.soy.detail.detailItemLink, {
  //     href: safe_link,
  //     title: safe_title
  //   }));

  var images = goog.soy.renderAsFragment(app.soy.detail.detailImages, {
    images: data['Img']
  });

  var primaryTable = goog.soy.renderAsFragment(app.soy.detail.detailPrimaryTable, {
    price: data['Price'],
    bidorbuy: data['Bidorbuy'],
    endTime: data['EndTime'],
    bids: data['Bids']
  });

  // I trust Yahoo.
  var description = dh.createDom('p', null,
      dh.htmlToDocumentFragment(data['Description']));

  var subTable = goog.soy.renderAsFragment(app.soy.detail.detailSubTable, {
    quantity: data['Quantity'],
    initPrice: data['InitPrice'],
    startTime: data['StartTime'],
    endTime: data['EndTime'],
    isEarlyClosing: data['IsEarlyClosing'],
    isAutomaticExtension: data['IsAutomaticExtension'],
    itemStatus: data['ItemStatus'],
    itemReturnable: data['ItemReturnable']
  });

  // TODO: data['ShipTime']
  var paymentTable = goog.soy.renderAsFragment(app.soy.detail.paymentTable, {
      easyPayment: data['Payment']['EasyPayment'],
      bank: data['Payment']['Bank']
    });

  var senddetailTable =
      goog.soy.renderAsFragment(app.soy.detail.sendDetailTable, {
        chargeForShipping: data['ChargeForShipping'],
        location: data['Location'],
        isWorldwide: data['IsWorldwide']
      });

  var shippingTable =
      +goog.getObjectByName('Shipping.@attributes.totalShippingMethodAvailable',
                            data) ?
        goog.soy.renderAsFragment(app.soy.detail.shippingTable, {
          shippingMethodName: goog.getObjectByName('Shipping.Method.Name', data)
        }) : null;

  var descriptionContainer = dh.createDom('div', 'detail-description-container',
      this.descriptionElementRef_ = description,
      app.ui.Detail.createItemLinkParagraph_(safe_link, safe_title, dh),
      this.tableElementRef_ = primaryTable,
      subTable,
      paymentTable,
      senddetailTable,
      shippingTable,
      app.ui.Detail.createItemLinkParagraph_(safe_link,
                                             safe_title, dh));

  goog.asserts.assert(this.innerElement_, 'Must be');


  dh.append(this.innerElement_,
            this.imagesElementRef_ = images,
            descriptionContainer
           );

  this.updateAfterImageLoaded_(
      goog.dom.getElementsByTagNameAndClass('img', null, this.innerElement_));
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
