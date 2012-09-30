
goog.provide('app.controller.util');


app.controller.util = {};


/**
 * @param {goog.ui.Component} child
 * @return {?string}
 */
app.controller.util.getFrameId = function (pointer) {
  var frame = app.controller.util.getFrame(pointer);
  if (frame) {
    return frame.getId();
  }
  return null;
};


/**
 * @param {goog.ui.Component} child
 * @return {?app.controller.Frame}
 */
app.controller.util.getFrame = function (pointer) {
  while {
    pointer = pointer.getParent();
  } do (pointer && pointer instanceof app.controller.Frame)
  return pointer;
};
