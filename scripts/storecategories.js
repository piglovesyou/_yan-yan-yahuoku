
var yapi = require('../sources/net/yahooapi');
var client = require('redis').createClient();


var onFly = 0;
var send = function (id) {
  yapi.requestGet('categoryTree', {category: id}, function (err, responseText) {
    onFly--;
    if (err) return;
    try {
      var data = JSON.parse(responseText).ResultSet.Result;
      client.hmset('yahooauctioncategory:' + id, data, function (err, replies) {
        console.log(data.CategoryPath);
        if (data.IsLeaf == 'false' && data.ChildCategory.length > 0) {
          data.ChildCategory.forEach(function (child) {
            send(child.CategoryId);
          });
        }
        if (onFly == 0) process.exit();
      });
    } catch (e) {
      console.log(':::::::::::: ' + e);
      console.log(responseText);
    }
  });
  onFly++;
};

// send(0);
send(2084050628);
