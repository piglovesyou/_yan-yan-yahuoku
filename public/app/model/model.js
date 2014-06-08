
goog.provide('app.Model');
goog.provide('app.model');

goog.require('app.events.EventType');
goog.require('app.net.xhr');
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

  var tabIds = this.getTabIds();

  // Init model
  if (!tabIds || goog.array.isEmpty(tabIds)) {
    var tabId = this.generateUniqueTabId();
    this.setTabIds([tabId]);
    this.setTabQuery(tabId, this.createEmptyTab());
  }

  // Cleanup old data
  goog.Timer.callOnce(function() {
    for (var k in goog.global.localStorage)
      if (!goog.string.startsWith(k, app.Model.VERSION))
        delete goog.global.localStorage[k];
  }, 1000, this);
};
goog.inherits(app.Model, goog.events.EventTarget);
goog.addSingletonGetter(app.Model);


/**
 * @type {string}
 */
app.Model.VERSION = 'v2:';


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
  TAB_IDS: app.Model.VERSION + 'tab:ids'
};


/**
 * @enum {string}
 */
app.Model.KeyPrefix = {
  TAB_: app.Model.VERSION + 'tab:'
  // _DETAILPANEWIDTH_: ':detailpanewidth',
  // _ISGRID_: ':isGrid:'
};


/**
 * @type {boolean}
 * @private
 */
app.Model.prototype.isAuthed_;


/**
 * @param {app.Model.ExpireTime} baseTime .
 * @return {number} .
 * @private
 */
app.Model.prototype.getLifeTime_ = function(baseTime) {
  return baseTime + goog.now();
};


app.Model.prototype.generateUniqueTabId = function() {
  var id;
  var currIds = this.getTabIds();
  do {
    id = goog.ui.IdGenerator.getInstance().getNextUniqueId();
    if (!currIds) return id;
  } while (goog.array.contains(currIds, id));
  return id;
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
 * @return {ObjectInterface.TabQuery} Query and category data.
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
 * @param {ObjectInterface.TabQuery} data Query and category data.
 */
app.Model.prototype.setTabQuery = function(tabId, data) {
  var ref;

  goog.asserts.assert(data.query || data.category);
  if (data.query)
    goog.asserts.assert(goog.array.every(data.query, goog.isString));

  this.localStore_.set(app.Model.KeyPrefix.TAB_ + tabId, data);
  this.dispatchEvent({
    type: app.Model.EventType.UPDATE_TABQUERY,
    id: tabId
  });
};


/**
 * @return {ObjectInterface.TabQuery} .
 */
app.Model.prototype.createEmptyTab = function() {
  var defaults = [
    '牡蠣',
    'はまぐり'
  ];
  var query = defaults[Math.floor(Math.random() * defaults.length)];
  return /** @type {ObjectInterface.TabQuery} */({
    'query': [query]
  });
};


/**
 * @type {app.Model}
 */
app.model = app.Model.getInstance();
