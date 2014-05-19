
goog.provide('app.dom');


/**
 * @param {Element} end .
 * @param {string} hookCssName .
 * @param {Node} et .
 * @return {?Element} .
 */
app.dom.getAncestorFromEventTargetByClass = function(end, hookCssName, et) {
  while (et && et != end && !goog.dom.classes.has(et, hookCssName)) {
    et = /** @type {Element} */(et.parentNode);
  }
  return et;
};


/**
 * @param {Element} end .
 * @param {string} nodeName .
 * @param {Node} et .
 * @return {?Element} .
 */
app.dom.getAncestorFromEventTargetByTagName = function(end, nodeName, et) {
  while (et && et != end && et.nodeName != nodeName) {
    et = /** @type {Element} */(et.parentNode);
  }
  return et;
};
