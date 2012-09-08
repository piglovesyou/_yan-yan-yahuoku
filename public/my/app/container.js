
goog.provide('my.app.Container');

goog.require('goog.ui.SplitPane');
goog.require('goog.style');
goog.require('my.ui.ThousandRows');


/**
 * @constructor
 * @extends {goog.ui.SplitPane}
 */
my.app.Container = function (opt_domHelper) {

  var thousandRows = this.createThousandRows_(opt_domHelper);

  goog.base(this, thousandRows, new goog.ui.Component(), opt_domHelper);
  this.setHandleSize(0);

  /**
   * @type {my.ui.ThousandRows}
   */
  this.thousandRows_ = thousandRows;
}
goog.inherits(my.app.Container, goog.ui.SplitPane);



my.app.Container.prototype.render = function () {
  this.decorate(this.getElement());
};

my.app.Container.prototype.createDom = function () {
  var dh = this.getDomHelper();
  var element = 
    dh.createDom('div', ['container', 'goog-splitpane'],
      dh.createDom('div', ['list-pane', 'goog-splitpane-first-container'],
        this.scrollerElement_ = 
          dh.createDom('div', ['goog-scroller', 'goog-thousandrows'],
            dh.createDom('div', 'goog-scroller-container'))),
      this.detailPaneElement_ =
        dh.createDom('div', ['detail-pane', 'goog-splitpane-second-container']),
      dh.createDom('div', 'goog-splitpane-handle',
        dh.createDom('div', 'handle',
          dh.createDom('div', 'handle-content'))));
  this.setElementInternal(element);
  this.decorateInternal(element);
};


my.app.Container.prototype.enterDocument = function () {
  this.getHandler()
    .listen(my.dom.ViewportSizeMonitor.getInstance(), goog.events.EventType.RESIZE, function (e) {
      this.resize_();
      this.thousandRows_.update();
    });
  this.resize_();
  goog.base(this, 'enterDocument');
};

/**
 * @type {?number}
 */
my.app.Container.prototype.offsetTopCache_;

/**
 * @return {number}
 */
my.app.Container.prototype.getOffsetTop_ = function () {
  return this.offsetTopCache_ || (this.offsetTopCache_ = this.getElement().offsetTop);
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


my.app.Container.prototype.createThousandRows_ = function (opt_domHelper) {
  var thousandRows = new my.ui.ThousandRows(160, 50, opt_domHelper);
  thousandRows.setMinThumbLength(30);
  var model = new my.ui.ThousandRows.Model(
                  thousandRows.baseName + thousandRows.getId(),
                  '/api/search?query=ベアブリック+23', 10000, true);
  thousandRows.setModel(model)
  return thousandRows;
};


my.app.Container.prototype.decorateInternal = function (element) {
  this.thousandRows_.decorate(this.scrollerElement_);
  goog.base(this, 'decorateInternal', element);
};


/** @inheritDoc */
my.app.Container.prototype.canDecorate = function (element) {
  console.log(goog.base(this, 'canDecorate', element));
  if (goog.base(this, 'canDecorate', element)) {
    var scrollerElement = goog.dom.getElementByClass('goog-scroller', element);
    var detailPaneElement = goog.dom.getElementByClass('detail-pane', element);
    if (scrollerElement) {
      this.scrollerElement_ = scrollerElement;
      this.detailPaneElement_ = detailPaneElement;
      return true;
    }
  }
  return false;
};

