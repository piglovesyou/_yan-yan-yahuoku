
goog.provide('app.controller.util');


app.controller.util = {};


app.controller.util.getChildIndex = function (parent, child) {
  var index;
  goog.array.find(parent.getChildIds(), function (id, i) {
    if (id == child.getId()) {
      index = i;
      return true;
    }
    return false;
  });
  goog.asserts.assertNumber(index, 'Invalid pare of parent and child');
  return index;
};


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
 * @param {goog.ui.Component} component
 * @return {?app.controller.Frame}
 */
app.controller.util.getFrame = function (component) {
  while (component && !(component instanceof app.controller.Frame)) {
    component = component.getParent();
  } 
  goog.asserts.assertInstanceof(component, app.controller.Frame, 'Couldn\'t get frame instance. ');
  return component;
};


/**
 * @param {goog.ui.Component} component
 * @return {?app.controller.Tab}
 */
app.controller.util.getTab = function (component) {
  while (component && !(component instanceof app.controller.Tab)) {
    component = component.getParent();
  } 
  goog.asserts.assertInstanceof(component, app.controller.Tab, 'Couldn\'t get frame instance. ');
  return component;
};
