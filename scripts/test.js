
var redis = require('redis').createClient();
var completer = require('redis-completer');
completer.applicationPrefix('y_cat');


// EXISTS
// redis.exists("y_catid:2084057394:data", function (err, bool) {
//   console.log(bool);
// });


// SEARCH
completer.search('s', 2, function (err, arr) {
  console.log(arr.sort());
});


// DELETE
// redis.keys('yahooauction*', function (err, data) {
//   var len = data.length;
//   data.forEach(function (key) {
//     redis.del(key, function () {
//       console.log(len);
//       if (--len <= 0) console.log('done');
//     });
//   });
// });



// AUTOCOMPLETER
// redis.keys('y_catid:*', function (err, data) {
//   if (err) return new Error(err);
// 
//   var i = 0;
//   data.forEach(function (key) {
//     i++;
//     redis.get(key, function (err, str) {
//       if (err) return new Error(err);
//       var data = JSON.parse(str);
// 
//       completer.addCompletions(data.CategoryPath, data.CategoryId, 10);
//       console.log(--i);
//       if (i <= 0) process.end();
//     });
//   });
//   
// });
