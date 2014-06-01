
goog.provide('app.util');

goog.require('app.header.Tab');


app.util = {};


app.util.getChildIndex = function(parent, child) {
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
app.util.getTabId = function(component) {
  var id = app.util.getTab(component).getId();
  goog.asserts.assertString(id, 'Couldn\'t get tab Id. There must be.');
  return id;
};


/**
 * @param {goog.ui.Component} component
 * @return {?app.header.Tab}
 */
app.util.getTab = function(component) {
  while (component && !(component instanceof app.header.Tab)) {
    component = component.getParent();
  }
  goog.asserts.assertInstanceof(component, app.header.Tab, 'Couldn\'t get frame instance. ');
  return component;
};
