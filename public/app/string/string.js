
goog.provide('app.string');


app.string = {};

app.string.getCategoryNameByPath = function (path) {
  if (path) {
    var arr = path.split(' > ');
    return arr[arr.length - 1];
  }
  return '';
};
