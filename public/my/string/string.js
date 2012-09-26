
goog.provide('my.string');


my.string = {};

my.string.getCategoryNameByPath = function (path) {
  if (path) {
    var arr = path.split(' > ');
    return arr[arr.length - 1];
  }
  return '';
};
