
/**
 * @type {Object}
 */
global.goog = require('closure').Closure({
  CLOSURE_BASE_PATH: 'libs/closure-library/closure/goog/'
});
var http = require('http');
var fs = require('fs');
var Q = require('q');
var Datastore = require('nedb');
var db = new Datastore({ filename: './nedb/categories.nedb', autoload: true });
var solr = require('solr-client').createClient(undefined, undefined, 'collection1');
var _ = require('underscore');

goog.require('goog.object');
goog.require('goog.array');

var solrAdd = Q.denodeify(solr.add.bind(solr));
var solrCommit = Q.denodeify(solr.commit.bind(solr));
var db_find = Q.denodeify(db.find.bind(db));
var dbFindOne = Q.denodeify(db.findOne.bind(db));



findAndInsert()
.done(function() {
  console.log('done!');
});



var count = 50;

var skip = 0;
var limit = count;

function findAndInsert() {
  return findByCursor(skip, limit)
  .then(function(docs) {
    if (docs.length == 0) {
      throw new Error('done');
    }
    console.log('inserting', skip, 'to', limit, '..');
    return docs
  })
  .then(modifyProperty)
  .then(solrAdd)
  .then(solrCommit)
  .then(function() {
    limit += count;
    skip += count;
  })
  .then(findAndInsert);
}

function modifyProperty(docs) {
  docs.forEach(function(d) {
    var children = d.ChildCategory;
    if (children) {
      d.ChildCategory = null;
      d.ChildCategoryIds = _.isArray(children) ?
          children.map(function(d) { return d.CategoryId }) :
          [children.CategoryId];
    }
  });
  return docs;
}

function findByCursor(skip, limit) {
  var d = Q.defer();
  db.find({})
  .sort({CategoryId: 1})
  .skip(skip)
  .limit(limit)
  .exec(function(err, docs) {
    if (err) return d.reject(err);
    d.resolve(docs);
  });
  return d.promise;
}


