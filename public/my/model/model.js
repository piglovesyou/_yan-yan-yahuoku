
goog.provide('my.Model');

goog.require('goog.storage.ExpiringStorage');
goog.require('goog.storage.mechanism.HTML5SessionStorage');
goog.require('goog.storage.mechanism.HTML5LocalStorage');
goog.require('my.model.Xhr');
goog.require('goog.events.EventTarget');


/**
 * @constructor
 * @extends {goog.events.EventTarget}
 */
my.Model = function () {
  goog.base(this);
  this.xhr_ = new my.model.Xhr;
  this.sessionStore_ = new goog.storage.ExpiringStorage(new goog.storage.mechanism.HTML5SessionStorage());
  this.localStore_ = new goog.storage.ExpiringStorage(new goog.storage.mechanism.HTML5LocalStorage());
};
goog.inherits(my.Model, goog.events.EventTarget);
goog.addSingletonGetter(my.Model);


my.Model.EXPIRE_AUCTION_ITEM = 30 * 60 * 1000;


/**
 * @enum {string}
 */
my.Model.EventType = {
  UPDATE_TABQUERY: 'updatetabquery',
  UPDATE_TABIDS: 'updatetabids',
  UPDATE_ITEMCACHE: 'updateitemcache'
};


my.Model.getLifeTime_ = function () {
  return my.Model.EXPIRE_AUCTION_ITEM + goog.now();
};


my.Model.Key = {
  // LocalStore
  TAB_IDS: 'tab:ids'
};


my.Model.KeyPrefix = {
  AUCTION_ITEM_: 'auctionitem:',
  TAB_: 'tab:'
};


my.Model.getAuctionItemKey_ = function (id) {
  return my.Model.KeyPrefix.AUCTION_ITEM_ + id;
};


/**
 * @return {Array.<string>}
 */
my.Model.prototype.getTabIds = function () {
  return this.localStore_.get(my.Model.Key.TAB_IDS);
};


/**
 * @param {Array.<string>}
 */
my.Model.prototype.setTabIds = function (ids) {
  goog.asserts.assert(goog.isArray(ids) && goog.array.every(ids, function (id) {
    return goog.isString(id) && !goog.string.isEmpty(id);
  }), 'Wrong value to store');
  this.localStore_.set(my.Model.Key.TAB_IDS, ids);
  this.dispatchEvent(my.Model.EventType.UPDATE_TABIDS);
};


my.Model.prototype.getTabQuery = function (tabId) {
  return this.localStore_.get(my.Model.KeyPrefix.TAB_ + tabId);
};


my.Model.prototype.setTabQuery = function (tabId, data) {
  goog.asserts.assert(
      goog.isString(data['query']) &&
      goog.isObject(data['category']) &&
      (goog.isString(data['category']['id']) || goog.isNumber(data['category']['id'])) &&
      goog.isString(data['category']['path']),
      'Wrong data to store');
  this.localStore_.set(my.Model.KeyPrefix.TAB_ + tabId, data);
  this.dispatchEvent({
    type: my.Model.EventType.UPDATE_TABQUERY,
    id: tabId
  });
};


/**
 * @param {string} id
 * @param {Function} callback
 * @param {Object=} opt_obj
 */
my.Model.prototype.getAuctionItem = function (id, callback, opt_obj) {
  var storage = this.sessionStore_;
  var key = my.Model.getAuctionItemKey_(id);
  var data = storage.get(key);
  if (data) {
    callback.call(opt_obj, false, data);
  } else {
    this.xhr_.get('/api/auctionItem', {
      'auctionID': id
    }, function (err, json) {
      var itemData;
      if (!err) {
        itemData = json['ResultSet']['Result'];
        storage.set(key, itemData, my.Model.getLifeTime_());
      }
      callback.call(opt_obj, err, itemData);
    });
  }
};
