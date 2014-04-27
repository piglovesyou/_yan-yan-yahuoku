
var http = require('http');
var querystring = require('querystring');
var oa = require('../core/oauth');
var xmlParser = require('xml2json');
var u = require('url');
var assert = require('assert');


var APPID = require('secret-strings').AUC_PRO.CONSUMER_KEY;
var ENDPOINTS = require('../model/model').getApiEndpoints();
var ERROR_MESSAGE = '{"Error":{"Message":"Request was not sent."}}';






/**
 * @param {string} text JSON or XML.
 * @param {boolean} opt_isXml .
 * @return {string} .
 */
var parseResponseText = (function() {
  var prefix = 'loaded(';
  var left = prefix.length;
  var right = ')'.length;
  return function(text, opt_isXml) {
    if (!opt_isXml) {
      if (text.slice(0, prefix.length) === prefix) {
        return text.slice(left, text.length - right);
      } else {
        return text;
      }
    } else {
      // XXX: I'm not sure if it works.
      try {
        return xmlParser.toJson(text);
      } catch (err) {
        return text;
      }
    }
  };
})();


/**
 * @param {string} path .
 * @return {?Object} Native url object.
 */
var grabEndpointUrl = function(path) {
  var formats = ENDPOINTS[path];
  if (formats) {
    if (formats.JSONP) {
      return u.parse(formats.JSONP);
    } else if (formats.XML) {
      var url = u.parse(formats.XML);
      url.useXML = true;
      return url;
    }
  }
  assert.fail(url, 'DON\'T LISTEN UNKNOWN PATH.');
  return null;
};


/**
 * Resolve url & query perfectly.
 * (I feel like nodejs will change spec of `url.resolve' in the future..)
 *
 * @param {Object} url Url Object.
 * @param {Object} query Get parameters.
 * @return {string} Perfect url string.
 */
var resolveUrl = function(url, query) {
  return u.resolve(url.href, '?' + querystring.stringify(query));
};


/**
 * @param {string} path .
 * @param {Object} query .
 * @param {function} callback .
 */
module.exports.get = function(path, query, callback) {
  var url = grabEndpointUrl(path);
  var body = '';
  query.appid = APPID;
  http.request({
      host: url.host,
      method: 'GET',
      path: url.path + '?' + querystring.stringify(query)
    }, function(res) {
    res.on('data', function(chunk) { body += chunk });
    res.on('error', function() { callback(true) });
    res.on('end', function() {
      callback(false, parseResponseText(body, url.useXML));
    });
  }).end();
};


/**
 * Notice: Be careful, arguments for `oa.get' and `oa.post' are not same!
 * @param {{oauth_token: string, oauth_token_secret: string}} oauth .
 * @param {string} path .
 * @param {Object} query .
 * @param {function(boolean, Object, Object)} callback Arguments are
 *                                            err, data, response.
 */
module.exports.getWithOAuth = function(oauth, path, query, callback) {
  var url = grabEndpointUrl(path);
  oa.get(
    resolveUrl(url, query),
    oauth.access_token,
    oauth.access_token_secret,
    function(err, response, data) {
      callback(err, parseResponseText(response, url.useXML), data);
    });
};


/**
 * @param {{oauth_token: string, oauth_token_secret: string}} oauth .
 * @param {string} path .
 * @param {Object} content .
 * @param {function(boolean, Object, Object)} callback Arguments are
 *                                            err, data, response.
 */
module.exports.postWithOAuth = function(oauth, path, content, callback) {
  var url = grabEndpointUrl(path);
  oa.post(
    url.href,
    oauth.access_token,
    oauth.access_token_secret,
    content,
    function(err, response, data) {
      callback(err, parseResponseText(response, url.useXML), data);
    });
};
