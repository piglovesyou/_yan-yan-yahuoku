
goog.provide('app.ui.ButtonRenderer');

goog.require('goog.ui.ButtonRenderer');



// /**
//  * @constructor
//  * @extends {goog.ui.Button}
//  */
// app.ui.Button = function (content, opt_domHelper) {
//   goog.base(this, opt_domHelper);
// }
// goog.inherits(app.ui.Button, goog.ui.Button);








/**
 * @constructor
 * @extends {goog.ui.ButtonRenderer}
 */
app.ui.ButtonRenderer = function () {
  goog.base(this);
  this.tagName = 'a';
};
goog.inherits(app.ui.ButtonRenderer, goog.ui.ButtonRenderer);
goog.addSingletonGetter(app.ui.ButtonRenderer);


/**
 * @param {app.ui.Button} button
 */
app.ui.ButtonRenderer.prototype.createDom = function (button) {
  var dh = button.getDomHelper();
  var element = dh.createDom(this.tagName, {
    className: 'btn'
  }, button.getContent());

  var tooltip = button.getTooltip();
  if (tooltip) {
    this.setTooltip(element, tooltip);
  }

  var value = button.getValue();
  if (value) {
    this.setValue(element, value);
  }

  // If this is a toggle button, set ARIA state
  if (button.isSupportedState(goog.ui.Component.State.CHECKED)) {
    this.updateAriaState(element, goog.ui.Component.State.CHECKED,
                         button.isChecked());
  }

  return element;
};




/**
 * @constructor
 * @extends {app.ui.ButtonRenderer}
 */
app.ui.NativeButtonRenderer = function () {
  goog.base(this);
  this.tagName = 'button';
};
goog.inherits(app.ui.NativeButtonRenderer, app.ui.ButtonRenderer);
goog.addSingletonGetter(app.ui.NativeButtonRenderer);
