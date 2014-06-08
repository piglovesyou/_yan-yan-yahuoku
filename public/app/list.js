
goog.provide('app.List');
goog.provide('app.list.Data');

goog.require('app.soy.item');
goog.require('goog.ui.List');
goog.require('goog.ui.list.Data');
goog.require('app.soy.list');


/**
 * @constructor
 * @extends {goog.ui.List}
 */
app.List = function() {
  goog.base(this, app.List.Item, 20, null);
};
goog.inherits(app.List, goog.ui.List);

/**
 * @param {goog.Uri} url .
 */
app.List.prototype.search = function(url) {
  this.setData(app.List.createData(url, this.rowCountPerPage));
  if (this.isInDocument()) {
    this.redraw();
  }
};

/** @inheritDoc */
app.List.prototype.createDom = function() {
  goog.base(this, 'createDom');
  goog.dom.classes.add(this.getElement(),
      'pane-list goog-splitpane-first-container');
  this.getElement().appendChild(this.messageEl_ = 
      goog.soy.renderAsFragment(app.soy.list.message));
};

/** @inheritDoc */
app.List.prototype.handleTotalUpdate = function(e) {
  goog.base(this, 'handleTotalUpdate', e);
  var data = /** @type {app.list.Data} */(e.target);
  goog.style.setElementShown(this.messageEl_, data.getTotal() == 0)
};

/**
 * @param {goog.Uri} url .
 * @param {number} rowCountPerPage .
 * @return {app.list.Data} .
 */
app.List.createData = function(url, rowCountPerPage) {
  // Url to request remote JSON Must be 20 because of Yahoo.
  var data = new app.list.Data(url, rowCountPerPage);
  data.setObjectNameTotalInJson('ResultSet.@attributes.totalResultsAvailable');
  data.setObjectNameRowsInJson('ResultSet.Result.Item');
  return data;
};




/**
 * @constructor
 * @param {number} index .
 * @param {Function=} opt_renderer .
 * @param {goog.dom.DomHelper=} opt_domHelper .
 * @extends {goog.ui.List.Item}
 */
app.List.Item = function(index, opt_renderer, opt_domHelper) {
  goog.base(this, index, app.soy.item.renderContent, opt_domHelper);
};
goog.inherits(app.List.Item, goog.ui.List.Item);


/** @inheritDoc */
app.List.Item.prototype.createDom = function() {
  var element =
      /** @type {Element} */(goog.soy.renderAsFragment(app.soy.item.createDom));
  var dh = this.getDomHelper();
  this.setElementInternal(element);
  // element.setAttribute('index', this.index_);
};


/** @inheritDoc */
app.List.Item.prototype.renderContent = function(data) {
  goog.dom.classes.enable(this.getElement(),
      'pane-list-item-selected', data['isSelected']);
  goog.base(this, 'renderContent', data);
};



/**
 * @param {string|goog.Uri} url .
 * @param {number} rowCountPerPage .
 * @param {number=} opt_totalRowCount .
 * @param {boolean=} opt_keepTotalUptodate .
 * @param {goog.net.XhrManager=} opt_xhrManager .
 * @constructor
 * @extends {goog.ui.list.Data}
 */
app.list.Data = function(url, rowCountPerPage,
    opt_totalRowCount, opt_keepTotalUptodate, opt_xhrManager) {

  /**
   * We have to create "page" parameter..
   */
  this.rowCountPerPage = rowCountPerPage;

  goog.base(this, url,
    opt_totalRowCount, opt_keepTotalUptodate, opt_xhrManager);
};
goog.inherits(app.list.Data, goog.ui.list.Data);

/** @inheritDoc */
app.list.Data.prototype.buildUrl = function(from, count) {
  var url = this.url.clone();

  var pageIndex = from % this.rowCountPerPage ?
      count : from / this.rowCountPerPage;

  url.setParameterValue('page', pageIndex + 1);
  return url.toString();
};
