
goog.provide('my.Model');

goog.require('goog.storage.ExpiringStorage');
goog.require('goog.storage.mechanism.HTML5SessionStorage');
goog.require('my.model.Xhr');
goog.require('goog.Disposable');


/**
 * @constructor
 * @extends {goog.Disposable}
 */
my.Model = function () {
  goog.base(this);
  this.xhr_ = new my.model.Xhr;
  this.sessionStore_ = new goog.storage.ExpiringStorage(new goog.storage.mechanism.HTML5SessionStorage());
  // this.localStore_ = 
};
goog.inherits(my.Model, goog.Disposable);
goog.addSingletonGetter(my.Model);

my.Model.EXPIRE_AUCTION_ITEM = 10000000;

my.Model.getLifeTime_ = function () {
  return my.Model.EXPIRE_AUCTION_ITEM + goog.now();
};

my.Model.getAuctionItemKey_ = function (id) {
  return 'auctionitem:' + id;
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
