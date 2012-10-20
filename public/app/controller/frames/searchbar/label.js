
goog.provide('app.controller.searchbar.Label');

goog.require('goog.ui.Component');
goog.require('goog.string.format');


/**
 * @constructor
 * @extends {goog.ui.Component}
 */
app.controller.searchbar.Label = function (opt_domHelper) {
  goog.base(this, opt_domHelper);
};
goog.inherits(app.controller.searchbar.Label, goog.ui.Component);


app.controller.searchbar.Label.prototype.enterDocument = function () {
  goog.base(this, 'enterDocument');
  var tab = app.controller.util.getTab(this);
  this.getHandler().listen(tab.getThousandRows(), goog.ui.ThousandRows.EventType.UPDATE_TOTAL, function (e) {
    var q = app.model.getTabQuery(tab.getId());
    this.updateContent(e.total, q['query'], q['category']['CategoryPath']);
  });
};


/**
 */
app.controller.searchbar.Label.prototype.updateContent = function (total, query, category) {
  var dh = this.getDomHelper();
  var text = '';
  if (goog.isDefAndNotNull(total))    text += goog.string.format('&nbsp;<strong>%d</strong> 件を表示&nbsp;&nbsp;&nbsp;<small>', goog.string.htmlEscape(total));
  if (goog.isDefAndNotNull(query))    text += goog.string.htmlEscape(query);
  if (goog.isDefAndNotNull(category)) text += goog.string.format(' [%s]', goog.string.htmlEscape(category));
  text += '</small>';

  dh.append(this.getElement(), dh.htmlToDocumentFragment(text));
};


app.controller.searchbar.Label.prototype.clearContent = function () {
  this.getDomHelper().removeChildren(this.getElement());
};


app.controller.searchbar.Label.prototype.createDom = function () {
  var dh = this.getDomHelper();
  var element = dh.createDom('div', 'searchbar-label muted');
  this.setElementInternal(element);
};

