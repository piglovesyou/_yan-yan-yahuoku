goog.provide('app.model.Xhr');

goog.require('goog.Disposable');
goog.require('goog.Uri');
goog.require('goog.net.XhrManager');


/**
 * @constructor
 * @extends {goog.Disposable}
 */
app.model.Xhr = function() {
  goog.base(this);
  this.xhr_ = new goog.net.XhrManager(0); // Never retry!
};
goog.inherits(app.model.Xhr, goog.Disposable);
goog.addSingletonGetter(app.model.Xhr);


/**
 * @param {string} url .
 * @param {Object} param .
 * @param {Function} callback .
 * @param {Object=} opt_obj .
 */
app.model.Xhr.prototype.get = function(url, param, callback, opt_obj) {
  var uri = goog.Uri.parse(url);
  uri.getQueryData().extend(param);
  this.request_('GET', uri.toString(), null, callback, opt_obj);
};


/**
 * @param {string} url .
 * @param {!Object} content .
 * @param {Function} callback .
 * @param {Object} opt_obj .
 */
app.model.Xhr.prototype.post = function(url, content, callback, opt_obj) {
  var query = goog.Uri.QueryData.createFromMap(content);
  this.request_('POST', url, query.toString(), callback, opt_obj);
};


/**
 * @param {string} uri .
 * @param {?string} opt_content .
 * @return {?string} Id. If the id is in use, return null.
 * @private
 */
app.model.Xhr.prototype.getId_ = function(uri, opt_content) {
  var id = uri + opt_content;
  var ids = this.xhr_.getOutstandingRequestIds();
  return !goog.array.contains(ids, id) ? id : null;
};


/**
 * @param {string} method .
 * @param {string} uri .
 * @param {?string} content .
 * @param {Function(?goog.net.XhrIo, ?Object)} callback If error, the first
 *                                              argument will be xhrio object.
 * @param {Object=} opt_obj .
 * @private
 */
app.model.Xhr.prototype.request_ = function(method,
                                            uri, content, callback, opt_obj) {
  var xhr = this.xhr_;
  var u = undefined;
  var isGet = method == 'GET';
  var content_ = (content && !isGet) ? content : u;

  var id = this.getId_(uri, content);
  if (id) {
    xhr.send(id, uri, method, content_, u, u, function(e) {
      var xhrio = e.target; // Should be.
      goog.asserts.assert(xhrio, 'Xhrio object sould be.');
      callback.call(opt_obj, xhrio.isSuccess() ? null : xhrio,
          app.model.Xhr.extractResponse_(xhrio));
    });
  } else {
    callback.call(opt_obj, {
      Error: {
        Message: 'The same kind of request is being on fly.'
      }
    }, null);
  }
};


/**
 * @param {goog.net.XhrIo} xhrio .
 * @return {Object|string} JSON object or just a response text.
 * @private
 */
app.model.Xhr.extractResponse_ = function(xhrio) {
  return goog.string.contains(
      xhrio.getResponseHeader('Content-Type'), 'application/json') ?
        xhrio.getResponseJson() :
        xhrio.getResponseText();
};
