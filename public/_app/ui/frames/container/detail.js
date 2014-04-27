
goog.provide('app.ui.Detail');

goog.require('app.soy');
goog.require('app.ui.Message');
goog.require('app.ui.ThousandRows');
goog.require('app.ui.common.ButtonRenderer');
goog.require('app.ui.util');
goog.require('goog.soy');
goog.require('goog.style');
goog.require('goog.ui.SplitPane');
goog.require('goog.ui.ToggleButton');
goog.require('goog.window');


/**
 * @param {goog.dom.DomHelper=} opt_domHelper A dom helper.
 * @constructor
 * @extends {goog.ui.Scroller}
 */
app.ui.Detail = function(opt_domHelper) {
  goog.base(this, goog.ui.Scroller.ORIENTATION.BOTH, opt_domHelper);
};
goog.inherits(app.ui.Detail, goog.ui.Scroller);


/**
 * @private
 * @type {Element}
 */
app.ui.Detail.prototype.emptyMessageElement_;


/**
 * @private
 * @type {Element}
 */
app.ui.Detail.prototype.titleElement_;


/**
 * @private
 * @type {Element}
 */
app.ui.Detail.prototype.titleInnerElement_;


/**
 * @private
 * @type {Element}
 */
app.ui.Detail.prototype.buttonsContainerElement_;


/**
 * @private
 * @type {Element}
 */
app.ui.Detail.prototype.innerElement_;


/**
 * @private
 * @type {string}
 */
app.ui.Detail.prototype.auctionId_;


/**
 * @private
 * @type {string}
 */
app.ui.Detail.prototype.safeTitle_;


/**
 * @private
 * @type {string}
 */
app.ui.Detail.prototype.safeItemLink_;


/**
 * @private
 * @type {Element}
 */
app.ui.Detail.prototype.imagesElementRef_;


/**
 * @private
 * @type {Element}
 */
app.ui.Detail.prototype.descriptionElementRef_;


/**
 * @private
 * @type {Element}
 */
app.ui.Detail.prototype.tableElementRef_;


/** @inheritDoc */
app.ui.Detail.prototype.createDom = function() {
  goog.base(this, 'createDom');
  var dh = this.getDomHelper();
  var element = this.getElement();
  var content = this.getContentElement();
  goog.asserts.assert(content, 'should be.');

  dh.insertChildAt(this.getElement(),
      dh.htmlToDocumentFragment(app.soy.detailTitle()), 0);
  this.titleElement_ = dh.getElementByClass('detail-title', element);
  this.buttonsContainerElement_ =
      dh.getElementByClass('detail-title-buttons', this.titleElement_);
  this.titleInnerElement_ =
      dh.getElementByClass('detail-title-inner', this.titleElement_);

  dh.append(content,
      this.innerElement_ = dh.createDom('div', 'detail-inner'));

  goog.asserts.assert(this.titleElement_ &&
                      this.buttonsContainerElement_ &&
                      this.titleInnerElement_ &&
                      this.innerElement_, 'should be.');
  this.clearContent(true);
};


/**
 * Do I wand goog.string.format?
 * @param {Object} data Json data of auction item.
 */
app.ui.Detail.prototype.renderContent = function(data) {
  var dh = this.getDomHelper();
  var esc = goog.string.htmlEscape;

  var container = this.getContentElement();
  this.prepareContent_(true);

  this.auctionId_ = esc(data['AuctionID']);

  var safe_link = this.safeItemLink_ =
    app.string.createAuctionItemLink(esc(data['AuctionItemUrl']));
  var safe_title = this.safeTitle_ = esc(data['Title']);

  this.titleInnerElement_.appendChild(
    goog.soy.renderAsFragment(app.soy.detailItemLink, {
      href: safe_link,
      title: safe_title
    }));

  var images = goog.soy.renderAsFragment(app.soy.detailImages, {
    images: data['Img']
  });

  var primaryTable = goog.soy.renderAsFragment(app.soy.detailPrimaryTable, {
    price: data['Price'],
    bidorbuy: data['Bidorbuy'],
    endTime: data['EndTime'],
    bids: data['Bids']
  });

  // I trust Yahoo.
  var description = dh.createDom('p', null,
      dh.htmlToDocumentFragment(data['Description']));

  var subTable = goog.soy.renderAsFragment(app.soy.detailSubTable, {
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
  var paymentTable = goog.soy.renderAsFragment(app.soy.paymentTable, {
      easyPayment: data['Payment']['EasyPayment'],
      bank: data['Payment']['Bank']
    });

  var senddetailTable =
      goog.soy.renderAsFragment(app.soy.sendDetailTable, {
        chargeForShipping: data['ChargeForShipping'],
        location: data['Location'],
        isWorldwide: data['IsWorldwide']
      });

  var shippingTable =
      +goog.getObjectByName('Shipping.@attributes.totalShippingMethodAvailable',
                            data) ?
        goog.soy.renderAsFragment(app.soy.shippingTable, {
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

/**
 * @private
 * @param { {length: number} } images .
 */
app.ui.Detail.prototype.updateAfterImageLoaded_ = function(images) {
  var count = images.length;
  if (count > 0) {
    var eh = this.getHandler();
    goog.array.forEach(images, function(img) {
      eh.listenOnce(img, goog.events.EventType.LOAD, function(e) {
        if (--count <= 0) this.update();
      }, this);
    }, this);
  } else {
    this.update();
  }
};


/**
 * @param {string} safe_link .
 * @param {string} safe_title .
 * @param {goog.dom.DomHelper} dh .
 * @return {Element} .
 * @private
 */
app.ui.Detail.createItemLinkParagraph_ = function(safe_link, safe_title, dh) {
  return goog.soy.renderAsFragment(app.soy.detailItemLinkParagraph, {
    href: safe_link,
    title: safe_title
  });
};


/** @inheritDoc */
app.ui.Detail.prototype.enterDocument = function() {
  goog.base(this, 'enterDocument');
};


// case 'addWatchList': app.model.addWatchList(this.auctionId_,

/**
 * @param {?goog.net.Xhrio} err .
 * @param {?Object} response .
 * @private
 */
app.ui.Detail.prototype.handleCompleteAddWatchList_ = function(err, response) {
  if (err) {
    // TODO: Shorter method is better.
    // TODO: Link text wants `popup' icon.
    app.message.error('ウォッチリストに追加できませんでした。' +
                      '<a href="javascript:app.auth.popup();">認証</a>' +
                      'する必要があります。');
  } else if (response['Error']) {
    app.message.alert(response['Error']['Message']);
  } else {
    app.message.success('「' + this.safeTitle_ + '」' + 'をウォッチリストに追加しました。');
  }
};


/**
 * @param {Element} el .
 */
app.ui.Detail.prototype.jumpToElement = function(el) {
  goog.asserts.assert(goog.dom.isElement(el), 'There must be');

  var rate = el.offsetTop / this.getScrollableRange();
  var slider = this.getSlider();
  slider.setValueFromStart(Math.max(slider.getMaximum() * rate, 0));
};


/**
 * @param {boolean=} isFirst If FALSE, unrender and update contnet.
 */
app.ui.Detail.prototype.clearContent = function(isFirst) {
  var dh = this.getDomHelper();
  var content = this.getContentElement();
  if (!isFirst) {
    this.prepareContent_(false);
  }
  content.appendChild(this.emptyMessageElement_ =
      dh.createDom('h2', 'detail-emptymessage', 'アイテムを選択してください'));
  if (!isFirst) this.update();
};


/**
 * @param {boolean} toShow .
 * @private
 */
app.ui.Detail.prototype.prepareContent_ = function(toShow) {
  var dh = this.getDomHelper();
  goog.style.showElement(this.titleElement_, toShow);
  dh.removeChildren(this.titleInnerElement_);
  dh.removeNode(this.emptyMessageElement_);
  dh.removeChildren(this.innerElement_);
  this.setZero();
};

