
goog.provide('app.ui.Container');

goog.require('app.Model');
goog.require('app.ui.Detail');
goog.require('app.ui.ThousandRows');
goog.require('goog.style');
goog.require('goog.ui.SplitPane');


/**
 * @constructor
 * @extends {goog.ui.SplitPane}
 * @param {goog.dom.DomHelper=} opt_domHelper DomHelper.
 */
app.ui.Container = function(opt_domHelper) {

  /**
   * @private
   * @type {app.ui.ThousandRows}
   */
  this.thousandRows_ = app.ui.Container.createThousandRows_(opt_domHelper);

  /**
   * @private
   * @type {app.ui.Detail}
   */
  this.detail_ = new app.ui.Detail(opt_domHelper);

  goog.base(this, this.thousandRows_, this.detail_, null, opt_domHelper);

  this.setHandleSize(0);

};
goog.inherits(app.ui.Container, goog.ui.SplitPane);


/**
 * @type {?number}
 */
app.ui.Container.prototype.offsetTopCache_;


/**
 * He is private.. So we grab and cache him.
 * @type {?Element}
 */
app.ui.Container.prototype.iframeOverlayCache_;


/**
 * @return {app.ui.ThousandRows} A belonging thousandrows.
 */
app.ui.Container.prototype.getThousandRows = function() {
  return this.thousandRows_;
};


/**
 * @param {string} query A query string to search items.
 * @param {string} categoryId As it is.
 */
app.ui.Container.prototype.refreshByQuery = function(query, categoryId) {
  var old = this.thousandRows_.getModel();
  if (old) {
    old.dispose(); // TODO: Enable it to be used again.
  }
  if (goog.string.isEmpty(query) && categoryId == 0) {
    this.thousandRows_.clearContent();
  } else {
    var isGrid = app.model.getAlignmentStyle(app.ui.util.getTabId(this));
    var model = app.ui.Container.createNewModel_(query, categoryId, isGrid);

    this.thousandRows_.setRowHeight(!isGrid ?
        app.ui.Container.listRowHeigt_ :
        app.ui.Container.gridRowHeigt_);
    this.thousandRows_.setRowCountInPane(!isGrid ?
        app.ui.Container.listRowCount_ :
        app.ui.Container.gridRowCount_);
    this.thousandRows_.updateAlignment();

    this.thousandRows_.setModel(model);
    this.thousandRows_.setZero();
    this.detail_.clearContent();
  }
};


/** @inheritDoc */
app.ui.Container.prototype.createDom = function() {
  goog.base(this, 'createDom');
  var dh = this.getDomHelper();
  this.detailPaneElement_ =
    this.getElementByClass('goog-splitpane-second-container');
  dh.appendChild(this.getElementByClass('goog-splitpane-handle'),
      dh.createDom('div', 'handle',
        dh.createDom('div', 'handle-content')));
};


/** @inheritDoc */
app.ui.Container.prototype.enterDocument = function() {
  goog.base(this, 'enterDocument');
  var tab = app.ui.util.getTab(this);
  this.getHandler()
    .listen(app.events.EventCenter.getInstance(),
            app.events.EventCenter.EventType.TAB_CHANGED, function(e) {
      this.processSelected_(tab.isSelected());
    })
    .listen(this, [goog.ui.Component.EventType.FOCUS,
            goog.ui.Component.EventType.BLUR], function(e) {
      // We want to show thousandrows upper by z-index.
      goog.dom.classes.enable(this.getElement(), 'firstComponentFocused',
        e.type == goog.ui.Component.EventType.FOCUS);
    });
  this.processSelected_(tab.isSelected());

  // First request by thousand rows.
  var data = app.model.getTabQuery(tab.getId());
  this.refreshByQuery(data['query'], data['category']['CategoryId']);
};


/**
 * @private
 * @param {boolean} selected If true, activate all event listeners.
 */
app.ui.Container.prototype.processSelected_ = function(selected) {
  var eh = this.getHandler();
  var fn = selected ? eh.listen : eh.unlisten;
  fn.call(eh, app.dom.ViewportSizeMonitor.getInstance(),
          app.dom.ViewportSizeMonitor.EventType.DELAYED_RESIZE,
          this.handleDelayedResize_);
  fn.call(eh, this, app.ui.ThousandRows.EventType.ROW_CLICKED,
          this.handleRowClicked_);
  fn.call(eh, this, app.ui.ThousandRows.EventType.COL_CLICKED,
          this.handleColClicked_);
  fn.call(eh, this, goog.ui.SplitPane.EventType.HANDLE_DRAG_END,
          this.handlePaneResized_);

  if (selected) {
    this.setDetailpainSize_(
      app.model.getDetailPaneWidth(app.ui.util.getTab(this).getId()));
  }
};


/**
 * @private
 * @param {goog.events.Event} e A resize event provided by SplitPane.
 * We can't use 'handleDragEnd_' for its name.. which used by superClass.
 */
app.ui.Container.prototype.handlePaneResized_ = function(e) {
  this.thousandRows_.update();
  this.detail_.update();
  var w = this.detail_.getWidth();
  if (goog.isNumber(w)) {
    app.model.setDetailPaneWidth(app.ui.util.getTabId(this), w);
  }
};


/**
 * @private
 * @param {goog.events.Event} e A click event provided by Thousandrows.Row.
 */
app.ui.Container.prototype.handleRowClicked_ = function(e) {
  this.renderItemInDetail_(e.row.getAuctionId());
};


/**
 * @private
 * @param {goog.events.Event} e A click event provided by Thousandrows.Col.
 */
app.ui.Container.prototype.handleColClicked_ = function(e) {
  this.renderItemInDetail_(e.col.getAuctionId());
};


/**
 * @private
 * @param {string} auctionId An auction unique id.
 */
app.ui.Container.prototype.renderItemInDetail_ = function(auctionId) {
  if (auctionId) {
    app.model.getAuctionItem(auctionId, function(err, data) {
      if (!err) this.detail_.renderContent(data);
    }, this);
  }
};


/**
 * @private
 * @return {number} Offset top.
 */
app.ui.Container.prototype.getOffsetTop_ = function() {
  return this.offsetTopCache_ || (this.offsetTopCache_ =
                                  this.getElement().offsetTop);
};


/**
 * @private
 * @param {goog.events.Event} e A tick event.
 */
app.ui.Container.prototype.handleDelayedResize_ = function(e) {
  this.setDetailpainSize_();
  this.thousandRows_.update();
  this.detail_.update();
};


/**
 * We don't use setSize() because we want to resize
 *    based on this.detailPaneElement_.offsetWidth.
 * @private
 * @param {?number=} opt_width If an argument passed, use it.
 */
app.ui.Container.prototype.setDetailpainSize_ = function(opt_width) {
  var size = app.dom.ViewportSizeMonitor.getInstance().getSize();
  size.height -= this.getOffsetTop_();
  goog.style.setBorderBoxSize(this.getElement(), size);

  var leftPaneWidth = Math.max(240, size.width -
      (goog.isDefAndNotNull(opt_width) ?
        opt_width : this.detailPaneElement_.offsetWidth));

  this.setFirstComponentSize(leftPaneWidth);
  var width = size.width - leftPaneWidth;
  app.model.setDetailPaneWidth(app.ui.util.getTabId(this), width);

  var iframeOverlay = this.getIframeOverlay_();
  if (iframeOverlay) {
    goog.style.setBorderBoxSize(iframeOverlay, size);
  }
};


/**
 * @private
 * @return {?Element} An iframe overlay created by SplitPane.
 */
app.ui.Container.prototype.getIframeOverlay_ = function() {
  if (this.iframeOverlayCache_) return this.iframeOverlayCache_;

  var last = goog.dom.getLastElementChild(this.getElement());
  if (!last.className) return this.iframeOverlayCache_ = last; // He must be..

  return null;
};


/**
 * @type {app.ui.ThousandRows.Model}
 */
app.ui.Container.prototype.thousandRowsModel_;


/** @private */
app.ui.Container.listRowHeigt_ = 138;


/** @private */
app.ui.Container.listRowCount_ = 50;


/** @private */
app.ui.Container.gridRowHeigt_ = 168;


/** @private */
app.ui.Container.gridRowCount_ =
    app.ui.Container.listRowCount_ /
      app.ui.ThousandRows.ModelForGrid.gridCols_;


/**
 * @private
 * @param {goog.dom.DomHelper=} opt_domHelper A dom helper.
 * @return {app.ui.ThousandRows} A belonging thousandrows instance.
 */
app.ui.Container.createThousandRows_ = function(opt_domHelper) {
  var thousandRows = new app.ui.ThousandRows(
      app.ui.Container.listRowHeigt_,
      app.ui.Container.listRowCount_,
      goog.ui.Scroller.ORIENTATION.BOTH, opt_domHelper);

  // var thousandRows = new app.ui.ThousandRows(
  //     isGrid ? app.ui.Container.listRowHeigt_ :
  //              app.ui.Container.gridRowHeigt_,
  //     isGrid ? app.ui.Container.listRowCount_ :
  //              app.ui.Container.gridRowCount_,
  //     opt_domHelper);

  thousandRows.setMinThumbLength(30);
  return thousandRows;
};


/**
 * @private
 * @param {string} query A query.
 * @param {string} categoryId A categoryId.
 * @param {boolean} isGrid If true, a model creates grid style records.
 * @return {app.ui.ThousandRows.Model} A brand new model for thousandrows.
 */
app.ui.Container.createNewModel_ = function(query, categoryId, isGrid) {
  var endPoint = query ? '/y/search' : '/y/categoryLeaf';
  var uri = new goog.Uri(endPoint); //goog.Uri.create escape its argument.. Why?
  var q = uri.getQueryData();
  if (query) q.set('query', query);
  if (goog.isDefAndNotNull(categoryId)) {
    q.set('category', categoryId);
  }
  return isGrid ?
    new app.ui.ThousandRows.ModelForGrid(uri.toString(), undefined, true) :
    new app.ui.ThousandRows.Model(uri.toString(), undefined, true);
};

