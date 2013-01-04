
goog.provide('app.ui.Detail');

goog.require('app.ui.ContextMenu');
goog.require('app.ui.Message');
goog.require('app.ui.ThousandRows');
goog.require('app.ui.common.ButtonRenderer');
goog.require('app.ui.util');
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
 * @type {app.ui.Detail.FixedStateButton}
 */
app.ui.Detail.prototype.titleFixedStateButton_;


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


/**
 * @private
 */
app.ui.Detail.prototype.updateTitleFixedState_ = function() {
  var dh = this.getDomHelper();
  var fixed = app.model.getDetailTitleFixedState(app.ui.util.getTabId(this));
  goog.dom.classes.enable(this.getElement(), 'detail-title-fixed', fixed);
  dh.insertChildAt(fixed ? this.getElement() : this.getContentElement(),
                   this.titleElement_, 0);
};


/** @inheritDoc */
app.ui.Detail.prototype.createDom = function() {
  goog.base(this, 'createDom');
  var dh = this.getDomHelper();

  var fixed = app.model.getDetailTitleFixedState(app.ui.util.getTabId(this));
  this.titleFixedStateButton_ = new app.ui.Detail.FixedStateButton(dh);
  this.addChild(this.titleFixedStateButton_);
  var titleFixedStateButtonElement;

  var content = this.getContentElement();
  goog.asserts.assert(content, 'should be.');
  dh.append(content,
      this.titleElement_ =
        dh.createDom('h5', {className: 'detail-title', style: 'display:none'},
          this.buttonsContainerElement_ =
            dh.createDom('div', 'detail-title-buttons',
              titleFixedStateButtonElement =
                dh.createDom('a',
                             'goog-button btn i detail-title-fixedstatebutton',
                             fixed ? 'n' : 'q')),
        this.titleInnerElement_ = dh.createDom('div', 'detail-title-inner')),
      this.innerElement_ = dh.createDom('div', 'detail-inner'));

  this.titleFixedStateButton_.decorateInternal(titleFixedStateButtonElement);

  this.clearContent(true);
  this.updateTitleFixedState_();
};


/**
 * Do I wand goog.string.format?
 * @param {Object} data Json data of auction item.
 */
app.ui.Detail.prototype.renderContent = function(data) {
  var dh = this.getDomHelper();
  var esc = goog.string.htmlEscape;
  var ref; // Temporary reference.

  var container = this.getContentElement();
  this.prepareContent_(true);

  this.auctionId_ = esc(data['AuctionID']);

  var safe_link = this.safeItemLink_ =
    app.string.createAuctionItemLink(esc(data['AuctionItemUrl']));
  var safe_title = this.safeTitle_ = esc(data['Title']);
  dh.append(/** @type {Element} */(this.titleInnerElement_),
      app.ui.Detail.createItemLink_(safe_link, safe_title, dh));

  var images = dh.createDom('div', {
    className: 'detail-images',
    style: 'text-align:center' //TODO: Write CSS.
  });
  var imageCount = 0;
  var self = this;
  goog.object.forEach(data['Img'], function(url) {
    imageCount++;
    images.appendChild(dh.createDom('img', {
      'src': esc(url),
      'onload': function() {
        if (--imageCount == 0) {
          self.update();
        }
      }
    }));
  });

  var primaryTable =
      dh.createDom('table', 'table table-hover',
        // dh.createDom('caption', null, 'caption......'),
        dh.createDom('tbody', null,
          dh.createDom('tr', null,
            dh.createDom('th', null, '現在の価格'),
            dh.createDom('td', null, app.string.renderPrice(esc(data['Price'])))
          ),
          goog.string.isNumeric(data['Bidorbuy']) ?
            dh.createDom('tr', null,
              dh.createDom('th', null, '即決価格'),
              dh.createDom('td', null,
                           app.string.renderPrice(esc(data['Bidorbuy'])))
            ) : null,
          dh.createDom('tr', null,
            dh.createDom('th', null, '残り時間'),
            dh.createDom('td', null,
                         app.string.renderEndDate(esc(data['EndTime'])))
          ),
          goog.string.isNumeric(data['Bids']) ?
            dh.createDom('tr', null,
              dh.createDom('th', null, '入札件数'),
              dh.createDom('td', null, esc(data['Bids']))
            ) : null
        )
      );

  // I believe Yahoo doesn't hurt me but..
  var safeDescription = goog.string.contains(data['Description'], '<script') ?
      data['Description'].replace(/<script[\s\S]+?\/script>/gi, '') :
        data['Description'];
  var description = dh.createDom('p', null,
                                 dh.htmlToDocumentFragment(safeDescription));

  var subTable =
      dh.createDom('table', 'table table-hover table-condensed',
        // dh.createDom('caption', null, 'caption......'),
        dh.createDom('tbody', null,
          dh.createDom('tr', null,
            dh.createDom('th', null, '個数'),
            dh.createDom('td', null, esc(data['Quantity']))),
          dh.createDom('tr', null,
            dh.createDom('th', null, '開始時の価格'),
            dh.createDom('td', null,
                         app.string.renderPrice(esc(data['InitPrice'])))),
          dh.createDom('tr', null,
            dh.createDom('th', null, '開始日時'),
            dh.createDom('td', null,
                         app.string.renderDate(esc(data['StartTime'])))),
          dh.createDom('tr', null,
            dh.createDom('th', null, '終了日時'),
            dh.createDom('td', null,
                         app.string.renderDate(esc(data['EndTime'])))),
          dh.createDom('tr', null,
            dh.createDom('th', null, '早期終了'),
            dh.createDom('td', null,
                         app.string.renderBoolean(data['IsEarlyClosing']))),
          dh.createDom('tr', null,
            dh.createDom('th', null, '自動延長'),
            dh.createDom('td', null,
                       app.string.renderBoolean(data['IsAutomaticExtension']))),
          data['ItemStatus'] ?
            dh.createDom('tr', null,
              dh.createDom('th', null, '商品の状態'),
              dh.createDom('td', null,
                app.string.renderItemCondition(data['ItemStatus']['Condition']))
            ) : null,
          data['ItemReturnable'] ?
            dh.createDom('tr', null,
              dh.createDom('th', null, '返品の可否'),
              dh.createDom('td', null,
                app.string.renderBoolean(data['ItemReturnable']['Allowed']))
            ) : null
        )
      );

  // TODO: data['ShipTime']
  var paymentTable = data['Payment'] ?
      dh.createDom('table', 'table table-bordered table-condensed',
        // dh.createDom('caption', null, 'caption......'),
        dh.createDom('tbody', null,
          (ref = data['Payment']['EasyPayment']) ?
            dh.createDom('tr', null,
              dh.createDom('th', {'rowspan': 2}, '決済方法'),
              dh.createDom('td', {'colspan': 2},
                dh.htmlToDocumentFragment('Yahoo!簡単決済' +
                  (ref['IsCreditCard'] == 'true' ?
                      '<br> - クレジットカード決済' : '') +
                  (ref['IsNetBank'] == 'true' ?
                      '<br> - 銀行ネット決済' : '')
                )
              )
            ) : null,
          ((ref = data['Payment']['Bank']) &&
           +ref['@attributes']['totalBankMethodAvailable'] >= 1) ?
            dh.createDom('tr', null,
              dh.createDom('td', {style: 'width:60px'}, '銀行振込'),
              dh.createDom('td', 'detail-td-tablecontainer',
                dh.createDom('table', 'table table-condensed',
                  dh.createDom('tbody', null,
                    dh.createDom('tr', null,
                      dh.createDom('th', null, '対応できる銀行'),
                      dh.createDom('td', null, ref['Method'])
                    )
                  )
                )
              )
            ) : null
        )
      ) : null;

  var senddetailTable =
      dh.createDom('table', 'table table-bordered table-condensed',
        dh.createDom('tbody', null,
          dh.createDom('tr', null,
            dh.createDom('th', null, '送料負担'),
            dh.createDom('td', null,
              (data['ChargeForShipping'] == 'winner' ? '落札者' : '出品者'))
          ),
          data['Location'] ?
            dh.createDom('tr', null,
               dh.createDom('th', null, '商品発送元地域'),
               dh.createDom('td', null, data['Location'])
            ) : null,
          dh.createDom('tr', null,
            dh.createDom('th', null, '海外発送'),
            dh.createDom('td', null, data['IsWorldwide'] == 'true' ? '可' : '不可')
          )
        )
      );

  var shippingTable =
    (ref = data['Shipping'] &&
     +ref['@attributes']['totalShippingMethodAvailable'] >= 1) ?
      dh.createDom('table', 'table table-bordered table-condensed',
        dh.createDom('tbody', null,
          dh.createDom('tr', null,
            dh.createDom('th', null, '配送方法'),
            dh.createDom('td', null, data['Shipping']['Method']['Name'])
          )
        )
      ) : null;

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
            this.imagesElementRef_ = images, descriptionContainer);
  this.update();
};


/**
 * @param {string} safe_link .
 * @param {string} safe_title .
 * @param {goog.dom.DomHelper} dh .
 * @return {Element} .
 * @private
 */
app.ui.Detail.createItemLinkParagraph_ = function(safe_link, safe_title, dh) {
  return dh.createDom('p', 'detail-item-link',
          app.ui.Detail.createItemLink_(safe_link, safe_title, dh));
};


/**
 * @param {string} safe_link .
 * @param {string} safe_title .
 * @param {goog.dom.DomHelper} dh .
 * @return {Element} .
 * @private
 */
app.ui.Detail.createItemLink_ = function(safe_link, safe_title, dh) {
  return dh.createDom('a', {
           target: '_blank',
           href: safe_link
         },
         dh.createTextNode(safe_title + ' '),
         dh.createDom('span', 'i i-text', 'o'));
};


/** @inheritDoc */
app.ui.Detail.prototype.enterDocument = function() {
  goog.base(this, 'enterDocument');

  var tab = app.ui.util.getTab(this);
  this.getHandler().listen(
    app.events.EventCenter.getInstance(),
    app.events.EventCenter.EventType.TAB_CHANGED, function(e) {
      if (!tab.isSelected()) return;
      this.titleFixedStateButton_.setChecked(
        app.model.getDetailTitleFixedState(app.ui.util.getTabId(this)));
      this.updateTitleFixedState_();
    });
  this.getHandler().listen(
    this, goog.ui.Component.EventType.ACTION, function(e) {
      this.updateTitleFixedState_();
    });
};


/** @inheritDoc */
app.ui.Detail.prototype.performActionInternal = function(e) {
  if (e.type == goog.events.EventType.MOUSEUP &&
      app.dom.getAncestorFromEventTargetByClass(this.getElement(),
        'goog-scroller-bar', e.target) == this.getElement()) {
    this.enableMenuEvents_(true);
    app.ui.ContextMenu.getInstance().launch(e, app.ui.Detail.MenuRecords_);
  }
  goog.base(this, 'performActionInternal', e);
};


/**
 * @const
 * @type {Array}
 * @private
 */
app.ui.Detail.MenuRecords_ = [
  {content: 'o', key: 'goToAuction', desc: 'オークションの商品ページを表示します'},
  {content: 'A', key: 'showPicture', desc: '写真を表示します'},
  {content: 'K', key: 'showDesc', desc: '商品説明を表示します'},
  {content: 'J', key: 'showDetail', desc: '価格、残り時間を表示します'},
  {content: 'E', key: 'addWatchList', desc: 'この商品をウォッチリストに追加します'}
];


/**
 * @param {boolean} enable .
 * @private
 */
app.ui.Detail.prototype.enableMenuEvents_ = function(enable) {
  var menu = app.ui.ContextMenu.getInstance();
  var eh = this.getHandler();
  var fn = enable ? eh.listen : eh.unlisten;
  fn.call(eh, menu, app.ui.ContextMenu.EventTarget.DISMISS,
          this.handleMenuDismiss_);
  fn.call(eh, menu, app.ui.ContextMenu.EventTarget.SELECT,
          this.handleMenuSelect_);
};


/**
 * @param {goog.events.Event} e .
 * @private
 */
app.ui.Detail.prototype.handleMenuDismiss_ = function(e) {
  this.enableMenuEvents_(false);
};


/**
 * @param {goog.events.Event} e .
 * @private
 */
app.ui.Detail.prototype.handleMenuSelect_ = function(e) {
  switch (e.record.key) {
    case 'goToAuction':
      if (this.safeItemLink_) goog.window.open(this.safeItemLink_);
      break; // TODO:
    case 'showPicture': this.jumpToElement(this.imagesElementRef_); break;
    case 'showDesc': this.jumpToElement(this.descriptionElementRef_); break;
    case 'showDetail': this.jumpToElement(this.tableElementRef_); break;
    case 'addWatchList': app.model.addWatchList(this.auctionId_,
                            this.handleCompleteAddWatchList_, this); break;
  }
};


/**
 * @param {?goog.net.Xhrio} err .
 * @param {?Object} response .
 * @private
 */
app.ui.Detail.prototype.handleCompleteAddWatchList_ = function(err, response) {
  if (err) {
    // TODO: Shorter method is better.
    // TODO: Link text wants `popup' icon.
    app.message.error('ウォッチリストに追加できませんでした。<a href="javascript:app.ui.common.AuthWindow.getInstance().launch(true);">認証</a>する必要があります。');
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

  var top = el.offsetTop;
  if (this.titleFixedStateButton_.isChecked()) {
    top - - this.titleElement_.offsetHeight;
  }
  var rate = top / this.getScrollableRange();
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




/**
 * @param {?goog.dom.DomHelper=} opt_domHelper .
 * @constructor
 * @extends {goog.ui.ToggleButton}
 */
app.ui.Detail.FixedStateButton = function(opt_domHelper) {
  goog.base(this, '', app.ui.common.ButtonRenderer.getInstance(),
            opt_domHelper);
};
goog.inherits(app.ui.Detail.FixedStateButton, goog.ui.ToggleButton);


/**
 * @param {boolean} checked .
 */
app.ui.Detail.FixedStateButton.prototype.setChecked = function(checked) {
  goog.base(this, 'setChecked', checked);
  app.model.setDetailTitleFixedState(checked);
  this.setContent(checked ? 'n' : 'q');
};


/** @inheritDoc */
app.ui.Detail.FixedStateButton.prototype.decorateInternal = function(element) {
  goog.base(this, 'decorateInternal', element);
  this.setState(goog.ui.Component.State.CHECKED,
                app.model.getDetailTitleFixedState());
};


/** @inheritDoc */
app.ui.Detail.FixedStateButton.prototype.enterDocument = function() {
  goog.base(this, 'enterDocument');
  this.getHandler().listen(this.getElement(),
                           goog.events.EventType.MOUSEDOWN, function(e) {
    // Prevent that a parent node steels focus.
    e.stopPropagation();
  });
};


/** @inheritDoc */
app.ui.Detail.FixedStateButton.prototype.disposeInternal = function() {
  if (this.titleFixedStateButton_) {
    this.titleFixedStateButton_.dispose();
    this.titleFixedStateButton_ = null;
  }
  goog.base(this, 'disposeInternal');
};
