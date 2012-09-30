
goog.provide('app.Model');

goog.require('goog.storage.ExpiringStorage');
goog.require('goog.storage.mechanism.HTML5SessionStorage');
goog.require('goog.storage.mechanism.HTML5LocalStorage');
goog.require('app.model.Xhr');
goog.require('goog.events.EventTarget');


/**
 * @constructor
 * @extends {goog.events.EventTarget}
 */
app.Model = function () {
  goog.base(this);
  // this.sessionStore_ = new goog.storage.ExpiringStorage(new goog.storage.mechanism.HTML5SessionStorage());
  this.localStore_ = new goog.storage.ExpiringStorage(new goog.storage.mechanism.HTML5LocalStorage());
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
 * @return {goog.storage.ExpiringStorage}
 */
app.Model.prototype.getLocalStore = function () {
  return this.localStore_;
};




/**
 * Model utility namespace.
 */

/**
 * @private
 * @return {goog.storage.ExpiringStorage}
 */
app.model.getLocalStore_ = function () {
  return app.Model.getInstance().getLocalStore();
};


/**
 * @enum {number}
 */
app.model.ExpireTime = {
  AUCTION_ITEM: 30 * 60 * 1000
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
  TAB_: 'tab:'
};


/**
 * @param {string} id
 * @return {string}
 */
app.model.getAuctionItemKey_ = function (id) {
  return app.model.KeyPrefix.AUCTION_ITEM_ + id;
};


/**
 * @return {Array.<string>}
 */
app.model.getTabIds = function () {
  return app.model.getLocalStore_().get(app.model.Key.TAB_IDS);
};


/**
 * @param {Array.<string>}
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
 * @return {Object} Query and category data.
 */
app.model.getTabQuery = function (tabId) {
  return app.model.getLocalStore_().get(app.model.KeyPrefix.TAB_ + tabId);
};


/**
 * @param {string} tabId
 * @param {Object} Query and category data.
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


/**
 * @param {string} id
 * @param {Function} callback
 * @param {Object=} opt_obj
 */
app.model.getAuctionItem = function (id, callback, opt_obj) {
  var storage = app.model.getLocalStore_();
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
        storage.set(key, itemData, app.model.getLifeTime_(app.model.ExpireTime.AUCTION_ITEM));
      }
      callback.call(opt_obj, err, itemData);
    });
  }
};
