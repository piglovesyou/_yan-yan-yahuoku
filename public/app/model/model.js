
goog.provide('app.Model');

goog.require('goog.storage.CollectableStorage');
goog.require('goog.storage.mechanism.HTML5SessionStorage');
goog.require('goog.storage.mechanism.HTML5LocalStorage');
goog.require('app.model.Xhr');
goog.require('goog.events.EventTarget');
goog.require('goog.Timer');


/**
 * @constructor
 * @extends {goog.events.EventTarget}
 */
app.Model = function () {
  goog.base(this);
  this.sessionStore_ = new goog.storage.CollectableStorage(new goog.storage.mechanism.HTML5SessionStorage());
  this.localStore_ = new goog.storage.CollectableStorage(new goog.storage.mechanism.HTML5LocalStorage());
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
 * @return {goog.storage.CollectableStorage}
 */
app.Model.prototype.getSessionStore = function () {
  return this.sessionStore_;
};


/**
 * @return {goog.storage.CollectableStorage}
 */
app.Model.prototype.getLocalStore = function () {
  return this.localStore_;
};




/**
 * Model utility namespace.
 */

/**
 * @private
 * @return {goog.storage.CollectableStorage}
 */
app.model.getLocalStore_ = function () {
  return app.Model.getInstance().getLocalStore();
};


/**
 * @private
 * @return {goog.storage.CollectableStorage}
 */
app.model.getSessionStore_ = function () {
  return app.Model.getInstance().getSessionStore();
};


/**
 * @enum {number}
 */
app.model.ExpireTime = {
  AUCTION_ITEM: 60 * 1000
};


/**
 * @param {app.model.ExpireTime} baseTime
 */
app.model.getLifeTime_ = function (baseTime) {
  return baseTime + goog.now();
};


/**
 * @enum {string}
 */
app.model.Key = {
  TAB_IDS: 'tab:ids'
};


/**
 * @enum {string}
 */
app.model.KeyPrefix = {
  AUCTION_ITEM_: 'auctionitem:',
  TAB_: 'tab:',
  DETAILTITLEFIXEDSTATE_: 'detailtitlefixedstate:',
  _DETAILPANEWIDTH_: ':detailpanewidth',
  _ISGRID_: ':isGrid:'
};


/**
 * @param {string} id
 * @return {string}
 */
app.model.getAuctionItemKey_ = function (id) {
  return app.model.KeyPrefix.AUCTION_ITEM_ + id;
};


/**
 * @return {?Array}
 */
app.model.getTabIds = function () {
  var ids = app.model.getLocalStore_().get(app.model.Key.TAB_IDS);
  return goog.isDefAndNotNull(ids) && goog.isArray(ids) ? ids : null;
};


/**
 * @param {Array.<string>} ids
 */
app.model.setTabIds = function (ids) {
  goog.asserts.assert(goog.isArray(ids) && goog.array.every(ids, function (id) {
    return goog.isString(id) && !goog.string.isEmpty(id);
  }), 'Wrong value to store');
  app.model.getLocalStore_().set(app.model.Key.TAB_IDS, ids);
  app.Model.getInstance().dispatchEvent(app.Model.EventType.UPDATE_TABIDS);
};


/**
 * @param {string} tabId
 * @return {?Object} Query and category data.
 */
app.model.getTabQuery = function (tabId) {
  var data = app.model.getLocalStore_().get(app.model.KeyPrefix.TAB_ + tabId);
  return goog.isObject(data) ? data : null;
};


/**
 * @param {string} tabId
 */
app.model.deleteTabQuery = function (tabId) {
  var storage = app.model.getLocalStore_();
  storage.remove(app.model.KeyPrefix.TAB_ + tabId);
  storage.remove(app.model.KeyPrefix.TAB_ + tabId + app.model.KeyPrefix._DETAILPANEWIDTH_);
  storage.remove(app.model.KeyPrefix.TAB_ + tabId + app.model.KeyPrefix._ISGRID_);
};


/**
 * @param {string} tabId
 * @param {Object} data Query and category data.
 */
app.model.setTabQuery = function (tabId, data) {
  goog.asserts.assert(
      goog.isString(data['query']) &&
      goog.isObject(data['category']) &&
      (goog.isString(data['category']['CategoryId']) || goog.isNumber(data['category']['CategoryId'])) &&
      goog.isString(data['category']['CategoryPath']),
      'Wrong data to store');
  app.model.getLocalStore_().set(app.model.KeyPrefix.TAB_ + tabId, data);
  app.Model.getInstance().dispatchEvent({
    type: app.Model.EventType.UPDATE_TABQUERY,
    id: tabId
  });
};


app.model.getRemoteHtml = function (url, callback, opt_obj) {
  app.model.Xhr.getInstance().get(url, {
    'noLayout': 1
  }, function(err, html){
    callback.call(opt_obj, err, html);
  });
};


/**
 * @param {string} id
 * @param {Function} callback
 * @param {Object=} opt_obj
 */
app.model.getAuctionItem = function (id, callback, opt_obj) {
  var storage = app.model.getSessionStore_();
  var key = app.model.getAuctionItemKey_(id);
  var data = storage.get(key);
  if (data) {
    callback.call(opt_obj, false, data);
  } else {
    app.model.Xhr.getInstance().get('/api/auctionItem', {
      'auctionID': id
    }, function (err, json) {
      var itemData;
      if (!err) {
        itemData = json['ResultSet']['Result'];
        try {
          storage.set(key, itemData, app.model.getLifeTime_(app.model.ExpireTime.AUCTION_ITEM));
        } catch (e) {
          storage.collect();
          storage.set(key, itemData, app.model.getLifeTime_(app.model.ExpireTime.AUCTION_ITEM));
        }
      }
      callback.call(opt_obj, err, itemData);
    });
  }
  goog.Timer.callOnce(function () {
    storage.collect();
  });
};


app.model.setDetailTitleFixedState = function (fixed) {
  var storage = app.model.getLocalStore_();
  storage.set(app.model.KeyPrefix.DETAILTITLEFIXEDSTATE_, !!fixed);
};


/**
 * @return {boolean}
 */
app.model.getDetailTitleFixedState = function () {
  var storage = app.model.getLocalStore_();
  return !!storage.get(app.model.KeyPrefix.DETAILTITLEFIXEDSTATE_);
};


/**
 * @param {string} tabId
 * @param {number} width
 */
app.model.setDetailPaneWidth = function (tabId, width) {
  goog.asserts.assertNumber(width, 'Invalid type for detail pane width.');
  goog.asserts.assert(width > 0, 'Invalid width for detail pane.');
  var storage = app.model.getLocalStore_();
  storage.set(app.model.KeyPrefix.TAB_ + tabId + 
              app.model.KeyPrefix._DETAILPANEWIDTH_, width);
};


/**
 * @param {string} tabId
 * @return {number}
 */
app.model.getDetailPaneWidth = function (tabId) {
  var storage = app.model.getLocalStore_();
  var num = storage.get(app.model.KeyPrefix.TAB_ + tabId + 
              app.model.KeyPrefix._DETAILPANEWIDTH_);
  goog.asserts.assertNumber(num, 'Must be a number');
  return num;
};



/**
 * @return {Object}
 */
app.model.createEmptyTab = function () {
  return {
    'query': '',
    'category': {
      'CategoryId': 0,
      'CategoryPath': ''
    }
  }
};


/**
 * @param {string} tabId
 * @param {boolean} isGrid
 */
app.model.setAlignmentStyle = function (tabId, isGrid) {
  goog.asserts.assertBoolean(isGrid, 'Invalid type to set list or grid.');
  var storage = app.model.getLocalStore_();
  storage.set(app.model.KeyPrefix.TAB_ + tabId + 
              app.model.KeyPrefix._ISGRID_, isGrid);
};


/**
 * @param {string} tabId
 * @return {boolean}
 */
app.model.getAlignmentStyle = function (tabId) {
  var storage = app.model.getLocalStore_();
  return !!storage.get(app.model.KeyPrefix.TAB_ + tabId + 
              app.model.KeyPrefix._ISGRID_);
};
