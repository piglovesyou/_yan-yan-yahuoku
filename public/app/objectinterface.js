

var ObjectInterface = {};

/** @constructor */
ObjectInterface.Category = function() {};
ObjectInterface.Category.prototype.CategoryId;
ObjectInterface.Category.prototype.CategoryIdPath;
ObjectInterface.Category.prototype.CategoryName;
ObjectInterface.Category.prototype.CategoryPath;
ObjectInterface.Category.prototype.ChildCategoryIds;
ObjectInterface.Category.prototype.ChildCategoryNum;
ObjectInterface.Category.prototype.Depth;
ObjectInterface.Category.prototype.IsAdult;
ObjectInterface.Category.prototype.IsLeaf;
ObjectInterface.Category.prototype.IsLeafToLink;
ObjectInterface.Category.prototype.IsLink;
ObjectInterface.Category.prototype.Order;

/** @constructor */
ObjectInterface.Item = function() {};
ObjectInterface.Item.prototype.AuctionID;
ObjectInterface.Item.prototype.Image;
ObjectInterface.Item.prototype.CurrentPrice;
ObjectInterface.Item.prototype.EndTime;
ObjectInterface.Item.prototype.Title;
ObjectInterface.Item.prototype.Bids;
ObjectInterface.Item.prototype.Option;

/** @constructor */
ObjectInterface.Detail = function() {};
ObjectInterface.Detail.prototype.Img;
ObjectInterface.Detail.prototype.Description;
ObjectInterface.Detail.prototype.AuctionItemUrl;
ObjectInterface.Detail.prototype.Title;
ObjectInterface.Detail.prototype.Price;
ObjectInterface.Detail.prototype.Bidorbuy;
ObjectInterface.Detail.prototype.EndTime;
ObjectInterface.Detail.prototype.Bids;
ObjectInterface.Detail.prototype.Quantity;
ObjectInterface.Detail.prototype.InitPrice;
ObjectInterface.Detail.prototype.StartTime;
ObjectInterface.Detail.prototype.EndTime;
ObjectInterface.Detail.prototype.IsEarlyClosing;
ObjectInterface.Detail.prototype.IsAutomaticExtension;
ObjectInterface.Detail.prototype.ItemReturnable;
ObjectInterface.Detail.prototype.EasyPayment;
ObjectInterface.Detail.prototype.Bank;
ObjectInterface.Detail.prototype.ChargeForShipping;
ObjectInterface.Detail.prototype.Location;
ObjectInterface.Detail.prototype.IsWorldwide;
ObjectInterface.Detail.prototype.Shipping;
ObjectInterface.Detail.prototype.ItemStatus;
ObjectInterface.Detail.prototype.Condition;

/** @constructor */
ObjectInterface.TabQuery = function() {};
ObjectInterface.TabQuery.prototype.type;
ObjectInterface.TabQuery.prototype.queryValue;
ObjectInterface.TabQuery.prototype.categoryId;
ObjectInterface.TabQuery.prototype.categoryPath;
ObjectInterface.TabQuery.prototype.categoryName;
