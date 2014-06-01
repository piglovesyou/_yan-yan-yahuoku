goog.provide('app.Frame');

goog.require('goog.ui.Component');
goog.require('goog.ui.SplitPane');



/**
 * @constructor
 * @param {string} id .
 * @param {goog.dom.DomHelper=} opt_domHelper .
 * @extends {goog.ui.Component}
 */
app.Frame = function(id, opt_domHelper) {
  goog.base(this, opt_domHelper);

  this.setId(id);

  this.taginput = new app.TagInput(id);
  this.addChild(this.taginput);

  this.splitpane = new goog.ui.SplitPane(
      this.list = new app.List(id),
      this.detail = new app.Detail);
  this.splitpane.setHandleSize(8);
  this.addChild(this.splitpane);
};
goog.inherits(app.Frame, goog.ui.Component);


/**
 * @enum {string}
 */
app.Frame.EventType = {
  DELEGATE_ADJUST_HEIGHT: 'dlgtadjsthit'
};


/** @inheritDoc */
app.Frame.prototype.createDom = function() {
  goog.base(this, 'createDom');
  goog.dom.classes.add(this.getElement(), 'frame app-frame-selected');

  this.taginput.createDom();
  this.list.createDom();
  this.detail.createDom();
  this.splitpane.createDom();

  var dh = this.getDomHelper();
  dh.append(this.getElement(),
      this.taginput.getElement(),
      this.splitpane.getElement())
};


/** @inheritDoc */
app.Frame.prototype.enterDocument = function() {
  goog.base(this, 'enterDocument');
  var eh = this.getHandler();
  
  eh.listen(this, app.TagInput.EventType.TAG_UPDATE, this.updateList_)
  .listen(this, goog.ui.list.EventType.UPDATE_TOTAL,
    this.taginput.updateRightContent, false, this.taginput)
  .listen(this, goog.ui.list.EventType.CLICKROW, function(e) {
    var row = /** @type {ObjectInterface.Item} */(e.data);
    this.detail.request(row.AuctionID);
  })
  .listen(app.ViewportSizeMonitor.getInstance(),
    app.ViewportSizeMonitor.EventType.DELAYED_RESIZE, function (e) {
    this.dispatchEvent(app.Frame.EventType.DELEGATE_ADJUST_HEIGHT);
    this.splitpane.setFirstComponentSize();
    this.detail.adjustBodyHeight();
  })
  .listen(this, goog.ui.SplitPane.EventType.HANDLE_DRAG_END,
      this.detail.adjustBodyHeight, false, this.detail);

  this.dispatchEvent(app.Frame.EventType.DELEGATE_ADJUST_HEIGHT);

  this.updateList_();
};


app.Frame.prototype.updateList_ = function() {
  this.list.search(this.buildUrl());
};


/**
 * @return {goog.Uri} .
 */
app.Frame.prototype.buildUrl = function() {
  var data = app.model.getTabQuery(this.getId());
  var url = new goog.Uri;
  var q = url.getQueryData();

  // Append params
  if (data.category) {
    q.add('category', data.category.CategoryId);
  }
  if (data.query) {
    q.add('query', data.query.join(' '));
  }

  // Set path 
  if (data.query && !goog.array.isEmpty(data.query)) {
    url.setPath('/auction/search');
  } else {
    
    url.setPath('/auction/categoryLeaf');
  }
  return url;
};


/** @inheritDoc */
app.Frame.prototype.disposeInternal = function() {
  goog.base(this, 'disposeInternal');
};
