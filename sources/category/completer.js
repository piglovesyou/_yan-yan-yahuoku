
var redis = require('redis').createClient();
var exec = require('child_process').exec;



// Whole data of auction category.
var store = [];



var loadKeys = function (callback) {
  redis.keys('y_catid:*', function (err, keys) {
    if (err) new Error('couldn\'t load keys from redis.')
    callback(keys);
  });
};

var loadCategory = function (key) {
  redis.get(key, function (err, data) {
    if (err) new Error('couldn\'t load category from redis.')
    var category = JSON.parse(data);

    store.push(category);
  });
};

var createRegExp = function (token, callback) {
  exec('cmigemo -nq -d /usr/local/share/migemo/utf-8/migemo-dict -n -w ' + token, function (err, result) {
    callback(err, !err && new RegExp(result.replace('\n','')));
  });
};

var getMatchedPath = function (reg) {
  return store.filter(function (category) {
    return reg.test(category.CategoryName);
  });
};

var compareCondition = function (a, b) {
  return a.CategoryName > b.CategoryName ? 1 : -1;
};

module.exports.search = function (token, callback) {
  createRegExp(token, function (err, reg) {
    callback(err, !err && getMatchedPath(reg).sort(compareCondition));
  });
};

loadKeys(function (keys) {
  keys.forEach(function (key) {
    loadCategory(key);
  });
});




// setTimeout(function () {
//   var now = Date.now();
//   search('hon', function (err, result) {
//     console.log('result: ' + (Date.now() - now)/1000 + 's');
//   });
// }, 3000);
