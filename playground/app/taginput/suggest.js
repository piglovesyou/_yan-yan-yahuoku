
goog.provide('app.taginput.Suggest');

goog.require('goog.ui.ac.AutoComplete');
goog.require('goog.ui.ac.InputHandler');
goog.require('goog.ui.ac.RemoteArrayMatcher');
goog.require('goog.ui.ac.Renderer');
goog.require('goog.style');



/**
 * @constructor
 */
app.taginput.Suggest = function (input) {
  var url = '/category/indexed/select?wt=json';
  var opt_multi = false;
  var opt_useSimilar = false;

  var matcher = new app.taginput.Suggest.RemoteArrayMatcher(url, !opt_useSimilar);
  this.matcher_ = matcher;

  var renderer = new goog.ui.ac.Renderer(undefined, new app.taginput.Suggest.CustomRenderer);

  var inputhandler = new app.taginput.Suggest.InputHandler(null, null, !!opt_multi, 300);

  this.setAllowFreeSelect(true);
  this.setAutoHilite(false);
  goog.ui.ac.AutoComplete.call(this, matcher, renderer, inputhandler);

  inputhandler.attachAutoComplete(this);
  inputhandler.attachInputs(input);
};
goog.inherits(app.taginput.Suggest, goog.ui.ac.AutoComplete);


/**
 * @constructor
 */
app.taginput.Suggest.CustomRenderer = function() {};
app.taginput.Suggest.CustomRenderer.prototype.render = function(renderer, element, rows, token) {
  var dh = goog.dom.getDomHelper(element);

  var container,
      wrap = dh.createDom('div', 'pure-menu pure-menu-open',
            dh.createDom('a', 'pure-menu-heading', 
                  dh.createDom('span', 'right', 'Enterでキーワード決定'),
                  'カテゴリー候補'),
            container = dh.createDom('ul'));

  token = goog.string.htmlEscape(token);
  goog.array.forEach(rows, function(row) {

    // var li = app.ui.category.Suggest.CustomRenderer.createLi(renderer, data, token, dh, false, false);
    var li = dh.createDom('li', {
      id: row.data['CategoryId']
    }, 
      dh.createDom('a', {
        // 'href': 'javascript:void 0'
      }, row.data['CategoryName'],
         dh.createDom('span', 'mute', row.data['CategoryPath'])));

    renderer.rowDivs_.push(li);

    container.appendChild(li);
  });
  element.appendChild(wrap);
  return element;
}

/**
 * @constructor
 */
app.taginput.Suggest.RemoteArrayMatcher = function (url, opt_noSimilar) {
  goog.base(this, url, opt_noSimilar) 
}
goog.inherits(app.taginput.Suggest.RemoteArrayMatcher, goog.ui.ac.RemoteArrayMatcher);

/** @inheritDoc */
app.taginput.Suggest.RemoteArrayMatcher.prototype.parseResponseText = function(responseText) {
  var json;
  try {
    json = goog.json.unsafeParse(responseText);
  } catch (e) {}
  return json ? goog.getObjectByName('response.docs', json) : [];
};

/** @inheritDoc */
app.taginput.Suggest.RemoteArrayMatcher.prototype.buildUrl = function(uri,
    token, maxMatches, useSimilar, opt_fullString) {
  var url = new goog.Uri(uri);

  var q = token ? '(CategoryName:"' + token + '" OR CategoryName:*' + token + '*)' : '';
  url.setParameterValue('q', q);
  url.setParameterValue('sort', 'CategoryName asc');

  return url.toString();
};




/**
 * @param {?string=} opt_separators Separators to split multiple entries.
 *     If none passed, uses ',' and ';'.
 * @param {?string=} opt_literals Characters used to delimit text literals.
 * @param {?boolean=} opt_multi Whether to allow multiple entries
 *     (Default: true).
 * @param {?number=} opt_throttleTime Number of milliseconds to throttle
 *     keyevents with (Default: 150). Use -1 to disable updates on typing. Note
 *     that typing the separator will update autocomplete suggestions.
 * @constructor
 * @extends {goog.Disposable}
 */
app.taginput.Suggest.InputHandler = function (opt_separators, opt_literals,
    opt_multi, opt_throttleTime) {
  goog.base(this, opt_separators, opt_literals, opt_multi, opt_throttleTime);
}
goog.inherits(app.taginput.Suggest.InputHandler, goog.ui.ac.InputHandler);

app.taginput.Suggest.InputHandler.EventType = {
  KEY: 'kkk'
};

app.taginput.Suggest.InputHandler.prototype.handleKeyEvent = function (e) {
  goog.mixin(e, { 'type': app.taginput.Suggest.InputHandler.EventType.KEY });
  if (!this.getAutoComplete().dispatchEvent(e)) return;
  goog.base(this, 'handleKeyEvent', e);
};

app.taginput.Suggest.InputHandler.prototype.selectRow = function (row, opt_multi) {
  return false;
};
