

goog.provide('app.ui.searchbar.Switch');

goog.require('goog.ui.Button');
goog.require('goog.ui.Container');
goog.require('goog.ui.ContainerRenderer');
goog.require('goog.ui.NativeButtonRenderer');



/**
 * @constructor
 * @extends {goog.ui.Container}
 */
app.ui.searchbar.Switch = function(opt_domHelper) {
  goog.base(this, goog.ui.Container.Orientation.HORIZONTAL, app.ui.searchbar.SwitchRenderer.getInstance(), opt_domHelper);
  var dh = this.getDomHelper();

  this.listButton_ = app.ui.searchbar.Switch.createButton('4', dh);
  this.addChild(this.listButton_);

  this.gridButton_ = app.ui.searchbar.Switch.createButton('3', dh);
  this.addChild(this.gridButton_);
};
goog.inherits(app.ui.searchbar.Switch, goog.ui.Container);


app.ui.searchbar.Switch.prototype.enterDocument = function() {
  goog.base(this, 'enterDocument');
  this.getHandler().listen(this, 'action', function(e) {
    var isGrid = this.gridButton_.getId() == e.target.getId();
    app.model.setAlignmentStyle(app.ui.util.getTabId(this), isGrid);
    this.updateSwitchState_(isGrid);
  });

  this.updateSwitchState_(app.model.getAlignmentStyle(app.ui.util.getTabId(this)));
};


app.ui.searchbar.Switch.prototype.updateSwitchState_ = function(isGrid) {
  this.listButton_.setSelected(!isGrid);
  this.gridButton_.setSelected(isGrid);
};


app.ui.searchbar.Switch.createButton = function(content, dh) {
  var button = new goog.ui.Button(content,
      goog.ui.ButtonRenderer.getInstance(), dh);
  button.addClassName('btn');
  button.addClassName('i');

  button.setSupportedState(goog.ui.Component.State.DISABLED, false);
  button.setSupportedState(goog.ui.Component.State.HOVER, false);
  // button.setSupportedState(goog.ui.Component.State.ACTIVE,   false);
  button.setSupportedState(goog.ui.Component.State.FOCUSED, false);
  button.setSupportedState(goog.ui.Component.State.SELECTED, true);

  return button;
};


/** @inheritDoc */
app.ui.searchbar.Switch.prototype.createDom = function() {
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
app.ui.searchbar.SwitchRenderer = function() {
  goog.base(this);
};
goog.inherits(app.ui.searchbar.SwitchRenderer, goog.ui.ContainerRenderer);
goog.addSingletonGetter(app.ui.searchbar.SwitchRenderer);


/** @inheritDoc */
app.ui.searchbar.SwitchRenderer.prototype.getCssClass = function() {
  return goog.base(this, 'getCssClass') + ' btn-group';
};
