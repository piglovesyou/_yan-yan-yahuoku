
goog.provide('app.controller.Detail');

goog.require('goog.ui.SplitPane');
goog.require('goog.style');
goog.require('app.ui.ThousandRows');
goog.require('goog.ui.ToggleButton');
goog.require('app.controller.util');


/**
 * @constructor
 * @extends {goog.ui.Scroller}
 */
app.controller.Detail = function (opt_domHelper) {
  goog.base(this, 'vertical', opt_domHelper);
}
goog.inherits(app.controller.Detail, goog.ui.Scroller);

/**
 * @type {app.controller.Detail.TitleFixedStateButton}
 */
app.controller.Detail.prototype.titleFixedStateButton_;

app.controller.Detail.prototype.emptyMessageElement_;
app.controller.Detail.prototype.titleElement_;
app.controller.Detail.prototype.titleInnerElement_;
app.controller.Detail.prototype.buttonsContainerElement_;
app.controller.Detail.prototype.innerElement_;


app.controller.Detail.prototype.updateTitleFixedState_ = function () {
  var dh = this.getDomHelper();

  var fixed = app.model.getDetailTitleFixedState(app.controller.util.getFrameId(this));
  goog.dom.classes.enable(this.getElement(), 'detail-title-fixed', fixed);
  dh.insertChildAt(fixed ? this.getElement() : this.getContentElement(), this.titleElement_, 0);
};


app.controller.Detail.prototype.createDom = function () {
  goog.base(this, 'createDom');
  var dh = this.getDomHelper();

  var fixed = app.model.getDetailTitleFixedState(app.controller.util.getFrameId(this));
  this.titleFixedStateButton_ = new app.controller.Detail.TitleFixedStateButton(dh);
  this.addChild(this.titleFixedStateButton_);
  var titleFixedStateButtonElement;

  dh.append(this.getContentElement(),
      this.titleElement_ = dh.createDom('h5', {className: 'detail-title', style: 'display:none'},
        this.buttonsContainerElement_ = dh.createDom('div', 'detail-title-buttons',
            titleFixedStateButtonElement = 
              dh.createDom('a', 'goog-button btn i detail-title-fixedstatebutton', fixed ? 'n' : 'q')),
        this.titleInnerElement_ = dh.createDom('div', 'detail-title-inner')),
      this.innerElement_ = dh.createDom('div', 'detail-inner'));

  this.titleFixedStateButton_.decorateInternal(titleFixedStateButtonElement);

  this.clearContent(true);
  this.updateTitleFixedState_();
};


app.controller.Detail.prototype.renderContent = function (data) {
  var dh = this.getDomHelper();
  var container = this.getContentElement();
  this.prepareContent_(true);

  dh.append(this.titleInnerElement_,
      dh.createDom('a', {
        target: '_blank',
        href: data['AuctionItemUrl']
      }, dh.createTextNode(data['Title'] + ' '), dh.createDom('i', 'icon-share-alt')));
  
  var images = dh.createDom('div', {className: 'detail-images', 'style':'text-align:center'}); 
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


  var description = dh.createDom('p', null, dh.htmlToDocumentFragment(data['Description']));

  var detailTable = 
      dh.createDom('table', 'table table-hover table-condensed',
        // dh.createDom('caption', null, 'caption......'),
        dh.createDom('tbody', null,
          dh.createDom('tr', null,
            dh.createDom('th', null, '個数'), dh.createDom('td', null, data['Quantity'])),
          dh.createDom('tr', null,
            dh.createDom('th', null, '開始時の価格'), dh.createDom('td', null, data['Price'])),
          dh.createDom('tr', null,
            dh.createDom('th', null, '開始日時'), dh.createDom('td', null, data['StartTime'])),
          dh.createDom('tr', null,
            dh.createDom('th', null, '終了日時'), dh.createDom('td', null, data['EndTime'])),
          dh.createDom('tr', null,
            dh.createDom('th', null, '早期終了'), dh.createDom('td', null, data['Price'])),
          dh.createDom('tr', null,
            dh.createDom('th', null, '自動延長'), dh.createDom('td', null, data['Price'])),
          dh.createDom('tr', null,
            dh.createDom('th', null, '商品の状態'), dh.createDom('td', null, data['Price'])),
          dh.createDom('tr', null,
            dh.createDom('th', null, '返品の可否'), dh.createDom('td', null, data['Price']))
        )
      );

  var paymentTable = 
      dh.createDom('table', 'table table-bordered table-condensed',
        // dh.createDom('caption', null, 'caption......'),
        dh.createDom('tbody', null,
          dh.createDom('tr', null,
            dh.createDom('th', {'rowspan':2}, '決済方法'), 
            dh.createDom('td', {'colspan':2}, 
              dh.htmlToDocumentFragment('Yahoo!簡単決済' + 
                (data['Payment']['EasyPayment']['IsCreditCard']=='true' ? '<br> - クレジットカード決済':'') +
                (data['Payment']['EasyPayment']['IsNetBank']=='true' ? '<br> - 銀行ネット決済':'')
              )
            )
          ),
          (data['Payment']['Bank'] && +data['Payment']['Bank']['@attributes']['totalBankMethodAvailable']>=1) ?
            dh.createDom('tr', null,
              dh.createDom('td', {style:'width:60px'}, '銀行振込'),
              dh.createDom('td', 'detail-td-tablecontainer',
                dh.createDom('table', 'table table-condensed',
                  dh.createDom('tbody', null,
                    dh.createDom('tr', null,
                      dh.createDom('th', null, '対応できる銀行'), 
                      dh.createDom('td', null, data['Payment']['Bank']['Method'])
                    )
                  )
                )
              )
            ):null
        )
      );

  var senddetailTable = 
      dh.createDom('table', 'table table-bordered table-condensed',
        dh.createDom('tbody', null,
          dh.createDom('tr', null,
            dh.createDom('th', null, '送料負担'), dh.createDom('td', null, (data['ChargeForShipping']=='winner'?'落札者':'出品者'))
          ),
          data['Location'] ?
            dh.createDom('tr', null,
               dh.createDom('th', null, '商品発送元地域'), dh.createDom('td', null, data['Location'])
            )
          :null,
          dh.createDom('tr', null,
            dh.createDom('th', null, '海外発送'), dh.createDom('td', null, data['IsWorldwide']=='true'?'可':'不可')
          )
        )
      );
            
  var shippingTable = (data['Shipping'] && +data['Shipping']['@attributes']['totalShippingMethodAvailable']>=1) ?
      dh.createDom('table', 'table table-bordered table-condensed',
        dh.createDom('tbody', null,
          dh.createDom('tr', null,
            dh.createDom('th', null, '配送方法'), dh.createDom('td', null, data['Shipping']['Method']['Name'])
          )
        )
      ):null;

  var descriptionContainer = dh.createDom('div', 'detail-description-container',
      description,
      detailTable,
      paymentTable,
      senddetailTable,
      shippingTable);

  dh.append(this.innerElement_, images, descriptionContainer);
};


/** @inheritDoc */
app.controller.Detail.prototype.enterDocument = function () {
  goog.base(this, 'enterDocument');
  this.getHandler().listen(this, goog.ui.Component.EventType.ACTION, function (e) {
    this.updateTitleFixedState_();
  });
};


/**
 * @param {boolean=} isFirst If FALSE, unrender and update contnet.
 */
app.controller.Detail.prototype.clearContent = function (isFirst) {
  var dh = this.getDomHelper();
  var content = this.getContentElement();
  if (!isFirst) {
    this.prepareContent_(false);
  }
  content.appendChild(this.emptyMessageElement_ =
      dh.createDom('h2', { 'style': 'color:lightgray;text-align:center' },
        'アイテムを選択してください'));
  if (!isFirst) this.update();
};


app.controller.Detail.prototype.prepareContent_ = function (toShow) {
  var dh = this.getDomHelper();
  goog.style.showElement(this.titleElement_, toShow);
  dh.removeChildren(this.titleInnerElement_);
  dh.removeNode(this.emptyMessageElement_);
  dh.removeChildren(this.innerElement_);
};




app.controller.Detail.TitleFixedStateButton = function (opt_domHelper) {
  goog.base(this, '', app.ui.ButtonRenderer.getInstance(), opt_domHelper);
};
goog.inherits(app.controller.Detail.TitleFixedStateButton, goog.ui.ToggleButton);

app.controller.Detail.TitleFixedStateButton.prototype.setChecked = function (checked) {
  goog.base(this, 'setChecked', checked);
  app.model.setDetailTitleFixedState(app.controller.util.getFrameId(this), checked);
  this.setContent(checked ? 'n' : 'q');
};

app.controller.Detail.TitleFixedStateButton.prototype.decorateInternal = function (element) {
  goog.base(this, 'decorateInternal', element);
  this.setState(goog.ui.Component.State.CHECKED,
      app.model.getDetailTitleFixedState(app.controller.util.getFrameId(this)));
};

app.controller.Detail.TitleFixedStateButton.prototype.enterDocument = function () {
  goog.base(this, 'enterDocument');
  this.getHandler().listen(this.getElement(), goog.events.EventType.MOUSEDOWN, function (e) {
    // Prevent that a parent node steels focus.
    e.stopPropagation();
  });
};
