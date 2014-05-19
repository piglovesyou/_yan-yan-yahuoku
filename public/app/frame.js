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

  this.id = id;

  // console.log(app.model.getTabQuery(id));

  this.taginput = new app.TagInput(id);
  this.addChild(this.taginput);

  this.splitpane = new goog.ui.SplitPane(
      this.list = new app.List,
      this.detail = new app.Detail);
  this.addChild(this.splitpane);
};
goog.inherits(app.Frame, goog.ui.Component);


/** @inheritDoc */
app.Frame.prototype.createDom = function() {
  goog.base(this, 'createDom');
  goog.dom.classes.add(this.getElement(), 'frame');

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
  
  eh.listen(this, app.TagInput.EventType.TAG_UPDATE, function(e) {
    this.list.search(this.taginput.buildUrl());
  })
  .listen(this, goog.ui.list.EventType.UPDATE_TOTAL,
    this.taginput.updateRightContent, false, this.taginput)
  .listen(this, goog.ui.list.EventType.CLICKROW, function(e) {
    var row = /** @type {ObjectInterface.Item} */(e.data);
    this.detail.request(row.AuctionID);
  })
};


/** @inheritDoc */
app.Frame.prototype.disposeInternal = function() {
  goog.base(this, 'disposeInternal');
};
