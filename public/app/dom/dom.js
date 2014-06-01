
goog.provide('app.dom');


/**
 * @param {Element} end .
 * @param {string} hookCssName .
 * @param {Node} et .
 * @return {Node} .
 */
app.dom.getAncestorFromEventTargetByClass = function(end, hookCssName, et) {
  while (et && !goog.dom.classes.has(et, hookCssName)) {
    if (et == end) {
      return null;
    }
    et = et.parentNode;
  }
  return et;
};


/**
 * @param {Element} end .
 * @param {string} nodeName .
 * @param {Node} et .
 * @return {Node} .
 */
app.dom.getAncestorFromEventTargetByTagName = function(end, nodeName, et) {
  while (et && et.nodeName != nodeName) {
    if (et == end) {
      return null;
    }
    et = et.parentNode;
  }
  return et;
};
