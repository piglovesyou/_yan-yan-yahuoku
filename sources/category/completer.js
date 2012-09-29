
var redis = require('redis').createClient();
var exec = require('child_process').exec;
var querystring = require('querystring');



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
  if (token.indexOf('\'') >= 0) token.replace('\'', ' ');
  exec('cmigemo -nq -d /usr/local/share/migemo/utf-8/migemo-dict -n -w \'' + token + '\'', function (err, result) {
    if (result.indexOf('\n') >= 0) result = result.replace('\n','');
    var reg;
    // Token 'p' gets err somehow.
    try {
      reg = new RegExp(result, 'i');
    } catch (e) {
      reg = new RegExp(token, 'i');
    }
    callback(err, !err && reg);
  });
};

var getMatchedName = function (reg) {
  return store.filter(function (category) {
    return reg.test(category.CategoryName);
  });
};

var getMatchedPath = function (reg) {
  return store.filter(function (category) {
    return reg.test(category.CategoryPath);
  });
};

var compareByName = function (a, b) {
  return a.CategoryName > b.CategoryName ? 1 : -1;
};

var compareByPath = function (a, b) {
  return a.CategoryPath > b.CategoryPath ? 1 : -1;
};

module.exports.search = search = function (token, maxMatches, callback) {
  createRegExp(token, function (err, reg) {
    var matched = [];
    if (!err) {
      // mm....
      matched = getMatchedName(reg).sort(compareByName);
      if (matched.length > maxMatches) {
        matched.length = maxMatches;
      } else {
        // TODO: Remove duplicate.
        matched = matched.concat(getMatchedPath(reg).sort(compareByPath));
        if (matched.length > maxMatches) matched.length = maxMatches;
      }
    }
    callback(err, matched);
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
