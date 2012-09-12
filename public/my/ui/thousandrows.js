
goog.provide('my.ui.ThousandRows');
goog.provide('my.ui.ThousandRows.Model');

goog.require('goog.ui.ThousandRows');
goog.require('goog.ui.Tooltip');


/**
 * @constructor
 * @extends {goog.ui.ThousandRows}
 */
my.ui.ThousandRows = function (rowHeight, rowCountInPage, opt_domHelper) {
  goog.base(this, rowHeight, rowCountInPage, opt_domHelper);
};
goog.inherits(my.ui.ThousandRows, goog.ui.ThousandRows)

my.ui.ThousandRows.prototype.createPage_ = function (pageIndex) {
  return new my.ui.ThousandRows.Page(pageIndex,
        this.rowCountInPage_, this.rowHeight_, this.getDomHelper());
};

/**
 * @constructor
 * @extends {goog.ui.thousandrows.Page}
 */
my.ui.ThousandRows.Page = function (pageIndex, rowCount, rowHeight, opt_domHelper) {
  goog.base(this, pageIndex, rowCount, rowHeight, opt_domHelper);
};
goog.inherits(my.ui.ThousandRows.Page, goog.ui.thousandrows.Page);

my.ui.ThousandRows.Page.prototype.createRow_ = function (id, rowHeight) {
  return new my.ui.ThousandRows.Row(id, rowHeight,
      my.ui.ThousandRows.RowRenderer.getInstance(), this.getDomHelper());
};


/**
 * @param {string|number} rowIndex
 * @param {number} height
 * @param {goog.dom.DomHelper} opt_domHelper
 * @constructor
 * @extends {goog.ui.Component}
 */
my.ui.ThousandRows.Row = function (rowIndex, height, opt_renderer, opt_domHelper) {
  goog.base(this, rowIndex, height, opt_renderer, opt_domHelper);
};
goog.inherits(my.ui.ThousandRows.Row, goog.ui.thousandrows.Row);

my.ui.ThousandRows.Row.prototype.titleTooltip_;

my.ui.ThousandRows.Row.prototype.setTitleTooltip = function (titleElm, string) {
  this.titleTooltip_ = new goog.ui.Tooltip(titleElm, string, this.getDomHelper());
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


/** @inheritDoc */
my.ui.ThousandRows.RowRenderer.prototype.createDom = function (row) {
  return row.getDomHelper().createDom('div', {
    className: [row.getCssName()]
    // style: 'height: ' + this.height_ + 'px'
  });
};


/** @inheritDoc */
my.ui.ThousandRows.RowRenderer.prototype.createContent = function (row, record) {
  var dh = row.getDomHelper();
  var h4;
  var element = dh.createDom('div', 'row',
            dh.createDom('a', ['span3', 'goods-image'], 
              dh.createDom('img', {
                className: 'img-polaroid',
                src: record['Image']
              })),
            h4 = dh.createDom('h4', null, record['Title']),
              dh.createDom('div', 'row-col row-index', '' + record['AuctionID']));
  row.setTitleTooltip(h4, record['Title']);
  return element;
};


/**
 * @param {string} id For root dataSource.
 * @param {string} uri Uri. Also used as xhr request id.
 * @param {number=} opt_totalRowCount
 * @param {boolean=} opt_updateTotalWithJson
 * @param {goog.net.XhrManager=} opt_xhrManager
 *
 * @constructor
 * @extends {goog.ui.thousandrows.Model}
 */
my.ui.ThousandRows.Model = function (id, uri, opt_totalRowCount, opt_updateTotalWithJson, opt_xhrManager) {
  goog.base(this, id, uri, opt_totalRowCount, opt_updateTotalWithJson, opt_xhrManager);
};
goog.inherits(my.ui.ThousandRows.Model, goog.ui.thousandrows.Model);

my.ui.ThousandRows.Model.prototype.extractTotalFromJson = function (json) {
  return json['ResultSet']['@attributes']['totalResultsAvailable'];
};

my.ui.ThousandRows.Model.prototype.extractRowsDataFromJson = function (json) {
  return json['ResultSet']['Result']['Item'];
};
