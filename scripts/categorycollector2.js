
var Q = require('q');
Q.longStackSupport = true;
var yahoo = require('../sources/net/yahoo');
var Datastore = require('nedb');
var db = new Datastore({ filename: './nedb/categories.nedb', autoload: true });

var update = Q.denodeify(db.update.bind(db));
var findOne = Q.denodeify(db.findOne.bind(db));
var yahooGet = Q.denodeify(yahoo.get.bind(yahoo));



fetchFromIds(["0"]).then(console.log);



function fetchFromIds(ids) {
  if (ids.length > 0) {
    return ids.reduce(fetchItemAndConcat, Q([]))
    .then(fetchFromIds);
  } else {
    return 'done!';
  }
}

function fetchItemAndConcat(q, id) {
  return q.then(function(childIds) {
    return fetchFromId(id)
    .then(childIds.concat.bind(childIds))
  })
}

function fetchFromId(id, parent, child) {
  return findOne({CategoryId: id})
  .then(function(doc) {
    if (doc) {
      console.log('[exists]', doc.CategoryPath);
      return extractChildIds(doc);
    } else {
      return yahooGet('categoryTree', {category: id})
      .then(JSON.parse)
      .get('ResultSet')
      .get('Result')
      .catch(outError)
      .then(upsertStore)
      .then(function(doc) {
        console.log('[insert]', doc.CategoryPath);
        return extractChildIds(doc);
      });
    }
  })
};

function showMessageAndExtractChildIds(msgPrefix, doc) {
  console.log('[insert]', doc.CategoryPath);
  return extractChildIds(doc)
}

function extractChildIds(parent) {
  if (parent.IsLeaf == 'false' && parent.IsLink == 'false' && parent.ChildCategory.length > 0) {
    return parent.ChildCategory.reduce(function(arr, child) {
      if (child.IsLink == 'false') {
        arr.push(child.CategoryId);
      }
      return arr;
    }, []);
  }
  return [];
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

