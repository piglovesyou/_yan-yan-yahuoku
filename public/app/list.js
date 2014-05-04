
goog.provide('app.List');
goog.provide('app.list.Data');

goog.require('app.soy.row');
goog.require('goog.ui.List');
goog.require('goog.ui.list.Data');


/**
 * @constructor
 * @extends {goog.ui.List}
 */
app.List = function() {
  goog.base(this, app.List.Item, 20, null);
};
goog.inherits(app.List, goog.ui.List);

app.List.prototype.search = function(url) {
  this.setData(app.List.createData(url));
  if (this.isInDocument()) {
    this.redraw();
  }
};

/**
 * @param {goog.Uri} url .
 */
app.List.createData = function(url) {
  var data = new app.list.Data(url, '/items/search'); // Url to request remote JSON
                                                 // Must be 20 because of Yahoo.
  data.setObjectNameTotalInJson('ResultSet.@attributes.totalResultsAvailable');
  data.setObjectNameRowsInJson('ResultSet.Result.Item');
  return data;
};




/**
 * @constructor
 * @param {number} index .
 * @param {Function=} opt_renderer .
 * @param {goog.dom.DomHelper=} opt_domHelper .
 * @extends {goog.ui.Component}
 */
app.List.Item = function(index, opt_renderer, opt_domHelper) {
  goog.base(this, index, app.soy.row.renderContent, opt_domHelper);
};
goog.inherits(app.List.Item, goog.ui.List.Item);


/** @inheritDoc */
app.List.Item.prototype.createDom = function() {
  var element = goog.soy.renderAsFragment(app.soy.row.createDom);
  var dh = this.getDomHelper();
  this.setElementInternal(element);
};



/**
 * @param {string} url .
 * @param {number=} opt_totalRowCount .
 * @param {boolean=} opt_keepTotalUptodate .
 * @param {goog.net.XhrManager=} opt_xhrManager .
 * @constructor
 * @extends {goog.events.EventTarget}
 */
app.list.Data = function(url,
    opt_totalRowCount, opt_keepTotalUptodate, opt_xhrManager) {

  goog.base(this, url,
    opt_totalRowCount, opt_keepTotalUptodate, opt_xhrManager);
};
goog.inherits(app.list.Data, goog.ui.list.Data);

app.list.Data.prototype.buildUrl = function(from, count) {
  var url = goog.Uri.parse(this.url_);
  url.setParameterValue('page', Math.floor(from / count) + 1);
  return url.toString();
};
