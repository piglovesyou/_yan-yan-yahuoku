
goog.provide('app.ui.common.ThousandRows');
goog.provide('app.ui.common.ThousandRows.Model');

goog.require('goog.ui.ThousandRows');
goog.require('goog.events.EventTarget');
goog.require('goog.ui.Tooltip');
goog.require('goog.date.relative');
goog.require('goog.date');


/**
 * @param {number} rowHeight
 * @param {number} rowCountInPage
 * @param {?goog.ui.Scroller.ORIENTATION=} opt_orient
 * @param {goog.dom.DomHelper=} opt_domHelper
 * @constructor
 * @extends {goog.ui.ThousandRows}
 */
app.ui.common.ThousandRows = function (rowHeight, rowCountInPage, opt_orient, opt_domHelper) {
  goog.base(this, rowHeight, rowCountInPage, opt_orient, opt_domHelper);
  this.setDispatchTransitionEvents(goog.ui.Component.State.FOCUSED, true);
};
goog.inherits(app.ui.common.ThousandRows, goog.ui.ThousandRows)


/**
 * @enum {string}
 */
app.ui.common.ThousandRows.EventType = {
  ROW_CLICKED: 'rowclicked',
  COL_CLICKED: 'colclicked'
};


/**
 * @type {?string}
 */
app.ui.common.ThousandRows.prototype.selectedRowId_;


/**
 * @return {?string}
 */
app.ui.common.ThousandRows.prototype.getSelectedRowId = function () {
  return this.selectedRowId_;
};


/**
 * This is only cache of a reference.
 * @type {?app.ui.common.ThousandRows.Row}
 */
app.ui.common.ThousandRows.prototype.selectedRow_;


/**
 * @type {?string}
 */
app.ui.common.ThousandRows.prototype.selectedColId_;


/**
 * This is only cache of a reference.
 * @type {?app.ui.common.ThousandRows.RowColumn}
 */
app.ui.common.ThousandRows.prototype.selectedCol_;


/**
 * @type {number}
 */
app.ui.common.ThousandRows.prototype.selectedColIndex_ = -1;


/**
 * @type {?boolean} Cache of grid alignment flag.
 */
app.ui.common.ThousandRows.prototype.isGrid_;


/**
 * @param {string} id
 * @return {?app.ui.common.ThousandRows.Page}
 */
app.ui.common.ThousandRows.prototype.getChild;


/**
 * @param {number} index
 * @return {?app.ui.common.ThousandRows.Page}
 */
app.ui.common.ThousandRows.prototype.getChildAt;


/**
 * @return {number}
 */
app.ui.common.ThousandRows.prototype.getSelectedColIndex = function () {
  return this.selectedColIndex_;
};


/**
 * @return {boolean}
 */
app.ui.common.ThousandRows.prototype.isGrid = function () {
  return !!this.isGrid_;
};


/** @inheritDoc */
app.ui.common.ThousandRows.prototype.setModel = function (model) {
  this.selectedRowId_ =
    this.selectedRow_ =
    this.selectedColId_ = null;
  this.selectedColIndex_ = -1;
  goog.base(this, 'setModel', model);
};


app.ui.common.ThousandRows.prototype.updateAlignment = function () {
  var isGrid = this.isGrid_ = app.model.getAlignmentStyle(app.ui.util.getTabId(this));
  goog.dom.classes.enable(this.getElement(), 'isListAlignment', !isGrid);
  goog.dom.classes.enable(this.getElement(), 'isGridAlignment', isGrid);
};


/**
 * This can be null when scroll back, because it has already gone..
 * So, we can find it ONLY when it is in the document.
 * @return {?app.ui.common.ThousandRows.Row}
 */
app.ui.common.ThousandRows.prototype.findSelectedRow_ = function () {

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
  return this.selectedRow_ = foundRow;
};


/** @inheritDoc */
app.ui.common.ThousandRows.prototype.enterDocument = function () {
  this.getHandler()
    .listen(this, app.ui.common.ThousandRows.EventType.ROW_CLICKED, this.handleRowSelected_)
    .listen(this, app.ui.common.ThousandRows.EventType.COL_CLICKED, this.handleColSelected_);
  goog.base(this, 'enterDocument');
};


app.ui.common.ThousandRows.prototype.handleColSelected_ = function (e) {
  var newRow = e.row;
  var newCol = e.col
  if (!newRow || !newCol) return;

  var oldRow = this.findSelectedRow_();
  if (oldRow && goog.isDefAndNotNull(this.selectedColId_)) {
    // We must have the last selected col here.
    var oldCol = oldRow.getChild(this.selectedColId_);
    if (oldCol) {
      if (oldRow.getId() == newRow.getId() &&
          oldCol.getId() == newCol.getId()) return; 
      oldCol.asSelected(false);
    }
  }
  // To find the last selected row, we need them.
  this.selectedRowId_ = newRow.getId();
  this.selectedRow_ = newRow;

  this.selectedColId_ = newCol.getId();
  this.selectedCol_ = newCol;
  this.selectedColIndex_ = e.colIndex;
  newCol.asSelected(true);
};


/**
 * Same as findSelectedRow_.
 * @return {?app.ui.common.ThousandRows.RowColumn}
 */
app.ui.common.ThousandRows.prototype.findSelectedCol_ = function () {
  if (this.selectedCol_ && !this.selectedCol_.isDisposed()) {
    return this.selectedCol_;
  }
  var oldRow = this.findSelectedRow_();
  if (oldRow) {
    var selectedColId = this.selectedColId_;
    if (selectedColId) return oldRow.getChild(selectedColId);
  }
  return null;
};


app.ui.common.ThousandRows.prototype.handleRowSelected_ = function (e) {
  var row = e.row;
  var oldRow = this.findSelectedRow_();
  if (oldRow) {
    if (oldRow.getId() == row.getId()) return; 
    oldRow.asSelected(false);
  }
  this.selectedRowId_ = row.getId();
  this.selectedRow_ = row;
  row.asSelected(true);
};


app.ui.common.ThousandRows.prototype.makeRowSelected_ = function (row, enable) {
  goog.dom.classes.enable(row.getElement(), 'active', enable);
};


app.ui.common.ThousandRows.prototype.createPage_ = function (pageIndex) {
  return new app.ui.common.ThousandRows.Page(pageIndex,
        this.rowCountInPage_, this.rowHeight_, this.getDomHelper());
};


app.ui.common.ThousandRows.prototype.clearContent = function () {
  goog.array.forEach(this.removeChildren(), function (child) {
    child.dispose();
  });
};


/** @inheritDoc */
app.ui.common.ThousandRows.prototype.disposeInternal = function () {
  this.selectedRow_ = null;
  goog.base(this, 'disposeInternal');
};




/**
 * @constructor
 * @extends {goog.ui.thousandrows.Page}
 */
app.ui.common.ThousandRows.Page = function (pageIndex, rowCount, rowHeight, opt_domHelper) {
  goog.base(this, pageIndex, rowCount, rowHeight, opt_domHelper);
};
goog.inherits(app.ui.common.ThousandRows.Page, goog.ui.thousandrows.Page);


/**
 * @param {string} id
 * @return {?app.ui.common.ThousandRows.Row}
 */
app.ui.common.ThousandRows.Page.prototype.getChild;


/**
 * @param {number} index
 * @return {?app.ui.common.ThousandRows.Row}
 */
app.ui.common.ThousandRows.Page.prototype.getChildAt;


/** @inheritDoc */
app.ui.common.ThousandRows.Page.prototype.createDom = function () {
  var dh = this.getDomHelper();
  var elm = this.getDomHelper().createDom('ul', [this.getCssName(), 'nav', 'nav-list']);
  this.setElementInternal(elm);

  var parent = this.getParent();
  var isGrid = parent.isGrid();
  var selectedRowId =  parent.getSelectedRowId();
	this.forEachChild(function (row) {
    // If grid, we don't need to make row selectd.
		row.createDom(!isGrid && row.getId() == selectedRowId);
    dh.appendChild(this.getContentElement(), row.getElement());
	}, this);
};


/** @inheritDoc */
app.ui.common.ThousandRows.Page.prototype.createRow_ = function (id, rowHeight) {
  return new app.ui.common.ThousandRows.Row(id, rowHeight,
      app.ui.common.ThousandRows.RowRenderer.getInstance(), this.getDomHelper());
};




/**
 * @param {string|number} rowIndex
 * @param {number} height
 * @param {goog.dom.DomHelper} opt_domHelper
 * @constructor
 * @extends {goog.ui.thousandrows.Row}
 */
app.ui.common.ThousandRows.Row = function (rowIndex, height, opt_renderer, opt_domHelper) {
  goog.base(this, rowIndex, height, opt_renderer, opt_domHelper);
};
goog.inherits(app.ui.common.ThousandRows.Row, goog.ui.thousandrows.Row);


/**
 * @param {string} id
 * @return {?app.ui.common.ThousandRows.RowColumn}
 */
app.ui.common.ThousandRows.Row.prototype.getChild;


/**
 * @param {number} index
 * @return {?app.ui.common.ThousandRows.RowColumn}
 */
app.ui.common.ThousandRows.Row.prototype.getChildAt;


/**
 * @return {boolean}
 */
app.ui.common.ThousandRows.Row.prototype.isGrid_ = function() {
  return this.getParent().getParent().isGrid();
};


/** 
 * @override
 * @param {boolean} selected
 */
app.ui.common.ThousandRows.Row.prototype.createDom = function (selected) {
  goog.base(this, 'createDom');
  if (selected) this.asSelected(true);
};


/**
 * @param {boolean} selected
 */
app.ui.common.ThousandRows.Row.prototype.asSelected = function (selected) {
  this.renderer_.asSelected(this, selected);
};


/** @inheritDoc */
app.ui.common.ThousandRows.Row.prototype.enterDocument = function () {
  this.getHandler()
    .listen(this.getElement(), goog.events.EventType.CLICK, function (e) {
      if (this.hasContent()) {
        if (!this.isGrid_()) {
          this.dispatchEvent({
            type: app.ui.common.ThousandRows.EventType.ROW_CLICKED,
            row: this
          });
        } else {
          var col = this.getColumnFromEventTarget_(e.target);
          if (col) {
            // TODO: A column can have index as its id as wel as page and row.
            var index = this.getColIndex_(col);
            this.dispatchEvent({
              type: app.ui.common.ThousandRows.EventType.COL_CLICKED,
              row: this,
              col: col,
              colIndex: index
            });
          }
        }
      }
    });
  goog.base(this, 'enterDocument');
};


app.ui.common.ThousandRows.Row.prototype.getColIndex_ = function (col) {
  var colId = col.getId();
  var index = -1;
  goog.array.forEach(this.getChildIds(), function (id, i) {
    if (colId == id) {
      index = i;
      return true;
    }
  });
  return index;
};


/**
 * @param {?Node} et
 * @return {?Node}
 */
app.ui.common.ThousandRows.Row.prototype.getColumnFromEventTarget_ = function (et) {
  et = app.dom.getAncestorFromEventTargetByClass(this.getElement(), 'grid-col', et);
  if (!et) return null;

  var col;
  goog.array.find(this.getChildIds(), function (id) {
    var child = this.getChild(id);
    if (child && child.getElement() == et) return !!(col = child);
    return false;
  }, this);
  return col || null;
};


/**
 * @type {?goog.ui.Tooltip}
 */
app.ui.common.ThousandRows.Row.prototype.titleTooltip_;


app.ui.common.ThousandRows.Row.prototype.setTitleTooltip = function (string) {
  if (this.titleTooltip_) {
    this.titleTooltip_.dispose();
  }
  this.titleTooltip_ = new goog.ui.Tooltip(this.getElement(), string, this.getDomHelper());
  this.titleTooltip_.className += ' label label-info';
};


/**
 * @param {Object} record
 */
app.ui.common.ThousandRows.Row.prototype.renderContent_ = function (record) {
  var dh;
  var stuff;

  if (!goog.isArray(record)) {
    stuff = this.renderer_.renderContent(this, record);

  } else {
    // Grid alignment
    dh = this.getDomHelper();
    stuff = dh.createDom('div', {
      className: 'row',
      href: 'javascript:void(0)',
      tabIndex: -1
    });

    var thousandrows = this.getParent().getParent()
    var hasSelectedCol = this.getId() == thousandrows.getSelectedRowId();
    var selectedColIndex = thousandrows.getSelectedColIndex();

    goog.array.forEach(record, function (r, index) {
      var col = new app.ui.common.ThousandRows.RowColumn(dh);
      this.addChild(col);
      col.createDom(r);
      if (hasSelectedCol && index == selectedColIndex) col.asSelected(true);
      dh.append(stuff, col.getElement());
      col.enterDocument();
    }, this);
  }
  this.getDomHelper().appendChild(/** @type {!Node} */
      (this.getContentElement()), stuff);
};


/**
 * @type {?string}
 */
app.ui.common.ThousandRows.Row.prototype.auctionId_;


/**
 * @return {?string}
 */
app.ui.common.ThousandRows.Row.prototype.getAuctionId = function () {
  return this.auctionId_;
};


/** @inheritDoc */
app.ui.common.ThousandRows.Row.prototype.renderContent = function (record) {
  goog.base(this, 'renderContent', record);
  if (record && record['AuctionID']) {
    this.auctionId_ = record['AuctionID'];
  }
};


app.ui.common.ThousandRows.Row.prototype.disposeInternal = function () {
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
app.ui.common.ThousandRows.RowRenderer = function () {
  goog.base(this);
};
goog.inherits(app.ui.common.ThousandRows.RowRenderer, goog.ui.thousandrows.RowRenderer);
goog.addSingletonGetter(app.ui.common.ThousandRows.RowRenderer);


/**
 * @param {app.ui.common.ThousandRows.Row} row
 * @param {boolean} selected
 */
app.ui.common.ThousandRows.RowRenderer.prototype.asSelected = function (row, selected) {
  goog.dom.classes.enable(row.getElement(), 'active', selected);
};


/** @inheritDoc */
app.ui.common.ThousandRows.RowRenderer.prototype.createDom = function (row) {
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


/**
 * @override
 * @param {app.ui.common.ThousandRows.Row} row
 * @param {Object|Array} record If grid, array will be passed.
 */
app.ui.common.ThousandRows.RowRenderer.prototype.renderContent = function (row, record) {
  var dh = row.getDomHelper();
  var esc = goog.string.htmlEscape;
  var element;
  
  // if (!goog.isArray(record)) {
  var detailFragment = this.createDetailFragment(row, record, true);
  element = 
      dh.createDom('a', {
            className: 'row',
            href: 'javascript:void(0)',
            tabIndex: -1
          },
          dh.createDom('a', ['span3', 'goods-image'], 
            dh.createDom('img', {
              className: 'img-polaroid',
              src: record['Image']
            })),
          dh.createDom('h4', null, record['Title']),
          dh.createDom('div', 'row-detail', detailFragment)
          
          );
  row.setTitleTooltip(record['Title']);

  // } else {
  //   element = dh.createDom('div', 'row');
  //   goog.array.forEach(record, function (r) {
  //     dh.append(element, this.createColmun_(row, r));
  //   }, this);
  // }

  return element;
};


/**
 * @param {app.ui.common.ThousandRows.Row} row
 * @param {Object} record
 * @param {boolean=} icons
 */
app.ui.common.ThousandRows.RowRenderer.prototype.createDetailFragment = function (row, record, icons) {
  var dh = row.getDomHelper();
  var esc = goog.string.htmlEscape;
  var html = '<strong>' + app.string.renderPrice(esc(record['CurrentPrice'])) + '</strong>';
  if (goog.string.isNumeric(record['Bids']) && +record['Bids']>=1) {
    html += ' | ';
    html += '入札 ' + record['Bids'];
  }
  html += ' | ';
  html += app.string.renderEndDate(esc(record['EndTime']));

  if (icons && record['Option']) {
    html += '&nbsp;';
    goog.array.forEach(['EasyPaymentIcon', 'FeaturedIcon', 'GiftIcon'], function (k) {
      var url = record['Option'][k];
      if (url) html += '<img src=' + url + ' />';
    });
  }
  return dh.htmlToDocumentFragment(html);
};






/**
 * @constructor
 * @extends {goog.ui.Component}
 */
app.ui.common.ThousandRows.RowColumn = function (opt_domHelper) {
  goog.base(this, opt_domHelper);
  
  this.renderer_ = app.ui.common.ThousandRows.RowColumnRenderer.getInstance();
};
goog.inherits(app.ui.common.ThousandRows.RowColumn, goog.ui.Component);


/**
 * @type {?string}
 */
app.ui.common.ThousandRows.RowColumn.prototype.auctionId_;


/**
 * @override
 * @param {Object} record
 */
app.ui.common.ThousandRows.RowColumn.prototype.createDom = function (record) {
  var element = this.renderer_.createDom(this, record);
  this.setElementInternal(element);
  this.auctionId_ = record['AuctionID'];
};


/**
 * @return {?string}
 */
app.ui.common.ThousandRows.RowColumn.prototype.getAuctionId = function () {
  return this.auctionId_;
};


app.ui.common.ThousandRows.RowColumn.prototype.asSelected =
    app.ui.common.ThousandRows.Row.prototype.asSelected;



/**
 * @constructor
 */
app.ui.common.ThousandRows.RowColumnRenderer = function () {};
goog.addSingletonGetter(app.ui.common.ThousandRows.RowColumnRenderer);


/**
 * @param {Object} record
 */
app.ui.common.ThousandRows.RowColumnRenderer.prototype.createDom = function (col, record) {
  var dh = col.getDomHelper();
  var element = dh.createDom('a', {
                    'className': 'grid-col span',
                    'href': 'javascript:void(0)',
                    'tabIndex': -1
                  },
                  dh.createDom('a', 'goods-image',
                    dh.createDom('img', {
                      className: 'img-polaroid',
                      src: record['Image']
                    })),
                  dh.createDom('div', 'row-detail',
                    this.createDetailFragment(col, record)));
  return element;
};


/**
 * @override
 * @param {app.ui.common.ThousandRows.RowColumn} col
 * @param {Object} record
 * @param {boolean=} icons
 */
app.ui.common.ThousandRows.RowColumnRenderer.prototype.createDetailFragment = 
    app.ui.common.ThousandRows.RowRenderer.prototype.createDetailFragment;


/**
 * @override
 * @param {app.ui.common.ThousandRows.RowColumn} col
 * @param {boolean} selected
 */
app.ui.common.ThousandRows.RowColumnRenderer.prototype.asSelected =
    app.ui.common.ThousandRows.RowRenderer.prototype.asSelected;








/**
 * @param {string} uri Uri. Also used as xhr request id.
 * @param {number=} opt_totalRowCount
 * @param {boolean=} opt_updateTotalWithJson
 * @param {goog.net.XhrManager=} opt_xhrManager
 *
 * @constructor
 * @extends {goog.ui.thousandrows.Model}
 */
app.ui.common.ThousandRows.Model = function (uri, opt_totalRowCount, opt_updateTotalWithJson, opt_xhrManager) {
  goog.base(this, uri, opt_totalRowCount, opt_updateTotalWithJson, opt_xhrManager);
};
goog.inherits(app.ui.common.ThousandRows.Model, goog.ui.thousandrows.Model);


app.ui.common.ThousandRows.Model.prototype.buildUri_ = function (index, rowCountInPage) {
	var uri = goog.Uri.parse(this.uri_);
	uri.setParameterValue('page', index + 1);
	return uri.toString();
};


app.ui.common.ThousandRows.Model.prototype.extractTotalFromJson = function (json) {
  return json['ResultSet']['@attributes']['totalResultsAvailable'] || 0;
};


app.ui.common.ThousandRows.Model.prototype.extractRowsDataFromJson = function (json) {
  var result = json['ResultSet']['Result'];
  if (result) {
    if (goog.isArray(result['Item'])) return result['Item'];
    // Damn YAPI, if result count is only 1, result['Item'] is a record object itself.
    if (goog.isObject(result['Item']) && result['Item']['AuctionID']) return [result['Item']];
  }
  return [];
};




/**
 * @param {string} uri
 * @param {number=} opt_totalRowCount
 * @param {boolean=} opt_updateTotalWithJson
 * @param {goog.net.XhrManager=} opt_xhrManager
 *
 * @constructor
 * @extends {app.ui.common.ThousandRows.Model}
 */
app.ui.common.ThousandRows.ModelForGrid = function (uri, opt_totalRowCount, opt_updateTotalWithJson, opt_xhrManager) {
  goog.base(this, uri, opt_totalRowCount, opt_updateTotalWithJson, opt_xhrManager);
};
goog.inherits(app.ui.common.ThousandRows.ModelForGrid, app.ui.common.ThousandRows.Model);


app.ui.common.ThousandRows.ModelForGrid.gridCols_ = 4;


app.ui.common.ThousandRows.ModelForGrid.prototype.extractRowsDataFromJson = function (json) {
  var items = goog.base(this, 'extractRowsDataFromJson', json);
  var rows = [];
  while (items && !goog.array.isEmpty(items)) {
    rows.push(items.splice(0, app.ui.common.ThousandRows.ModelForGrid.gridCols_));
  }
  return rows;
};

app.ui.common.ThousandRows.ModelForGrid.prototype.getTotal = function () {
  // TODO: How do I ? For now, the last row is not shown in a container.
  return Math.ceil(this.totalDs_.get() / app.ui.common.ThousandRows.ModelForGrid.gridCols_);
};
