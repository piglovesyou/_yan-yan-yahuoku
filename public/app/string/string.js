
goog.provide('app.string');

goog.require('goog.date.relative');


app.string = {};


/**
 * @param {string} escapedString
 * @return {string}
 */
app.string.renderPrice = function (escapedString) {
  var value = +escapedString;
  if (!goog.isNumber(value) || isNaN(value)) return null;
  return app.string.addCommaToNumber('' + Math.floor(value)) + '円';
}


/**
 * @param {string} escapedString
 * @return {string}
 */
app.string.renderEndDate = function (escapedString) {
  var formatted = goog.date.relative.format(new Date(escapedString).getTime());
  // Yahoo auction is always in 2 weeks.
  if (formatted) {
    if (goog.string.contains(formatted, 'in')) {
      formatted = 'あと' + formatted.slice(3);
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
    return escapedString;
  }
};



app.string.getCategoryNameByPath = function (path) {
  if (path) {
    var arr = path.split(' > ');
    return arr[arr.length - 1];
  }
  return '';
};


app.string.addCommaToNumber = function (numstring) {
  while(numstring != (numstring = numstring.replace(/^(-?\d+)(\d{3})/, "$1,$2")));
  return numstring;
};


app.string.relativeDateFormat = function (ms) {
  // goog.date.relative.format(ms);
};
