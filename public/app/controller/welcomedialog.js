
goog.provide('app.controller.WelcomeDialog');

goog.require('app.ui.Dialog');
goog.require('goog.ui.TabPane');


/**
 * @constructor
 * @extends {app.ui.Dialog}
 */
app.controller.WelcomeDialog = function (opt_domHelper) {
  goog.base(this, opt_domHelper);
  this.setModel(false);
};
goog.inherits(app.controller.WelcomeDialog, app.ui.Dialog);


app.controller.WelcomeDialog.prototype.tabPane_;


app.controller.WelcomeDialog.prototype.launch = function () {
  goog.base(this, 'launch', '/about');
};


app.controller.WelcomeDialog.prototype.decorateLoadedContent_ = function () {
  var dh = this.getDomHelper();
  var content = this.getContentElement();

  var tabContainer = this.tabsContainer_ = dh.getElementByClass('nav-tabs', content);
  var tabs = this.tabs_ = dh.getChildren(tabContainer);
  var tabContents = this.tabContents_ = dh.getChildren(dh.getElementByClass('tab-belongings'));

  dh.append(this.getTitleElement(), tabContainer);

  this.getHandler().listen(tabContainer, goog.events.EventType.CLICK, function (e) {
    e.stopPropagation();
    e.preventDefault();
    var index = this.getTabIndexFromEventTarget_(e.target);
    if (this.selectedIndex_ == index) return;
    this.enableContent_(this.selectedIndex_, false);
    this.enableContent_(index, true);
    this.selectedIndex_ = index;
  });
  this.enableContent_(this.selectedIndex_, true);

  goog.style.setHeight(content, content.offsetHeight);
};

app.controller.WelcomeDialog.prototype.selectedIndex_ = 0;

app.controller.WelcomeDialog.prototype.enableContent_ = function (index, enable) {
  goog.dom.classes.enable(this.tabs_[index], 'active', enable);
  goog.dom.classes.enable(this.tabContents_[index], 'active', enable);
};


app.controller.WelcomeDialog.prototype.getTabIndexFromEventTarget_ = function (et) {
  while (et && et != this.element_ && et.nodeName != 'LI') {
    et = /** @type {Element} */ (et.parentNode);
  }
  if (!et) return null;
  var tabEl_ = -1;
  goog.array.find(this.tabs_, function (tab, i) {
    if (et == tab) {
      index = i;
      return true;
    }
    return false;
  });
  return index;
};
