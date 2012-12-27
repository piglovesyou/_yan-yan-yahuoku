
var APPID = require('secret-strings').AUC_PRO.CONSUMER_KEY;
var http = require('http');
var querystring = require('querystring');
var oa = require('../core/oauth');



/**
 * @param {string} responseText .
 * @return {string} .
 */
var sliceExtraString = (function() {
  var left = 'loaded('.length;
  var right = ')'.length;
  return function(responseText) {
    return responseText.slice(left, responseText.length - right);
  };
})();



/**
 * @param {string} path .
 * @param {Object} param .
 * @param {function} callback .
 */
module.exports.get = function(path, param, callback) {
  var body = '';
  param.appid = APPID;
  http.request({
      host: 'auctions.yahooapis.jp',
      method: 'GET',
      path: '/AuctionWebService/V2/json/' +
        path + '?' + querystring.stringify(param)
    }, function(res) {
    res.on('data', function(chunk) { body += chunk });
    res.on('error', function() { callback(true) });
    res.on('end', function() {
      callback(false, sliceExtraString(body));
    });
  }).end();
};



/**
 * @param {{oauth_token: string, oauth_token_secret: string}} oauth .
 * @param {string} path .
 * @param {Object} content .
 * @param {function(boolean, Object, Object)} callback Arguments are
 *                                        err, data, response.
 */
module.exports.post = function(oauth, path, content, callback) {
  oa.post(
    'https://auctions.yahooapis.jp/AuctionWebService/V1/' + path,
    oauth.access_token,
    oauth.access_token_secret,
    content,
    callback);
};
