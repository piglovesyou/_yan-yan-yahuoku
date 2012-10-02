
goog.provide('app.controller.util');


app.controller.util = {};


/**
 * @param {goog.ui.Component} child
 * @return {!string}
 */
app.controller.util.getFrameId = function (component) {
  var id = app.controller.util.getFrame(component).getId();
  goog.asserts.assertString(id, 'Couldn\'t get frame Id. There must be.');
  return id;
};


/**
 * @param {goog.ui.Component} child
 * @return {?app.controller.Frame}
 */
app.controller.util.getFrame = function (component) {
  while (component && !(component instanceof app.controller.Frame)) {
    component = component.getParent();
  } 
  goog.asserts.assertInstanceof(component, app.controller.Frame, 'Couldn\'t get frame instance. ');
  return component;
};
