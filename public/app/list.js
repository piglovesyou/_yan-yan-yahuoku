
goog.provide('app.List');
goog.provide('app.list.Data');

goog.require('goog.ui.List');
goog.require('goog.ui.list.Data');
goog.require('app.soy.row');


/**
 * @constructor
 * @extends {goog.ui.List}
 */
app.List = function () {
  goog.base(this, app.soy.row.renderContent, 25, null);
};
goog.inherits(app.List, goog.ui.List);


/**
 * @param {string} url .
 * @param {number=} opt_totalRowCount .
 * @param {boolean=} opt_keepTotalUptodate .
 * @param {goog.net.XhrManager=} opt_xhrManager .
 * @constructor
 * @extends {goog.events.EventTarget}
 */
app.list.Data = function (url,
    opt_totalRowCount, opt_keepTotalUptodate, opt_xhrManager) {
  goog.base(this, url,
    opt_totalRowCount, opt_keepTotalUptodate, opt_xhrManager);
};
goog.inherits(app.list.Data, goog.ui.list.Data);

app.list.Data.prototype.buildUrl = function(from, count) {
  var url = goog.Uri.parse(goog.base(this, 'buildUrl', from, count));
  url.setParameterValue('query', '靴下');
  return url.toString();
}
