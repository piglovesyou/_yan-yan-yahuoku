
goog.require('goog.Uri');
goog.require('goog.date.relative');
goog.require('goog.i18n.DateTimeFormat');
goog.require('goog.i18n.NumberFormat');



module.exports.renderPrice = renderPrice;
module.exports.createAuctionItemLink = createAuctionItemLink;
module.exports.renderDate = renderDate;
module.exports.renderBoolean = renderBoolean;
module.exports.renderItemCondition = renderItemCondition;
module.exports.renderEndDate = renderEndDate;
module.exports.getCategoryNameByPath = getCategoryNameByPath;
module.exports.toDecimal = toDecimal;



/**
 * @param {string} escapedString .
 * @return {?string} .
 */
function renderPrice(escapedString) {
  var value = +escapedString;
  if (!goog.isNumber(value) || isNaN(value)) return null;
  return toDecimal(Math.floor(value));
}


/**
 * @param {string} escapedUrl .
 * @return {string} .
 */
function createAuctionItemLink(escapedUrl) {
  // var uri = new goog.Uri.parse(App.getInstance().getAffiliateBase());
  // uri.getQueryData().add('vc_url', escapedUrl);
  // return uri.toString();
}


/**
 * @type {goog.i18n.DateTimeFormat}
 */
var dateFormatter_;


/**
 * @type {goog.i18n.NumberFormat}
 */
var numberFormatter_;


/**
 * @param {string} escapedString .
 * @return {string} .
 */
function renderDate(escapedString) {
  if (!dateFormatter_) {
    dateFormatter_ = new goog.i18n.DateTimeFormat('M月 d日 H時 m分');
  }
  return dateFormatter_.format(new Date(escapedString));
}


/**
 * TODO: use it.
 * @param {string} escapedString .
 * @return {string} .
 */
function renderBoolean(escapedString) {
  return escapedString == 'true' ? 'あり' : 'なし';
}


/**
 * @param {string} escapedString .
 * @return {string} .
 */
function renderItemCondition(escapedString) {
  switch (escapedString) {
    case 'new': return '新品';
    case 'used': return '中古';
    case 'other': return 'その他';
  }
  return '';
}


/**
 * @param {string} escapedString .
 * @return {string} .
 */
function renderEndDate(escapedString) {
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
}


/**
 * @param {string} path .
 * @return {string} .
 */
function getCategoryNameByPath(path) {
  if (path) {
    var arr = path.split(' > ');
    return arr[arr.length - 1];
  }
  return '';
}


/**
 * @param {number} num .
 * @return {string} .
 */
function toDecimal(num) {
  var formatter = numberFormatter_ || (numberFormatter_ =
      new goog.i18n.NumberFormat(goog.i18n.NumberFormat.Format.DECIMAL));
  return formatter.format(num);
}

