
goog.provide('app.ui.common.ButtonRenderer');

goog.require('goog.ui.ButtonRenderer');



// /**
//  * @constructor
//  * @extends {goog.ui.Button}
//  */
// app.ui.common.Button = function (content, opt_domHelper) {
//   goog.base(this, opt_domHelper);
// }
// goog.inherits(app.ui.common.Button, goog.ui.Button);








/**
 * @constructor
 * @extends {goog.ui.ButtonRenderer}
 */
app.ui.common.ButtonRenderer = function () {
  goog.base(this);
  this.tagName = 'a';
};
goog.inherits(app.ui.common.ButtonRenderer, goog.ui.ButtonRenderer);
goog.addSingletonGetter(app.ui.common.ButtonRenderer);


app.ui.common.ButtonRenderer.prototype.canDecorate = function (element) {
  return true;
};


/**
 * For this.tagName.
 * @param {goog.ui.Button} button
 */
app.ui.common.ButtonRenderer.prototype.createDom = function (button) {
  var dh = button.getDomHelper();

  // Create and return DIV wrapping contents.
  var element = button.getDomHelper().createDom(
      this.tagName, 'btn ' + this.getClassNames(button).join(' '), button.getContent());
  this.setAriaStates(button, element);
  return element;

  // TODO: Impl to attach tooltip.
  // var tooltip = button.getTooltip();
  // console.log(tooltip);
  // if (tooltip) {
  //   this.setTooltip(element, tooltip);
  // }

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
