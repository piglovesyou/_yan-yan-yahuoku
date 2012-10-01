
goog.provide('app.string');

goog.require('goog.date.relative');


app.string = {};

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
