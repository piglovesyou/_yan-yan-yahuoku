
goog.provide('app.string');

goog.require('goog.Uri');
goog.require('goog.date.relative');
goog.require('goog.i18n.DateTimeFormat');
goog.require('goog.i18n.NumberFormat');


/**
 * Utility name space to manipulate string.
 * @type {Object}
 */
app.string = {};


/**
 * @param {string} escapedString .
 * @return {?string} .
 */
app.string.renderPrice = function(escapedString) {
  var value = +escapedString;
  if (!goog.isNumber(value) || isNaN(value)) return null;
  return app.string.toDecimal(Math.floor(value)) + '円';
};


/**
 * @type {goog.i18n.DateTimeFormat}
 */
app.string.dateFormatter_;


/**
 * @type {goog.i18n.NumberFormat}
 */
app.string.numberFormatter_;


/**
 * @param {string} escapedString .
 * @return {string} .
 */
app.string.renderDate = function(escapedString) {
  if (!app.string.dateFormatter_) {
    app.string.dateFormatter_ = new goog.i18n.DateTimeFormat('M月 d日 H時 m分');
  }
  return app.string.dateFormatter_.format(new Date(escapedString));
};


/**
 * TODO: use it.
 * @param {string} escapedString .
 * @return {string} .
 */
app.string.renderBoolean = function(escapedString) {
  return escapedString == 'true' ? 'あり' : 'なし';
};


/**
 * @param {string} escapedString .
 * @return {string} .
 */
app.string.renderItemCondition = function(escapedString) {
  switch (escapedString) {
    case 'new': return '新品';
    case 'used': return '中古';
    case 'other': return 'その他';
  }
  return '';
};


/**
 * @param {string} escapedString .
 * @return {string} .
 */
app.string.renderEndDate = function(escapedString) {
  var formatted = goog.date.relative.format(new Date(escapedString).getTime());
  // Yahoo auction is always in 2 weeks.
  if (formatted) {
    if (goog.string.startsWith(formatted, 'in')) {
      formatted = 'あと' + formatted.slice(3);
    } else if (goog.string.endsWith(formatted, 'ago')) {
      return '終了';
    }
    if (goog.string.contains(formatted, 'day')) {
      formatted = formatted.replace(/day.*$/, '日');
    } else if (goog.string.contains(formatted, 'minute')) {
      formatted = formatted.replace(/minute.*$/, '分');
    } else if (goog.string.contains(formatted, 'hour')) {
      formatted = formatted.replace(/hour.*$/, '時間');
    }
    return formatted;
  } else {
    return app.string.renderDate(escapedString);
  }
};


/**
 * @param {string} path .
 * @return {string} .
 */
app.string.getCategoryNameByPath = function(path) {
  if (path) {
    var arr = path.split(' > ');
    return arr[arr.length - 1];
  }
  return '';
};


/**
 * @param {number} num .
 * @return {string} .
 */
app.string.toDecimal = function(num) {
  var formatter = app.string.numberFormatter_ || (app.string.numberFormatter_ =
      new goog.i18n.NumberFormat(goog.i18n.NumberFormat.Format.DECIMAL));
  return formatter.format(num);
};
