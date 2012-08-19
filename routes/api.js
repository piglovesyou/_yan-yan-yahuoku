
var APPID = require('secret-strings').AUC_PRO.CONSUMER_KEY;
var http = require('http');
var querystring = require('querystring');

var oa = require('../sources/core/oauth.js');

var YAPI = 'http://auctions.yahooapis.jp/AuctionWebService/V2/';

var createRequestOption = function (method, path, param) {
  param.appid = APPID;
  return {
    host: 'auctions.yahooapis.jp',
    method: method,
    path: '/AuctionWebService/V2/json/' +
      path +
      '?' +
      querystring.stringify(param)
  };
}

var requestGet = function (path, param, callback) {
  var body = '';
  http.request(createRequestOption('GET', path, param), function (res) {
    res.on('data', function (chunk) {body += chunk});
    res.on('error', function () { callback(true); });
    res.on('end', function () { callback(false, body); });
  }).end();
};

// categoryTree
// categoryLeaf

exports.categoryTree = function (req, res) {
  requestGet('categoryTree', req.query, function (err, data) {
    res.end(data);
  });
};
