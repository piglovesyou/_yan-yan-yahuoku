
var APPID = require('secret-strings').AUC_PRO.CONSUMER_KEY;
var http = require('http');
var querystring = require('querystring');
var oa = require('../core/oauth');
var xmlParser = require('xml2json');
var u = require('url');


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
 * @return {?Object} Url object.
 */
var grabEndpointUrl = function(path) {
  var formats = ENDPOINTS[path];
  if (!formats) {
    return null;
  }
  if (formats.JSONP) {
    return u.parse(formats.JSONP);
  } else if (formats.XML) {
    var url = u.parse(formats.XML);
    url.useXML = true;
    return url;
  }
  return null;
};


/**
 * @param {string} path .
 * @param {Object} param .
 * @param {function} callback .
 */
module.exports.get = function(path, param, callback) {
  var url = grabEndpointUrl(path);
  if (!url) callback(true, ERROR_MESSAGE);
  var body = '';
  param.appid = APPID;
  http.request({
      host: url.host,
      method: 'GET',
      path: url.path + '?' + querystring.stringify(param)
    }, function(res) {
    res.on('data', function(chunk) { body += chunk });
    res.on('error', function() { callback(true) });
    res.on('end', function() {
      callback(false, parseResponseText(body, url.useXML));
    });
  }).end();
};


/**
 * @param {string} method .
 * @param {{oauth_token: string, oauth_token_secret: string}} oauth .
 * @param {string} path .
 * @param {Object} param .
 * @param {function(boolean, Object, Object)} callback Arguments are
 *                                            err, data, response.
 */
var requestWithOAuth = function(method, oauth, path, param, callback) {
  var url = grabEndpointUrl(path);
  if (!url) callback(true, ERROR_MESSAGE);
  var fn = method === 'GET' ? oa.get : oa.post;
  fn.call(oa,
    url.href,
    oauth.access_token,
    oauth.access_token_secret,
    param,
    function(err, response, data) {
      if (err) callback(true, response);
      callback.call(null, false, parseResponseText(response, url.useXML), data);
    });
};


/**
 * @param {{oauth_token: string, oauth_token_secret: string}} oauth .
 * @param {string} path .
 * @param {Object} param .
 * @param {function(boolean, Object, Object)} callback Arguments are
 *                                            err, data, response.
 */
module.exports.getWithAuth = function(oauth, path, param, callback) {
  requestWithOAuth('GET', oauth, path, param, callback);
};


/**
 * @param {{oauth_token: string, oauth_token_secret: string}} oauth .
 * @param {string} path .
 * @param {Object} content .
 * @param {function(boolean, Object, Object)} callback Arguments are
 *                                            err, data, response.
 */
module.exports.postWithOAuth = function(oauth, path, content, callback) {
  requestWithOAuth('POST', oauth, path, content, callback);
};
