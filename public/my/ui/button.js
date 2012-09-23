
goog.provide('my.ui.ButtonRenderer');

goog.require('goog.ui.ButtonRenderer');



// /**
//  * @constructor
//  * @extends {goog.ui.Button}
//  */
// my.ui.Button = function (content, opt_domHelper) {
//   goog.base(this, opt_domHelper);
// }
// goog.inherits(my.ui.Button, goog.ui.Button);








/**
 * @constructor
 * @extends {goog.ui.ButtonRenderer}
 */
my.ui.ButtonRenderer = function () {
  goog.base(this);
  this.tagName = 'a';
};
goog.inherits(my.ui.ButtonRenderer, goog.ui.ButtonRenderer);
goog.addSingletonGetter(my.ui.ButtonRenderer);


/**
 * @param {my.ui.Button} button
 */
my.ui.ButtonRenderer.prototype.createDom = function (button) {
  var dh = button.getDomHelper();
  var element = dh.createDom(this.tagName, {
    className: 'btn btn-primary'
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
 * @extends {my.ui.ButtonRenderer}
 */
my.ui.NativeButtonRenderer = function () {
  goog.base(this);
  this.tagName = 'button';
};
goog.inherits(my.ui.NativeButtonRenderer, my.ui.ButtonRenderer);
goog.addSingletonGetter(my.ui.NativeButtonRenderer);

