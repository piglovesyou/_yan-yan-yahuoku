
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
  this.xhr_ = new app.model.Xhr;
  this.sessionStore_ = new goog.storage.ExpiringStorage(new goog.storage.mechanism.HTML5SessionStorage());
  this.localStore_ = new goog.storage.ExpiringStorage(new goog.storage.mechanism.HTML5LocalStorage());
};
goog.inherits(app.Model, goog.events.EventTarget);
goog.addSingletonGetter(app.Model);


app.Model.EXPIRE_AUCTION_ITEM = 30 * 60 * 1000;


/**
 * @enum {string}
 */
app.Model.EventType = {
  UPDATE_TABQUERY: 'updatetabquery',
  UPDATE_TABIDS: 'updatetabids',
  UPDATE_ITEMCACHE: 'updateitemcache'
};


app.Model.getLifeTime_ = function () {
  return app.Model.EXPIRE_AUCTION_ITEM + goog.now();
};


app.Model.Key = {
  // LocalStore
  TAB_IDS: 'tab:ids'
};


app.Model.KeyPrefix = {
  AUCTION_ITEM_: 'auctionitem:',
  TAB_: 'tab:'
};


app.Model.getAuctionItemKey_ = function (id) {
  return app.Model.KeyPrefix.AUCTION_ITEM_ + id;
};


/**
 * @return {Array.<string>}
 */
app.Model.prototype.getTabIds = function () {
  return this.localStore_.get(app.Model.Key.TAB_IDS);
};


/**
 * @param {Array.<string>}
 */
app.Model.prototype.setTabIds = function (ids) {
  goog.asserts.assert(goog.isArray(ids) && goog.array.every(ids, function (id) {
    return goog.isString(id) && !goog.string.isEmpty(id);
  }), 'Wrong value to store');
  this.localStore_.set(app.Model.Key.TAB_IDS, ids);
  this.dispatchEvent(app.Model.EventType.UPDATE_TABIDS);
};


app.Model.prototype.getTabQuery = function (tabId) {
  return this.localStore_.get(app.Model.KeyPrefix.TAB_ + tabId);
};


app.Model.prototype.setTabQuery = function (tabId, data) {
  goog.asserts.assert(
      goog.isString(data['query']) &&
      goog.isObject(data['category']) &&
      (goog.isString(data['category']['id']) || goog.isNumber(data['category']['id'])) &&
      goog.isString(data['category']['path']),
      'Wrong data to store');
  this.localStore_.set(app.Model.KeyPrefix.TAB_ + tabId, data);
  this.dispatchEvent({
    type: app.Model.EventType.UPDATE_TABQUERY,
    id: tabId
  });
};


/**
 * @param {string} id
 * @param {Function} callback
 * @param {Object=} opt_obj
 */
app.Model.prototype.getAuctionItem = function (id, callback, opt_obj) {
  var storage = this.sessionStore_;
  var key = app.Model.getAuctionItemKey_(id);
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
        storage.set(key, itemData, app.Model.getLifeTime_());
      }
      callback.call(opt_obj, err, itemData);
    });
  }
};
