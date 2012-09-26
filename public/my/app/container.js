
goog.provide('my.app.Container');

goog.require('goog.ui.SplitPane');
goog.require('goog.style');
goog.require('my.ui.ThousandRows');
goog.require('my.app.Detail');
goog.require('my.Model');
goog.require('goog.Timer');


/**
 * @constructor
 * @extends {goog.ui.SplitPane}
 */
my.app.Container = function (opt_domHelper) {

  /**
   * @type {my.ui.ThousandRows}
   */
  this.thousandRows_ = this.createThousandRows_(opt_domHelper);

  /**
   * @type {my.app.Detail}
   */
  this.detail_ = new my.app.Detail(opt_domHelper);

  goog.base(this, this.thousandRows_, this.detail_, opt_domHelper);
  this.setHandleSize(0);

}
goog.inherits(my.app.Container, goog.ui.SplitPane);


my.app.Container.prototype.refreshByQuery = function (query, categoryId) {
  var old = this.thousandRows_.getModel();
  if (old) {
    old.dispose(); // TODO: Enable it to be used again.
  }
  var model = my.app.Container.createNewModel_(query, categoryId);
  this.thousandRows_.setModel(model);
  this.detail_.clearContent();
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
      this.detail_.update();
    })
    .listen(this, my.ui.ThousandRows.EventType.ROW_CLICKED, this.handleRowClicked_)
    .listen(this, goog.ui.SplitPane.EventType.HANDLE_DRAG_END, function (e) {
      this.detail_.update();
    })
    .listen(this.resizeTimer_, goog.Timer.TICK, this.handleResizeTimerTick_);

  this.resize_();
  goog.base(this, 'enterDocument');

  // First request by thousand rows.
  var frame = this.getParent();
  goog.asserts.assert(frame instanceof my.app.Frame, 'Wrong Parent to container!!');
  var tab = my.Model.getInstance().getTabQuery(frame.getId());
  this.refreshByQuery(tab['query'], tab['category']['id']);
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
 * @type {goog.Timer}
 */
my.app.Container.prototype.resizeTimer_ = new goog.Timer(100);


/**
 * Resize splitPane layout on delay.
 * We don't use setSize() because we want to resize 
 *    based on this.detailPaneElement_.offsetWidth.
 */
my.app.Container.prototype.resize_ = function () {
  if (this.resizeTimer_.enabled) {
    this.resizeTimer_.stop();
  }
  this.resizeTimer_.start();
};


my.app.Container.prototype.handleResizeTimerTick_ = function (e) {
  this.resizeTimer_.stop();
  var size = my.dom.ViewportSizeMonitor.getInstance().getSize();
  size.height -= this.getOffsetTop_();
  goog.style.setBorderBoxSize(this.getElement(), size);
  this.setFirstComponentSize(size.width - this.detailPaneElement_.offsetWidth);
  
  var iframeOverlay = this.getIframeOverlay_();
  if (iframeOverlay) {
    goog.style.setBorderBoxSize(iframeOverlay, size);
  }
};


/**
 * He is private.. So we grab and cache him.
 * @type {?Element}
 */
my.app.Container.prototype.iframeOverlayCache_;


/**
 * @return {?Element}
 */
my.app.Container.prototype.getIframeOverlay_ = function () {
  if (this.iframeOverlayCache_) return this.iframeOverlayCache_;

  var last = goog.dom.getLastElementChild(this.getElement());
  if (!last.className) return this.iframeOverlayCache_ = last; // He must be..

  return  null;
};


/**
 * @type {my.ui.ThousandRows.Model}
 */
my.app.Container.prototype.thousandRowsModel_;


my.app.Container.prototype.createThousandRows_ = function (opt_domHelper) {
  var thousandRows = new my.ui.ThousandRows(138, 50, opt_domHelper);
  thousandRows.setMinThumbLength(30);
  return thousandRows;
};


my.app.Container.createNewModel_ = function (query, categoryId) {
  var endPoint = query ? '/api/search' : '/api/categoryLeaf';
  var uri = new goog.Uri(endPoint); // goog.Uri.create escape its argument.. Why?
  var q = uri.getQueryData();
  if (query) q.set('query', query);
  if (goog.isDefAndNotNull(categoryId)) {
    q.set('category', categoryId);
  }
  return new my.ui.ThousandRows.Model(uri.toString(), undefined, true);
};

