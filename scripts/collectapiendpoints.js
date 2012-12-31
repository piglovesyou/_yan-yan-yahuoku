var jsdom = require('jsdom');
var u = require('url');
var p = require('path');
var fs = require('fs');
var assert = require('assert');
var _ = require('underscore');


assert(fs.existsSync(__dirname + '/../package.json'),
       'CALL IT FROM PROJECT BASE DIRECTORY.');


var baseUrl = u.parse('http://developer.yahoo.co.jp/'); // webapi/auctions/';


/**
 * @param {string} path .
 * @param {Function(boolean, Object)} callback Args are (err, window).
 */
var fetch = function(path, callback) {
  jsdom.env({
    html: u.resolve(baseUrl, path),
    scripts: ['http://code.jquery.com/jquery.js'],
    done: callback
  });
};


/**
 * @param {Object} obj .
 */
var out = function(obj) {
  fs.writeFileSync(__dirname +
                   '/../sources/model/apiendpoints.json', JSON.stringify(obj));
};


var apiTable = {};

var take = function(obj) {
  for (var k in obj) return obj[k];
};

fetch('/webapi/auctions/', function(err, win) {
  var urls = [];
  win.$('#main dt a').each(function(i, el) {
    urls.push(win.$(el).attr('href'));
  });
  assert(!_.isEmpty(urls));
  var len = urls.length;
  urls.forEach(function(url) {
    fetch(url, function(err, win) {
      var table = {};
      win.$('.reqUrl .gp').each(function(i, el) {
        table[win.$('> .format', el).text()] =
          win.$('> .url', el).text();
      });
      assert(!_.isEmpty(table));
      apiTable[p.basename(take(table), '.html')] = table;
      if (!--len) {
        assert(!_.isEmpty(apiTable));
        out(apiTable);
        // process.exit();
      }
    });
  });
});
