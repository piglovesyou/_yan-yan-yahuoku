
var _ = require('underscore');
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
    category['CategoryPath'] = category['CategoryPath'].slice(9);
    if (category['ChildCategory'] && _.isArray(category['ChildCategory'])) {
      category['ChildCategory'].forEach(function (category) {
        category['CategoryPath'] = category['CategoryPath'].slice(9);
      });
    }
    store.push(category);
  });
};

var createRegExp = function (token, callback) {
  token = shellEscape(token);
  exec('cmigemo -nq -d /usr/local/share/migemo/utf-8/migemo-dict -n -w \'' + token + '\'', function (err, result) {
    console.log(result);
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

/**
 * Notice: Destructive.
 */
var expandChildren = function (rows) {
  for (var i = rows.length - 1,row=[i]; i>=0; row=rows[i--]) {
    if (row.IsLeaf == 'false' && _.isArray(row.ChildCategory)) {
      rows.splice.apply(rows, _.flatten([i + 1, 0, row.ChildCategory]));
    }
  }
};

module.exports.search = search = function (token, maxMatches, callback) {
  createRegExp(token, function (err, reg) {
    var matched = [];
    if (!err) {
      // mm....
      matched = getMatchedName(reg).sort(compareByName); // TODO: use underscore.
      if (matched.length < maxMatches) {
        // Remove duplicate.
        var matchedIds = matched.map(function (row) {
          return row.CategoryId;
        });
        var anotherMatched = getMatchedPath(reg).sort(compareByPath);
        var anotherMatchedIds = anotherMatched.map(function (row) {
          return row.CategoryId;
        });
        var intersection = _.intersection(matchedIds, anotherMatchedIds);
        anotherMatched = anotherMatched.filter(function (row) {
          return !_.contains(intersection, row.CategoryId);
        });
        matched = matched.concat(anotherMatched);
      }
    }
    // XXX: I quit to manage subcategories in autocomplete! But, how then?
    // expandChildren(matched); 
    
    if (matched.length > maxMatches) matched.length = maxMatches;
    callback(err, matched);
  });
};

loadKeys(function (keys) {
  keys.forEach(function (key) {
    loadCategory(key);
  });
});

shellEscape = function(s) {
  return String(s).replace(/([|&;<>()$`"'\t\n\r*?[#˜~=%])/g, "\\$1");
};


// setTimeout(function () {
//   var now = Date.now();
//   search('hon', function (err, result) {
//     console.log('result: ' + (Date.now() - now)/1000 + 's');
//   });
// }, 3000);
