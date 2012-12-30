
goog.provide('app.ui.TabPane');

goog.require('app.dom');
goog.require('goog.ui.Component');



/**
 * @param {string} id .
 * @param {goog.dom.DomHelper=} opt_domHelper .
 * @constructor
 * @extends {goog.ui.Component}
 */
app.ui.TabPane = function(id, opt_domHelper) {
  goog.base(this, opt_domHelper);
  this.setId(id);
};
goog.inherits(app.ui.TabPane, goog.ui.Component);


app.ui.TabPane.prototype.tabs_;


app.ui.TabPane.prototype.tabBelongings_;


/** @inheritDoc */
app.ui.TabPane.prototype.canDecorate = function(element) {
  if (element) {
    var dh = this.getDomHelper();
    var tabContainer = this.tabContainer_ = dh.getElementByClass('nav-tabs', element);
    var tabs = this.tabs_ = dh.getChildren(tabContainer);
    var tabBelongings = this.tabBelongings_ = dh.getChildren(dh.getElementByClass('tab-belongings', element));
    if (tabs && tabBelongings) return true;
  }
  return false;
};


app.ui.TabPane.prototype.selectedIndex_ = 0;


app.ui.TabPane.prototype.enableContent_ = function(index, enable) {
  this.tabs_[index] && goog.dom.classes.enable(this.tabs_[index], 'active', enable);
  this.tabBelongings_[index] && goog.dom.classes.enable(this.tabBelongings_[index], 'active', enable);
};


/** @inheritDoc */
app.ui.TabPane.prototype.enterDocument = function() {
  goog.base(this, 'enterDocument');
  this.getHandler().listen(this.tabContainer_, goog.events.EventType.CLICK, function(e) {
    e.stopPropagation();
    e.preventDefault();
    var index = this.getTabIndexFromEventTarget_(e.target);
    if (this.selectedIndex_ == index) return;
    this.enableContent_(this.selectedIndex_, false);
    this.enableContent_(index, true);
    this.selectedIndex_ = index;
  });
  this.enableContent_(this.selectedIndex_, true);
};


app.ui.TabPane.prototype.getTabIndexFromEventTarget_ = function(et) {
  et = app.dom.getAncestorFromEventTargetByTagName(this.getElement(), 'LI', et);
  if (!et) return null;
  var index = -1;
  goog.array.find(this.tabs_, function(tab, i) {
    if (et == tab) {
      index = i;
      return true;
    }
    return false;
  });
  return index;
};

/** @inheritDoc */
app.ui.TabPane.prototype.disposeInternal = function() {
  goog.base(this, 'disposeInternal');
};
