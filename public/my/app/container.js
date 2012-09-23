
goog.provide('my.app.Container');

goog.require('goog.ui.SplitPane');
goog.require('goog.style');
goog.require('my.ui.ThousandRows');
goog.require('my.app.Detail');
goog.require('my.Model');


/**
 * @constructor
 * @extends {goog.ui.SplitPane}
 */
my.app.Container = function (opt_domHelper) {

  /**
   * @type {my.ui.ThousandRows}
   */
  this.thousandRows_ = my.app.Container.createThousandRows_(opt_domHelper);

  /**
   * @type {my.app.Detail}
   */
  this.detail_ = new my.app.Detail(opt_domHelper);

  goog.base(this, this.thousandRows_, this.detail_, opt_domHelper);
  this.setHandleSize(0);

}
goog.inherits(my.app.Container, goog.ui.SplitPane);


my.app.Container.prototype.refreshByQuery = function (query) {
  var old = this.thousandRows_.getModel();
  old.dispose(); // TODO: Enable it to be used again.
  var model = my.app.Container.createNewModel_(query);
  this.thousandRows_.setModel(model);
};


my.app.Container.prototype.createDom = function () {
  goog.base(this, 'createDom');
  var dh = this.getDomHelper();
  this.detailPaneElement_ = this.getElementByClass('goog-splitpane-second-container');
  dh.appendChild(this.getElementByClass('goog-splitpane-handle'),
      dh.createDom('div', 'handle',
        dh.createDom('div', 'handle-content')));
};


my.app.Container.prototype.enterDocument = function () {
  this.getHandler()
    .listen(my.dom.ViewportSizeMonitor.getInstance(), goog.events.EventType.RESIZE, function (e) {
      this.resize_();
      this.thousandRows_.update();
    })
    .listen(this, my.ui.ThousandRows.EventType.ROW_CLICKED, this.handleRowClicked_)
    .listen(this, goog.ui.SplitPane.EventType.HANDLE_DRAG_END, function (e) {
      this.detail_.update();
    });
  this.resize_();
  goog.base(this, 'enterDocument');
};

/**
 * @type {?number}
 */
my.app.Container.prototype.offsetTopCache_;

my.app.Container.prototype.handleRowClicked_ = function (e) {
  var id = e.row.getAuctionId();
  if (id) {
    my.Model.getInstance().getAuctionItem(id, function (err, data) {
      if (!err) this.detail_.renderContent(data);
    }, this);
  }
};

/**
 * @return {number}
 */
my.app.Container.prototype.getOffsetTop_ = function () {
  return this.offsetTopCache_ || (this.offsetTopCache_ = this.getElement().offsetTop);
};


my.app.Container.prototype.resize = function () {
  this.resize_();
};


/**
 * We don't use setSize() because we want to resize 
 *    based on this.detailPaneElement_.offsetWidth.
 */
my.app.Container.prototype.resize_ = function () {
  var size = my.dom.ViewportSizeMonitor.getInstance().getSize();
  size.height -= this.getOffsetTop_();
  goog.style.setBorderBoxSize(this.getElement(), size);
  this.setFirstComponentSize(size.width - this.detailPaneElement_.offsetWidth);
};


/**
 * @type {my.ui.ThousandRows.Model}
 */
my.app.Container.prototype.thousandRowsModel_;


my.app.Container.createThousandRows_ = function (opt_domHelper) {
  var thousandRows = new my.ui.ThousandRows(138, 50, opt_domHelper);
  thousandRows.setMinThumbLength(30);
  var model = my.app.Container.createNewModel_('kate+spade'); // TODO: What to do?
  thousandRows.setModel(model)
  return thousandRows;
};


my.app.Container.createNewModel_ = function (query) {
  return new my.ui.ThousandRows.Model('/api/search?query=' + query, undefined, true);
};

