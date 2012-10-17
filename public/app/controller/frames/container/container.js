
goog.provide('app.controller.Container');

goog.require('goog.ui.SplitPane');
goog.require('goog.style');
goog.require('app.ui.ThousandRows');
goog.require('app.controller.Detail');
goog.require('app.Model');
goog.require('goog.Timer');


/**
 * @constructor
 * @extends {goog.ui.SplitPane}
 */
app.controller.Container = function (opt_domHelper) {

  /**
   * @type {app.ui.ThousandRows}
   */
  this.thousandRows_ = app.controller.Container.createThousandRows_(opt_domHelper);

  /**
   * @type {app.controller.Detail}
   */
  this.detail_ = new app.controller.Detail(opt_domHelper);

  goog.base(this, this.thousandRows_, this.detail_, opt_domHelper);
  this.setHandleSize(0);

}
goog.inherits(app.controller.Container, goog.ui.SplitPane);


app.controller.Container.prototype.refreshByQuery = function (query, categoryId) {
  var old = this.thousandRows_.getModel();
  if (old) {
    old.dispose(); // TODO: Enable it to be used again.
  }
  if (goog.string.isEmpty(query) && categoryId == 0) {
    this.thousandRows_.clearContent();
  } else {
    var model = app.controller.Container.createNewModel_(query, categoryId);
    this.thousandRows_.setModel(model);
    this.thousandRows_.setZero();
    this.detail_.clearContent();
  }
};


app.controller.Container.prototype.createDom = function () {
  goog.base(this, 'createDom');
  var dh = this.getDomHelper();
  this.detailPaneElement_ = this.getElementByClass('goog-splitpane-second-container');
  dh.appendChild(this.getElementByClass('goog-splitpane-handle'),
      dh.createDom('div', 'handle',
        dh.createDom('div', 'handle-content')));
};


app.controller.Container.prototype.enterDocument = function () {
  this.getHandler()
    .listen(app.dom.ViewportSizeMonitor.getInstance(), goog.events.EventType.RESIZE, function (e) {
      this.resize_();
      this.thousandRows_.update();
      this.detail_.update();
    })
    .listen(this, app.ui.ThousandRows.EventType.ROW_CLICKED, this.handleRowClicked_)
    .listen(this, goog.ui.SplitPane.EventType.HANDLE_DRAG_END, function (e) {

      // TODO: Call resize only when the belonging frame selected.
      
      this.detail_.update();
      app.model.setDetailPaneWidth(app.controller.util.getFrameId(this),
        this.detail_.getWidth());
    })
    .listen(this.resizeTimer_, goog.Timer.TICK, this.handleResizeTimerTick_);

  this.setDetailpainSize_(app.model.getDetailPaneWidth(app.controller.util.getFrameId(this)));

  goog.base(this, 'enterDocument');

  // First request by thousand rows.
  var frame = this.getParent();
  goog.asserts.assert(frame instanceof app.controller.Frame, 'Wrong Parent to container!!');
  var tab = app.model.getTabQuery(frame.getId());
  this.refreshByQuery(tab['query'], tab['category']['CategoryId']);
};

/**
 * @type {?number}
 */
app.controller.Container.prototype.offsetTopCache_;

app.controller.Container.prototype.handleRowClicked_ = function (e) {
  var id = e.row.getAuctionId();
  if (id) {
    app.model.getAuctionItem(id, function (err, data) {
      if (!err) this.detail_.renderContent(data);
    }, this);
  }
};

/**
 * @return {number}
 */
app.controller.Container.prototype.getOffsetTop_ = function () {
  return this.offsetTopCache_ || (this.offsetTopCache_ = this.getElement().offsetTop);
};


app.controller.Container.prototype.resize = function () {
  this.resize_();
};


/**
 * @type {goog.Timer}
 */
app.controller.Container.prototype.resizeTimer_ = new goog.Timer(100);


/**
 * Resize splitPane layout on delay.
 * We don't use setSize() because we want to resize 
 *    based on this.detailPaneElement_.offsetWidth.
 */
app.controller.Container.prototype.resize_ = function () {
  if (this.resizeTimer_.enabled) {
    this.resizeTimer_.stop();
  }
  this.resizeTimer_.start();
};


app.controller.Container.prototype.handleResizeTimerTick_ = function (e) {
  this.resizeTimer_.stop();
  this.setDetailpainSize_();
};


/**
 * If an argument passed, use it.
 * @param {number?} opt_width
 */
app.controller.Container.prototype.setDetailpainSize_ = function (opt_width) {
  var size = app.dom.ViewportSizeMonitor.getInstance().getSize();
  size.height -= this.getOffsetTop_();
  goog.style.setBorderBoxSize(this.getElement(), size);

  var leftPaneWidth = Math.max(240, size.width - 
      (goog.isDefAndNotNull(opt_width) ? 
        opt_width : this.detailPaneElement_.offsetWidth));

  this.setFirstComponentSize(leftPaneWidth);
  var width = size.width - leftPaneWidth;
  app.model.setDetailPaneWidth(app.controller.util.getFrameId(this), width);

  var iframeOverlay = this.getIframeOverlay_();
  if (iframeOverlay) {
    goog.style.setBorderBoxSize(iframeOverlay, size);
  }
};


/**
 * He is private.. So we grab and cache him.
 * @type {?Element}
 */
app.controller.Container.prototype.iframeOverlayCache_;


/**
 * @return {?Element}
 */
app.controller.Container.prototype.getIframeOverlay_ = function () {
  if (this.iframeOverlayCache_) return this.iframeOverlayCache_;

  var last = goog.dom.getLastElementChild(this.getElement());
  if (!last.className) return this.iframeOverlayCache_ = last; // He must be..

  return  null;
};


/**
 * @type {app.ui.ThousandRows.Model}
 */
app.controller.Container.prototype.thousandRowsModel_;


app.controller.Container.createThousandRows_ = function (opt_domHelper) {
  var thousandRows = new app.ui.ThousandRows(138, 50, opt_domHelper);
  thousandRows.setMinThumbLength(30);
  return thousandRows;
};


app.controller.Container.createNewModel_ = function (query, categoryId) {
  var endPoint = query ? '/api/search' : '/api/categoryLeaf';
  var uri = new goog.Uri(endPoint); // goog.Uri.create escape its argument.. Why?
  var q = uri.getQueryData();
  if (query) q.set('query', query);
  if (goog.isDefAndNotNull(categoryId)) {
    q.set('category', categoryId);
  }
  return new app.ui.ThousandRows.Model(uri.toString(), undefined, true);
};

