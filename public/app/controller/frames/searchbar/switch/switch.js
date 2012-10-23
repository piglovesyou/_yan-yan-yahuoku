

goog.provide('app.controller.searchbar.Switch');

goog.require('goog.ui.ContainerRenderer');
goog.require('goog.ui.Container');
goog.require('goog.ui.Button');
goog.require('goog.ui.NativeButtonRenderer');



/**
 * @constructor
 * @extends {goog.ui.Container}
 */
app.controller.searchbar.Switch = function (opt_domHelper) {
  goog.base(this, goog.ui.Container.Orientation.HORIZONTAL, app.controller.searchbar.SwitchRenderer.getInstance(), opt_domHelper);
  var dh = this.getDomHelper();

  this.listButton_ = app.controller.searchbar.Switch.createButton('4', dh);
  this.addChild(this.listButton_);

  this.gridButton_ = app.controller.searchbar.Switch.createButton('3', dh);
  this.addChild(this.gridButton_);
};
goog.inherits(app.controller.searchbar.Switch, goog.ui.Container);


app.controller.searchbar.Switch.prototype.enterDocument = function () {
  goog.base(this, 'enterDocument');
  this.getHandler().listen(this, 'action', function (e) {
    var isGrid = this.gridButton_.getId() == e.target.getId();
    app.model.setAlignmentStyle(app.controller.util.getTabId(this), isGrid);
    this.updateSwitchState_(isGrid);
  });

  this.updateSwitchState_(app.model.getAlignmentStyle(app.controller.util.getTabId(this)));
};


app.controller.searchbar.Switch.prototype.updateSwitchState_ = function (isGrid) {
  this.listButton_.setSelected(!isGrid);
  this.gridButton_.setSelected(isGrid);
};


app.controller.searchbar.Switch.createButton = function (content, dh) {
  var button = new goog.ui.Button(content,
      goog.ui.ButtonRenderer.getInstance(), dh);
  button.addClassName('btn');
  button.addClassName('i');

  button.setSupportedState(goog.ui.Component.State.DISABLED, false);
  button.setSupportedState(goog.ui.Component.State.HOVER,    false);
  // button.setSupportedState(goog.ui.Component.State.ACTIVE,   false);
  button.setSupportedState(goog.ui.Component.State.FOCUSED,  false);
  button.setSupportedState(goog.ui.Component.State.SELECTED,  true);

  return button;
};


/** @inheritDoc */
app.controller.searchbar.Switch.prototype.createDom = function () {
  goog.base(this, 'createDom');

  this.listButton_.createDom();
  this.gridButton_.createDom();
  var content = this.getContentElement();
  goog.asserts.assert(content, 'There must be.');
  this.getDomHelper().append(content,
      this.listButton_.getElement(),
      this.gridButton_.getElement());
};


/**
 * @constructor
 * @extends {goog.ui.ContainerRenderer}
 */
app.controller.searchbar.SwitchRenderer = function () {
  goog.base(this);
};
goog.inherits(app.controller.searchbar.SwitchRenderer, goog.ui.ContainerRenderer);
goog.addSingletonGetter(app.controller.searchbar.SwitchRenderer);


/** @inheritDoc */
app.controller.searchbar.SwitchRenderer.prototype.getCssClass = function () {
  return goog.base(this, 'getCssClass') + ' btn-group';
};
