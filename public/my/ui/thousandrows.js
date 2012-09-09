
goog.provide('my.ui.ThousandRows');
goog.provide('my.ui.ThousandRows.Model');

goog.require('goog.ui.ThousandRows');


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
  return new goog.ui.thousandrows.Row(id, rowHeight,
      my.ui.ThousandRows.RowRenderer.getInstance(), this.getDomHelper());
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
  return dh.createDom('div', 'row',
            dh.createDom('a', ['span3', 'goods-image'], 
              dh.createDom('img', {
                className: 'img-polaroid',
                src: record['Image']
              })),
            dh.createDom('h4', {
              title: record['Title']
            }, record['Title']),
            dh.createDom('div', 'row-col row-index', '' + record['AuctionID']));
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
