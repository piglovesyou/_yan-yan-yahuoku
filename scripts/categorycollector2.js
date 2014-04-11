
var Q = require('q');
Q.longStackSupport = true;
var yahoo = require('../sources/net/yahoo');
var Datastore = require('nedb');
var db = new Datastore({ filename: './nedb/categories.nedb', autoload: true });
var assert = require('assert');
var _ = require('underscore');

var update = Q.denodeify(db.update.bind(db));
var findOne = Q.denodeify(db.findOne.bind(db));
var yahooGet = Q.denodeify(yahoo.get.bind(yahoo));

var start = Date.now();
var depth = 3;



// fetchFromIds(["0"]).then(messageDone);
fetchSimultaneouslyFromIds(["0"]).then(messageDone);



function messageDone(msg) {
  console.log(msg, (Date.now() - start) / 1000, '秒');
}

function fetchSimultaneouslyFromIds(ids) {
  return ids.reduce(reduceChunkBind(1), [])
  .reduce(function (q, set) {
    return q.then(function(childIds) {
      return Q.all(set.map(fetchFromId)).then(function(collected) {
        return childIds.concat(_.flatten(collected))
      });
    })
  }, Q([]))
  .then(function(childIds) {
    if (childIds.length > 0 && --depth) {
      return fetchSimultaneouslyFromIds(childIds);
    } else {
      return 'done!';
    }
  });
}

function reduceChunkBind(size) {
  return function(sum, e, i, arr) {
    return sum.concat(i % size ? [] : [arr.slice(i, i + size)]);
  }
}
assert.deepEqual(
    [255,1,2,3,4,5,6].reduce(reduceChunkBind(3), []),
    [[255,1,2],[3,4,5],[6]]);

function fetchFromIds(ids) {
  return ids.reduce(reduceFetchItem, Q([]))
  .then(function(childIds) {
    if (childIds.length > 0 && --depth) {
      return fetchFromIds(childIds);
    } else {
      return 'done!';
    }
  });
}

function reduceFetchItem(q, id) {
  return q.then(function(childIds) {
    return fetchFromId(id)
    .then(childIds.concat.bind(childIds))
  })
}

function fetchFromId(id, parent, child) {
  return findOne({CategoryId: id})
  .then(function(doc) {
    if (doc) {
      return showMessageAndExtractChildIds('[exists]', doc);
      return extractChildIds(doc);
    } else {
      return yahooGet('categoryTree', {category: id})
      .then(JSON.parse)
      .get('ResultSet')
      .get('Result')
      .catch(outError)
      .then(upsertStore)
      .then(showMessageAndExtractChildIds.bind(null, '[insert]'));
    }
  })
};

function showMessageAndExtractChildIds(messagePrefix, doc) {
  console.log(messagePrefix, doc.CategoryPath);
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

