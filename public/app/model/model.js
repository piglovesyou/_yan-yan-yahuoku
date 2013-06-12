
goog.provide('app.Model');
goog.provide('app.model');

goog.require('app.events.EventType');
goog.require('app.model.Xhr');
goog.require('goog.Timer');
goog.require('goog.events.EventTarget');
goog.require('goog.storage.CollectableStorage');
goog.require('goog.storage.mechanism.HTML5LocalStorage');
goog.require('goog.storage.mechanism.HTML5SessionStorage');



/**
 * @constructor
 * @extends {goog.events.EventTarget}
 */
app.Model = function() {
  goog.base(this);
  this.sessionStore_ = new goog.storage.CollectableStorage(
      new goog.storage.mechanism.HTML5SessionStorage());
  this.localStore_ = new goog.storage.CollectableStorage(
      new goog.storage.mechanism.HTML5LocalStorage());
};
goog.inherits(app.Model, goog.events.EventTarget);
goog.addSingletonGetter(app.Model);


/**
 * @enum {string}
 */
app.Model.EventType = {
  UPDATE_TABQUERY: 'updatetabquery',
  UPDATE_TABIDS: 'updatetabids',
  UPDATE_ITEMCACHE: 'updateitemcache'
};


/**
 * @enum {number}
 */
app.Model.ExpireTime = {
  AUCTION_ITEM: 60 * 1000
};


/**
 * @enum {string}
 */
app.Model.Key = {
  TAB_IDS: 'tab:ids'
};


/**
 * @type {boolean}
 * @private
 */
app.Model.prototype.isAuthed_;


/**
 * Called ONLY from 'main.js' and auth popup window.
 * @param {boolean} authed .
 */
app.Model.prototype.updateAuthState = function(authed) {
  if (this.isAuthed_ === authed) return;

  this.isAuthed_ = authed;
  this.dispatchEvent({
    type: app.events.EventType.AUTH_STATE_CHANGED,
    isAuthed: authed
  });
  if (authed) app.message.success('認証が完了しました。<a href="/auth/logout">ログアウト</a>');
};
app.Model.prototype['updateAuthState'] =
  app.Model.prototype.updateAuthState;


/**
 * @param {app.Model.ExpireTime} baseTime .
 * @return {number} .
 * @private
 */
app.Model.prototype.getLifeTime_ = function(baseTime) {
  return baseTime + goog.now();
};


/**
 * @enum {string}
 */
app.Model.KeyPrefix = {
  AUCTION_ITEM_: 'auctionitem:',
  TAB_: 'tab:',
  // DETAILTITLEFIXEDSTATE_: 'detailtitlefixedstate:',
  _DETAILPANEWIDTH_: ':detailpanewidth',
  _ISGRID_: ':isGrid:'
};


/**
 * @return {?Array} .
 */
app.Model.prototype.getTabIds = function() {
  var ids = this.localStore_.get(app.Model.Key.TAB_IDS);
  return goog.isDefAndNotNull(ids) && goog.isArray(ids) ? ids : null;
};


/**
 * @param {Array.<string>} ids .
 */
app.Model.prototype.setTabIds = function(ids) {
  goog.asserts.assert(goog.isArray(ids) && goog.array.every(ids, function(id) {
    return goog.isString(id) && !goog.string.isEmpty(id);
  }), 'Wrong value to store');
  this.localStore_.set(app.Model.Key.TAB_IDS, ids);
  this.dispatchEvent(app.Model.EventType.UPDATE_TABIDS);
};


/**
 * @param {string} tabId .
 * @return {?Object} Query and category data.
 */
app.Model.prototype.getTabQuery = function(tabId) {
  var data = this.localStore_.get(app.Model.KeyPrefix.TAB_ + tabId);
  return goog.isObject(data) ? data : null;
};


/**
 * @param {string} tabId .
 */
app.Model.prototype.deleteTabQuery = function(tabId) {
  var storage = this.localStore_;
  storage.remove(app.Model.KeyPrefix.TAB_ + tabId);
  storage.remove(app.Model.KeyPrefix.TAB_ +
                 tabId + app.Model.KeyPrefix._DETAILPANEWIDTH_);
  storage.remove(app.Model.KeyPrefix.TAB_ +
                 tabId + app.Model.KeyPrefix._ISGRID_);
};


/**
 * @param {string} tabId .
 * @param {Object} data Query and category data.
 */
app.Model.prototype.setTabQuery = function(tabId, data) {
  var ref;
  goog.asserts.assert(
      goog.isString(data['query']) &&
      goog.isObject(ref = data['category']) &&
      (goog.isString(ref['CategoryId']) || goog.isNumber(ref['CategoryId'])) &&
      goog.isString(ref['CategoryPath']),
      'Wrong data to store');
  this.localStore_.set(app.Model.KeyPrefix.TAB_ + tabId, data);
  this.dispatchEvent({
    type: app.Model.EventType.UPDATE_TABQUERY,
    id: tabId
  });
};


/**
 * @param {string} url .
 * @param {Function} callback .
 * @param {Object=} opt_obj .
 */
app.Model.prototype.getRemoteHtml = function(url, callback, opt_obj) {
  app.model.Xhr.getInstance().get(url, {
    'noLayout': 1
  }, function(err, html) {
    callback.call(opt_obj, err, html);
  });
};


/**
 * @param {string} id .
 * @param {Function} callback .
 * @param {Object=} opt_obj .
 */
app.Model.prototype.getAuctionItem = function(id, callback, opt_obj) {
  var storage = this.sessionStore_;
  var key = app.Model.KeyPrefix.AUCTION_ITEM_ + id;
  var data = storage.get(key);
  if (data) {
    callback.call(opt_obj, false, data);
  } else {
    app.model.Xhr.getInstance().get('/y/auctionItem', {
      'auctionID': id
    }, function(err, json) {
      var itemData;
      if (!err) {
        itemData = json['ResultSet']['Result'];
        try {
          storage.set(key, itemData,
            this.getLifeTime_(app.Model.ExpireTime.AUCTION_ITEM));
        } catch (e) {
          storage.collect();
          storage.set(key, itemData,
            this.getLifeTime_(app.Model.ExpireTime.AUCTION_ITEM));
        }
      }
      callback.call(opt_obj, err, itemData);
    }, this);
  }
  goog.Timer.callOnce(function() {
    storage.collect();
  });
};


// /**
//  * @param {boolean} fixed .
//  */
// app.Model.prototype.setDetailTitleFixedState = function(fixed) {
//   var storage = this.localStore_;
//   storage.set(app.Model.KeyPrefix.DETAILTITLEFIXEDSTATE_, !!fixed);
// };


// /**
//  * @return {boolean} .
//  */
// app.Model.prototype.getDetailTitleFixedState = function() {
//   var storage = this.localStore_;
//   return !!storage.get(app.Model.KeyPrefix.DETAILTITLEFIXEDSTATE_);
// };


/**
 * @param {string} tabId .
 * @param {number} width .
 */
app.Model.prototype.setDetailPaneWidth = function(tabId, width) {
  goog.asserts.assertNumber(width, 'Invalid type for detail pane width.');
  goog.asserts.assert(width > 0, 'Invalid width for detail pane.');
  var storage = this.localStore_;
  storage.set(app.Model.KeyPrefix.TAB_ + tabId +
              app.Model.KeyPrefix._DETAILPANEWIDTH_, width);
};


/**
 * @param {string} tabId .
 * @return {?number} .
 */
app.Model.prototype.getDetailPaneWidth = function(tabId) {
  var storage = this.localStore_;
  var num = storage.get(app.Model.KeyPrefix.TAB_ + tabId +
              app.Model.KeyPrefix._DETAILPANEWIDTH_);
  return num;
};


/**
 * @return {Object} .
 */
app.Model.prototype.createEmptyTab = function() {
  return {
    'query': ['たらば', 'ずわい'][Math.round(Math.random())],
    'category': {
      'CategoryId': 0,
      'CategoryPath': ''
    }
  };
};


/**
 * @param {string} tabId .
 * @param {boolean} isGrid .
 */
app.Model.prototype.setAlignmentStyle = function(tabId, isGrid) {
  goog.asserts.assertBoolean(isGrid, 'Invalid type to set list or grid.');
  var storage = this.localStore_;
  storage.set(app.Model.KeyPrefix.TAB_ + tabId +
              app.Model.KeyPrefix._ISGRID_, isGrid);
};


/**
 * @param {string} tabId .
 * @return {boolean} .
 */
app.Model.prototype.getAlignmentStyle = function(tabId) {
  var storage = this.localStore_;
  return !!storage.get(app.Model.KeyPrefix.TAB_ + tabId +
              app.Model.KeyPrefix._ISGRID_);
};


/**
 * @param {string} method .
 * @param {string} path .
 * @param {Object} params .
 * @param {Function(?goog.net.XhrIo, ?Object)} callback .
 * @param {Object=} opt_obj .
 * @private
 */
app.Model.prototype.requestWithOAuth_ = function(method, path,
                                                 params, callback, opt_obj) {
  var xhr = app.model.Xhr.getInstance();
  var fn = method === 'GET' ? xhr.get : xhr.post;
  fn.call(xhr, path, params, function(err, response) {
    if (err && err.getStatusText() === 'Unauthorized') {
      this.updateAuthState(false);
    }
    callback.apply(opt_obj, arguments);
  }, this);
};


/**
 * @param {string} itemId to add to watch list.
 * @param {Function} callback .
 * @param {Object=} opt_obj .
 */
app.Model.prototype.addWatchList = function(itemId, callback, opt_obj) {
  this.requestWithOAuth_('POST', '/y/watchList', {
    'auctionID': itemId
  }, callback, opt_obj);
};


/**
 * @return {boolean} .
 */
app.Model.prototype.isAuthed = function() {
  return this.isAuthed_;
};


/**
 * Notice: This should be called only from 'logout' window.
 */
app.Model.prototype.flushAll = function() {
  this.sessionStore_.mechanism.clear();
  this.localStore_.mechanism.clear();
};
app.Model.prototype['flushAll'] = app.Model.prototype.flushAll;




/**
 * I want to use 'app.model' namespace for app.Model instance in global.
 */
var ref = app.model.Xhr;

goog.exportSymbol('app.model');

/**
 * I want this name space in global.
 * @type {app.Model}
 */
app.model = app.Model.getInstance();
window['app']['model'] = app.model;

/**
 */
app.model.Xhr = ref;
