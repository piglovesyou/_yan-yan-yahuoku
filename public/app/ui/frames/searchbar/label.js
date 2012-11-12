
goog.provide('app.ui.searchbar.Label');

goog.require('goog.ui.Component');
goog.require('goog.string.format');


/**
 * @constructor
 * @extends {goog.ui.Component}
 */
app.ui.searchbar.Label = function (opt_domHelper) {
  goog.base(this, opt_domHelper);
};
goog.inherits(app.ui.searchbar.Label, goog.ui.Component);


/** @inheritDoc */
app.ui.searchbar.Label.prototype.enterDocument = function () {
  goog.base(this, 'enterDocument');
  var tab = app.ui.util.getTab(this);
  this.getHandler().listen(tab.getThousandRows(), goog.ui.ThousandRows.EventType.UPDATE_TOTAL, function (e) {
    var q = app.model.getTabQuery(tab.getId());
    var total = app.model.getAlignmentStyle(app.ui.util.getTabId(this)) ?
        e.total * app.ui.common.ThousandRows.ModelForGrid.gridCols_ : e.total;
    this.updateContent(total, q['query'], q['category']['CategoryPath']);
  });
};


/**
 */
app.ui.searchbar.Label.prototype.updateContent = function (total, query, category) {
  this.clearContent();

  var dh = this.getDomHelper();
  var text = '';

  if (goog.isDefAndNotNull(total)) {
    text += goog.string.format('&nbsp;<strong>%s</strong> 件を表示&nbsp;&nbsp;&nbsp;<small>',
          app.string.toDecimal(+goog.string.htmlEscape(total)));
  }
  if (goog.isDefAndNotNull(query) && !goog.string.isEmpty(query)) {
    text += goog.string.htmlEscape(query);
  }
  if (goog.isDefAndNotNull(category) && !goog.string.isEmpty(category)) {
    text += goog.string.format(' [%s]', goog.string.htmlEscape(category));
  }
  text += '</small>';

  var element = this.getElement();
  goog.asserts.assert(element, 'There must be.');
  dh.append(element, dh.htmlToDocumentFragment(text));
};


app.ui.searchbar.Label.prototype.clearContent = function () {
  this.getDomHelper().removeChildren(this.getElement());
};


app.ui.searchbar.Label.prototype.createDom = function () {
  var dh = this.getDomHelper();
  var element = dh.createDom('div', 'searchbar-label muted');
  this.setElementInternal(element);
};

