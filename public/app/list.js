
goog.provide('app.List');

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
  var data = /** @type {goog.ui.list.Data} */(e.target);
  goog.style.setElementShown(this.messageEl_, data.getTotal() == 0)
};

/**
 * @param {goog.Uri} url .
 * @param {number} rowCountPerPage .
 * @return {goog.ui.list.Data} .
 */
app.List.createData = function(url, rowCountPerPage) {
  // Url to request remote JSON Must be 20 because of Yahoo.
  var data = new goog.ui.list.Data(url, rowCountPerPage);
  data.setObjectNameTotalInJson('ResultSet.@attributes.totalResultsAvailable');
  data.setObjectNameRowsInJson('ResultSet.Result.Item');
  return data;
};




/**
 * @constructor
 * @param {Function=} opt_renderer .
 * @param {goog.dom.DomHelper=} opt_domHelper .
 * @extends {goog.ui.List.Item}
 */
app.List.Item = function(opt_renderer, opt_domHelper) {
  goog.base(this, app.soy.item.renderContent, opt_domHelper);
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

