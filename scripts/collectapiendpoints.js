var jsdom = require('jsdom');
var u = require('url');
var p = require('path');
var fs = require('fs');
var assert = require('assert');
var _ = require('underscore');
var beautifier = require('beautifier');



assert(fs.existsSync(__dirname + '/../package.json'),
       'CALL IT FROM PROJECT BASE DIRECTORY.');

USE_OLD = true; // Use OAuth1.0


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
  fs.writeFileSync(__dirname + '/../sources/model/apiendpoints.json',
                   beautifier.js_beautify(JSON.stringify(obj)));
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
      var reqUrlEl = win.$('.reqUrl');
      var siblingText;
      if (USE_OLD && (siblingText = win.$(reqUrlEl).next().text())
                      .indexOf('OAuth1.0') >= 0) {
        // Old version is always XML.
        // Rough regexp!
        table['XML'] = siblingText.match(/http[^ ]+/)[0];
      } else {
        win.$('.gp', reqUrlEl).each(function(i, el) {
          table[win.$('> .format', el).text()] = win.$('> .url', el).text();
        });
      }
      assert(!_.isEmpty(table));
      apiTable[p.basename(take(table), '.html')] = table;
      if (!--len) {
        assert(!_.isEmpty(apiTable));
        out(apiTable);
        console.log('  ..done.');
      }
    });
  });
});
