
goog.provide('my.ui.ThousandRows');
goog.provide('my.ui.ThousandRows.Model');

goog.require('goog.ui.ThousandRows');
goog.require('goog.events.EventTarget');
goog.require('goog.ui.Tooltip');


/**
 * @constructor
 * @extends {goog.ui.ThousandRows}
 */
my.ui.ThousandRows = function (rowHeight, rowCountInPage, opt_domHelper) {
  goog.base(this, rowHeight, rowCountInPage, opt_domHelper);
  this.eventDelegate_ = new goog.events.EventTarget;
};
goog.inherits(my.ui.ThousandRows, goog.ui.ThousandRows)

/**
 * @enum {string}
 */
my.ui.ThousandRows.EventType = {
  ROW_CLICKED: 'rowclicked'
};

/**
 * @type {?string}
 */
my.ui.ThousandRows.prototype.selectedRowId_;

/**
 * @return {string}
 */
my.ui.ThousandRows.prototype.getSelectedRowId = function () {
  return this.selectedRowId_;
};

/**
 * This is only cache.
 * @type {?my.ui.ThousandRows.Row}
 */
my.ui.ThousandRows.prototype.selectedRow_;

/**
 * This can be null when scroll back, because it has already gone..
 * Then, we can find it ONLY when it is in the document.
 * @return {?my.ui.ThousandRows.Row}
 */
my.ui.ThousandRows.prototype.findSelectedRow_ = function () {

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
      return goog.array.find(page.getChildIds(), function (rowId) {
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
my.ui.ThousandRows.prototype.enterDocument = function () {
  this.getHandler()
    .listen(this.eventDelegate_, my.ui.ThousandRows.EventType.ROW_CLICKED, this.handleRowSelected_);
  goog.base(this, 'enterDocument');
};

my.ui.ThousandRows.prototype.handleRowSelected_ = function (e) {
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

my.ui.ThousandRows.prototype.makeRowSelected_ = function (row, enable) {
  goog.dom.classes.enable(row.getElement(), 'active', enable);
};

my.ui.ThousandRows.prototype.createPage_ = function (pageIndex) {
  return new my.ui.ThousandRows.Page(this.eventDelegate_, pageIndex,
        this.rowCountInPage_, this.rowHeight_, this.getDomHelper());
};

/** @inheritDoc */
my.ui.ThousandRows.prototype.disposeInternal = function () {
  if (this.eventDelegate_) {
    this.eventDelegate_.dispose();
    this.eventDelegate_ = null;
  }
  this.selectedRow_ = null;
  goog.base(this, 'disposeInternal');
};


/**
 * @constructor
 * @extends {goog.ui.thousandrows.Page}
 */
my.ui.ThousandRows.Page = function (eventDelegate, pageIndex, rowCount, rowHeight, opt_domHelper) {
  this.eventDelegate_ = eventDelegate;
  goog.base(this, pageIndex, rowCount, rowHeight, opt_domHelper);
};
goog.inherits(my.ui.ThousandRows.Page, goog.ui.thousandrows.Page);

/** @inheritDoc */
my.ui.ThousandRows.Page.prototype.createDom = function () {
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
my.ui.ThousandRows.Page.prototype.createRow_ = function (id, rowHeight) {
  return new my.ui.ThousandRows.Row(this.eventDelegate_, id, rowHeight,
      my.ui.ThousandRows.RowRenderer.getInstance(), this.getDomHelper());
};


/**
 * @param {string|number} rowIndex
 * @param {number} height
 * @param {goog.dom.DomHelper} opt_domHelper
 * @constructor
 * @extends {goog.ui.Component}
 */
my.ui.ThousandRows.Row = function (eventDelegate, rowIndex, height, opt_renderer, opt_domHelper) {
  this.eventDelegate_ = eventDelegate;
  goog.base(this, rowIndex, height, opt_renderer, opt_domHelper);
};
goog.inherits(my.ui.ThousandRows.Row, goog.ui.thousandrows.Row);

/**
 * @param {boolean} selected
 * @override
 */
my.ui.ThousandRows.Row.prototype.createDom = function (selected) {
  goog.base(this, 'createDom');
  if (selected) this.asSelected(true);
};

my.ui.ThousandRows.Row.prototype.asSelected = function (selected) {
  this.renderer_.asSelected(this, selected);
};

my.ui.ThousandRows.Row.prototype.enterDocument = function () {
  this.getHandler()
    .listen(this.getElement(), goog.events.EventType.CLICK, function (e) {
      // TODO: check whether the row's content rendered.
      // if (this.hasContentRendered_) {
      this.eventDelegate_.dispatchEvent({
        type: my.ui.ThousandRows.EventType.ROW_CLICKED,
        row: this
      });
    });
  goog.base(this, 'enterDocument');
};

my.ui.ThousandRows.Row.prototype.titleTooltip_;

my.ui.ThousandRows.Row.prototype.setTitleTooltip = function (string) {
  this.titleTooltip_ = new goog.ui.Tooltip(this.getElement(), string, this.getDomHelper());
  this.titleTooltip_.className += ' label label-info';
};

my.ui.ThousandRows.Row.prototype.disposeInternal = function () {
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
my.ui.ThousandRows.RowRenderer = function () {
  goog.base(this);
};
goog.inherits(my.ui.ThousandRows.RowRenderer, goog.ui.thousandrows.RowRenderer);
goog.addSingletonGetter(my.ui.ThousandRows.RowRenderer);


my.ui.ThousandRows.RowRenderer.prototype.asSelected = function (row, selected) {
  goog.dom.classes.enable(row.getElement(), 'active', selected);
};

/** @inheritDoc */
my.ui.ThousandRows.RowRenderer.prototype.createDom = function (row) {
  return row.getDomHelper().createDom('li', {
    className: [row.getCssName()]
    // style: 'height: ' + this.height_ + 'px'
  });
};


/** @inheritDoc */
my.ui.ThousandRows.RowRenderer.prototype.createContent = function (row, record) {
  var dh = row.getDomHelper();
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
          dh.createDom('div', '', '' + record['AuctionID']),
          dh.createDom('div', '', record['BidOrBuy'])
          
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
my.ui.ThousandRows.Model = function (uri, opt_totalRowCount, opt_updateTotalWithJson, opt_xhrManager) {
  goog.base(this, uri, opt_totalRowCount, opt_updateTotalWithJson, opt_xhrManager);
};
goog.inherits(my.ui.ThousandRows.Model, goog.ui.thousandrows.Model);

my.ui.ThousandRows.Model.prototype.extractTotalFromJson = function (json) {
  return json['ResultSet']['@attributes']['totalResultsAvailable'];
};

my.ui.ThousandRows.Model.prototype.extractRowsDataFromJson = function (json) {
  return json['ResultSet']['Result']['Item'];
};
