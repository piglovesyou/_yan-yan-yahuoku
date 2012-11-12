
goog.provide('app.ui.util');


app.ui.util = {};


app.ui.util.getChildIndex = function(parent, child) {
  var index;
  goog.array.find(parent.getChildIds(), function(id, i) {
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
 * @param {goog.ui.Component} component
 * @return {string}
 */
app.ui.util.getTabId = function(component) {
  var id = app.ui.util.getTab(component).getId();
  goog.asserts.assertString(id, 'Couldn\'t get tab Id. There must be.');
  return id;
};


/**
 * @param {goog.ui.Component} component
 * @return {?app.ui.Tab}
 */
app.ui.util.getTab = function(component) {
  while (component && !(component instanceof app.ui.Tab)) {
    component = component.getParent();
  }
  goog.asserts.assertInstanceof(component, app.ui.Tab, 'Couldn\'t get frame instance. ');
  return component;
};
