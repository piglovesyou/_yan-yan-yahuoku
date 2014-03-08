
// #################### 
// Deprecated
// #################### 

var yahoo = require('../sources/net/yahoo');
var redis = require('redis').createClient();
var stack = require('../sources/util/queue');





var request = function (id, callback) {
  yahoo.get('categoryTree', {category: id}, function (err, responseText) {
    if (err) return;
    try {
      callback(err, JSON.parse(responseText).ResultSet.Result);
    } catch (e) {
      console.log(':::::::::::: ' + e);
      console.log(responseText);
    }
  });
};


var toRedisKey = function (id) {
  return 'y_catid:' + id;
};



/**
 * @param {boolean} err
 * @param {Object} data
 */
var checkChildren = function (err, data) {
  if (err) return new Error('Error on callback');
  if (data.IsLeaf == 'false' && data.ChildCategory.length > 0) {
    data.ChildCategory.forEach(function (child) {
      stack.push(check.bind(null, child.CategoryId));
    });
  }
};




var onFly = 0;
var check = function (id) {
  var key = toRedisKey(id);

  redis.exists(key, function (err, exists) {
    if (exists) {
      redis.get(key, function (err, data) {
        var data = JSON.parse(data);
        console.log('exists: ' + data.CategoryPath);
        checkChildren(err, data);
      });
    } else {
      onFly++;
      request(id, function (err, data) {
        onFly--;
        console.log('onFly: ' + onFly + ', receive: ' + data.CategoryPath);
        redis.set(key, JSON.stringify(data));
        checkChildren.apply(null, arguments);
      });
    }
  });
};

stack.push(check.bind(null, 0));

stack.exec(10);

// send(2084050628);
