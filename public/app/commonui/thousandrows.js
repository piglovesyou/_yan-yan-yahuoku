
goog.provide('app.ui.ThousandRows');
goog.provide('app.ui.ThousandRows.Model');

goog.require('goog.ui.ThousandRows');
goog.require('goog.events.EventTarget');
goog.require('goog.ui.Tooltip');
goog.require('goog.date.relative');
goog.require('goog.date');


/**
 * @constructor
 * @extends {goog.ui.ThousandRows}
 */
app.ui.ThousandRows = function (rowHeight, rowCountInPage, opt_domHelper) {
  goog.base(this, rowHeight, rowCountInPage, opt_domHelper);
};
goog.inherits(app.ui.ThousandRows, goog.ui.ThousandRows)


/**
 * @enum {string}
 */
app.ui.ThousandRows.EventType = {
  ROW_CLICKED: 'rowclicked'
};


/**
 * @type {?string}
 */
app.ui.ThousandRows.prototype.selectedRowId_;


/**
 * @return {?string}
 */
app.ui.ThousandRows.prototype.getSelectedRowId = function () {
  return this.selectedRowId_;
};


/**
 * This is only cache.
 * @type {?app.ui.ThousandRows.Row}
 */
app.ui.ThousandRows.prototype.selectedRow_;


/** @inheritDoc */
app.ui.ThousandRows.prototype.setModel = function (model) {
  this.selectedRowId_ = null;
  goog.base(this, 'setModel', model);
};


/**
 * This can be null when scroll back, because it has already gone..
 * Then, we can find it ONLY when it is in the document.
 * @return {?app.ui.ThousandRows.Row}
 */
app.ui.ThousandRows.prototype.findSelectedRow_ = function () {

  // First, we use cache.
  if (this.selectedRow_ && !this.selectedRow_.isDisposed()) {
    return this.selectedRow_;
  }

  // Then, we search it (but can be none in the children).
  var selectedRowId = this.selectedRowId_;
  var foundRow = null;
  goog.array.find(this.getChildIds(), function (pageId) {
    var page = this.getChild(pageId);
    if (page) {
      return !!goog.array.find(page.getChildIds(), function (rowId) {
        var row = page.getChild(rowId);
        if (row && row.getId() == selectedRowId) {
          return !!(foundRow = row);
        }
        return false;
      }, page);
    }
    return false;
  }, this);
  if (foundRow) this.selectedRow_ = foundRow;
  return foundRow;
};


/** @inheritDoc */
app.ui.ThousandRows.prototype.enterDocument = function () {
  this.getHandler()
    .listen(this, app.ui.ThousandRows.EventType.ROW_CLICKED, this.handleRowSelected_);
  goog.base(this, 'enterDocument');
};


app.ui.ThousandRows.prototype.handleRowSelected_ = function (e) {
  var row = e.row;
  var oldRow = this.findSelectedRow_();
  if (oldRow) {
    if (oldRow.getId() == row.getId()) {
      return;
    }
    oldRow.asSelected(false);
  }
  this.selectedRowId_ = row.getId();
  this.selectedRow_ = row;
  row.asSelected(true);
};


app.ui.ThousandRows.prototype.makeRowSelected_ = function (row, enable) {
  goog.dom.classes.enable(row.getElement(), 'active', enable);
};


app.ui.ThousandRows.prototype.createPage_ = function (pageIndex) {
  return new app.ui.ThousandRows.Page(pageIndex,
        this.rowCountInPage_, this.rowHeight_, this.getDomHelper());
};


/** @inheritDoc */
app.ui.ThousandRows.prototype.disposeInternal = function () {
  this.selectedRow_ = null;
  goog.base(this, 'disposeInternal');
};




/**
 * @constructor
 * @extends {goog.ui.thousandrows.Page}
 */
app.ui.ThousandRows.Page = function (pageIndex, rowCount, rowHeight, opt_domHelper) {
  goog.base(this, pageIndex, rowCount, rowHeight, opt_domHelper);
};
goog.inherits(app.ui.ThousandRows.Page, goog.ui.thousandrows.Page);


/** @inheritDoc */
app.ui.ThousandRows.Page.prototype.createDom = function () {
  var dh = this.getDomHelper();
  var elm = this.getDomHelper().createDom('ul', [this.getCssName(), 'nav', 'nav-list']);
  this.setElementInternal(elm);

  var selectedRowId = this.getParent().getSelectedRowId();
	this.forEachChild(function (row) {
		row.createDom(selectedRowId == row.getId());
    dh.appendChild(this.getContentElement(), row.getElement());
	}, this);
};


/** @inheritDoc */
app.ui.ThousandRows.Page.prototype.createRow_ = function (id, rowHeight) {
  return new app.ui.ThousandRows.Row(id, rowHeight,
      app.ui.ThousandRows.RowRenderer.getInstance(), this.getDomHelper());
};




/**
 * @param {string|number} rowIndex
 * @param {number} height
 * @param {goog.dom.DomHelper} opt_domHelper
 * @constructor
 * @extends {goog.ui.thousandrows.Row}
 */
app.ui.ThousandRows.Row = function (rowIndex, height, opt_renderer, opt_domHelper) {
  goog.base(this, rowIndex, height, opt_renderer, opt_domHelper);
};
goog.inherits(app.ui.ThousandRows.Row, goog.ui.thousandrows.Row);


/** 
 * @param {boolean} selected
 * @override
 */
app.ui.ThousandRows.Row.prototype.createDom = function (selected) {
  goog.base(this, 'createDom');
  if (selected) this.asSelected(true);
};


app.ui.ThousandRows.Row.prototype.asSelected = function (selected) {
  this.renderer_.asSelected(this, selected);
};


app.ui.ThousandRows.Row.prototype.enterDocument = function () {
  this.getHandler()
    .listen(this.getElement(), goog.events.EventType.CLICK, function (e) {
      if (this.hasContent()) {
        this.dispatchEvent({
          type: app.ui.ThousandRows.EventType.ROW_CLICKED,
          row: this
        });
      }
    });
  goog.base(this, 'enterDocument');
};


/**
 * @type {?goog.ui.Tooltip}
 */
app.ui.ThousandRows.Row.prototype.titleTooltip_;


app.ui.ThousandRows.Row.prototype.setTitleTooltip = function (string) {
  if (this.titleTooltip_) {
    this.titleTooltip_.dispose();
  }
  this.titleTooltip_ = new goog.ui.Tooltip(this.getElement(), string, this.getDomHelper());
  this.titleTooltip_.className += ' label label-info';
};


/**
 * @type {?string}
 */
app.ui.ThousandRows.Row.prototype.auctionId_;


/**
 * @return {?string}
 */
app.ui.ThousandRows.Row.prototype.getAuctionId = function () {
  return this.auctionId_;
};


/** @inheritDoc */
app.ui.ThousandRows.Row.prototype.renderContent = function (record) {
  goog.base(this, 'renderContent', record);
  if (record) {
    this.auctionId_ = record['AuctionID'];
  }
};


app.ui.ThousandRows.Row.prototype.disposeInternal = function () {
  if (this.titleTooltip_) {
    this.titleTooltip_.dispose();
    this.titleTooltip_ = null;
  }
  goog.base(this, 'disposeInternal');
};




/**
 * @constructor
 * @extends {goog.ui.thousandrows.RowRenderer}
 */
app.ui.ThousandRows.RowRenderer = function () {
  goog.base(this);
};
goog.inherits(app.ui.ThousandRows.RowRenderer, goog.ui.thousandrows.RowRenderer);
goog.addSingletonGetter(app.ui.ThousandRows.RowRenderer);


app.ui.ThousandRows.RowRenderer.prototype.asSelected = function (row, selected) {
  goog.dom.classes.enable(row.getElement(), 'active', selected);
};


/** @inheritDoc */
app.ui.ThousandRows.RowRenderer.prototype.createDom = function (row) {
  var dh = row.getDomHelper()
  return dh.createDom('li', {
    className: [row.getCssName()]
    // style: 'height: ' + this.height_ + 'px'
  }, dh.createDom('a', 'row',
        dh.createDom('span', ['span3', 'goods-image'],
          dh.createDom('img', {
            className: 'img-polaroid',
            src: 'https://raw.github.com/piglovesyou/spacer.gif/master/spacer.gif'
          }))));
};


/** @inheritDoc */
app.ui.ThousandRows.RowRenderer.prototype.createContent = function (row, record) {
  var dh = row.getDomHelper();
  var esc = goog.string.htmlEscape;
  
  var html = '<strong>' + app.string.renderPrice(esc(record['CurrentPrice'])) + '</strong>';
  var bids = +record['Bids'];
  if (!isNaN(bids) && bids > 0) {
    html += ' | ';
    html += '入札 ' + bids;
  }
  html += ' | ';
  html += app.string.renderEndDate(esc(record['EndTime']));

  if (record['Option']) {
    html += '&nbsp;';
    goog.array.forEach(['EasyPaymentIcon', 'FeaturedIcon', 'GiftIcon'], function (k) {
      var url = record['Option'][k];
      if (url) html += '<img src=' + url + ' />';
    });
  }
  var fragment1 = dh.htmlToDocumentFragment(html);

  var element = 
      dh.createDom('a', {
            className: 'row',
            href: 'javascript:void(0)'
          },
          dh.createDom('a', ['span3', 'goods-image'], 
            dh.createDom('img', {
              className: 'img-polaroid',
              src: record['Image']
            })),
          dh.createDom('h4', null, row.getId() + ' ' + record['Title']),
          dh.createDom('div', 'row-detail', fragment1)
          
          );
  row.setTitleTooltip(record['Title']);
  return element;
};




/**
 * @param {string} uri Uri. Also used as xhr request id.
 * @param {number=} opt_totalRowCount
 * @param {boolean=} opt_updateTotalWithJson
 * @param {goog.net.XhrManager=} opt_xhrManager
 *
 * @constructor
 * @extends {goog.ui.thousandrows.Model}
 */
app.ui.ThousandRows.Model = function (uri, opt_totalRowCount, opt_updateTotalWithJson, opt_xhrManager) {
  goog.base(this, uri, opt_totalRowCount, opt_updateTotalWithJson, opt_xhrManager);
};
goog.inherits(app.ui.ThousandRows.Model, goog.ui.thousandrows.Model);


app.ui.ThousandRows.Model.prototype.buildUri_ = function (index, rowCountInPage) {
	var uri = goog.Uri.parse(this.uri_);
	uri.setParameterValue('page', index + 1);
	return uri.toString();
};


app.ui.ThousandRows.Model.prototype.extractTotalFromJson = function (json) {
  return json['ResultSet']['@attributes']['totalResultsAvailable'];
};


app.ui.ThousandRows.Model.prototype.extractRowsDataFromJson = function (json) {
  return json['ResultSet']['Result']['Item'];
};
