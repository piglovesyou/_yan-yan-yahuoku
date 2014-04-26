
goog.require('goog.ui.ac.AutoComplete');
goog.require('goog.ui.ac.InputHandler');
goog.require('goog.ui.ac.RemoteArrayMatcher');
goog.require('goog.ui.ac.Renderer');
goog.require('goog.style');



var input = document.querySelector('.header-input-textbox');
goog.style.setWidth(input, 500);



function onInputFocus(el) {
  disposeInputDecoration(el);

  if (!el.suggest) el.suggest = new pig.Suggest(el);
  (el.eh = new goog.events.EventHandler)
    .listen(el, 'blur', handleFocusableBlur)
}

function handleFocusableBlur(e) {
  disposeInputDecoration(e.target)
}

function disposeInputDecoration(el) {
  // if (el.suggest) el.suggest.dispose();
  if (el.eh) el.eh.dispose(); // Finally, dispose eh.
}

goog.provide('pig.Suggest');
pig.Suggest = function (input) {
  var url = '/category/indexed/select?wt=json';
  var opt_multi = false;
  var opt_useSimilar = false;

  var matcher = new pig.Suggest.RemoteArrayMatcher(url, !opt_useSimilar);
  this.matcher_ = matcher;

  var renderer = new goog.ui.ac.Renderer(undefined, new pig.Suggest.CustomRenderer);
  // renderer.activeClassName

  var inputhandler = new goog.ui.ac.InputHandler(null, null, !!opt_multi, 300);

  this.setAllowFreeSelect(true);
  this.setAutoHilite(false);
  goog.ui.ac.AutoComplete.call(this, matcher, renderer, inputhandler);

  inputhandler.attachAutoComplete(this);
  inputhandler.attachInputs(input);
};
goog.inherits(pig.Suggest, goog.ui.ac.AutoComplete);

/**
 * @constructor
 */
pig.Suggest.CustomRenderer = function() {};
pig.Suggest.CustomRenderer.prototype.render = function(renderer, element, rows, token) {
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
pig.Suggest.RemoteArrayMatcher = function (url, opt_noSimilar) { goog.base(this, url, opt_noSimilar) }
goog.inherits(pig.Suggest.RemoteArrayMatcher, goog.ui.ac.RemoteArrayMatcher);

/** @inheritDoc */
pig.Suggest.RemoteArrayMatcher.prototype.parseResponseText = function(responseText) {
  var json;
  try {
    json = goog.json.unsafeParse(responseText);
  } catch (e) {}
  return json ? goog.getObjectByName('response.docs', json) : [];
};

/** @inheritDoc */
pig.Suggest.RemoteArrayMatcher.prototype.buildUrl = function(uri,
    token, maxMatches, useSimilar, opt_fullString) {
  var url = new goog.Uri(uri);

  url.setParameterValue('q', 'CategoryName:' + token);
  return url.toString();
};
