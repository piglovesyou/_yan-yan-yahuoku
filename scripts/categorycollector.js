
var Q = require('q');
Q.longStackSupport = true;
var yahoo = require('../sources/net/yahoo');
var Datastore = require('nedb');
var db = new Datastore({ filename: './nedb/categories.nedb', autoload: true });

var update = Q.denodeify(db.update.bind(db));
var findOne = Q.denodeify(db.findOne.bind(db));
var yahooGet = Q.denodeify(yahoo.get.bind(yahoo));



request("0")
.catch(outError)
.done(function() {
  console.log('[done.]');
});



function request(id, parent, child) {
  return getDocument(id)
  .then(requestChildrenIfAny);
};

function getDocument(id) {
  return findOne({CategoryId: id})
  .then(function (doc) {
    if (doc) {
      console.log('[exists]', doc.CategoryPath);
      // throw new Error(doc);
      return doc;
    } else {
      return yahooGet('categoryTree', {category: id})
      .then(JSON.parse)
      .get('ResultSet')
      .get('Result')
      .catch(outError)
      .then(upsertStore)
      .then(function(doc) {
        console.log('[insert]', doc.CategoryPath);
        return doc;
      })
    }
  });
}

function outError(reason) {
  throw new Error(err + '\n' + err.stack);
}

function upsertStore(result) {
  return update({CategoryId: result.CategoryId}, result, {upsert: true})
  .then(function() {
    return result
  });
}

function requestChildrenIfAny(parent) {
  if (parent.IsLeaf == 'false' && parent.IsLink == 'false' && parent.ChildCategory.length > 0) {
    return parent.ChildCategory.reduce(function(q, child) {
      // var path = child.CategoryIdPath.split(',');
      if (child.IsLink == 'false') {
        return q.then(function() {
          return request(child.CategoryId, parent, child);
        });
      }
      return q;
    }, Q());
  }
}

