
var APPID = require('secret-strings').AUC_PRO.CONSUMER_KEY;
var http = require('http');
var querystring = require('querystring');
var oa = require('../core/oauth.js');

var YAPI = 'http://auctions.yahooapis.jp/AuctionWebService/V2/';

/**
 * @param {string} method (GET|POST)
 * @param {string} path
 * @param {Object} param
 */
var createRequestOption = module.exports.createRequestOption = function (method, path, param) {
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

/**
 * @param {string} path
 * @param {Object} param
 * @param {Function} callback
 */
module.exports.requestGet = function (path, param, callback) {
  var body = '';
  http.request(createRequestOption('GET', path, param), function (res) {
    res.on('data', function (chunk) { body += chunk });
    res.on('error', function () { callback(true) });
    res.on('end', function () {
      callback(false, body.replace(/^loaded\(/, '').replace(/\)$/, ''))
    });
  }).end();
};
