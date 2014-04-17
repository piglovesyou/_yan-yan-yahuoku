
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



var count = 20;

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












// ############################################old




function pFetch(start, perRequest) {
  console.log('### Fetching(start,perRequest):', start, perRequest);
  return Q.when(buildTicketParams(start, perRequest))
  .then(pRequest.bind(null, tracOption))
  .then(JSON.parse)
  .then(mapDocs)
  .then(pCollectChangeLogs)
  .then(pSolrAdd)
  .then(pSolrCommit)
  .then(console.log.bind(console, '### Commit done:'))
  .fail(pFail);
}


function buildTicketParams(from, size) {
  var arr = [];
  var inc = size > 0;
  for (var i = +from; i < from + size; (inc ? i++ : i--)) {
    if (i <= 0) break;
    arr.push({params: [i], 'method': 'ticket.get'});
  }
  return {
    params: arr,
    method: 'system.multicall'
  };
}

function buildCommentParams(id) {
  return {
    params: [ id ],
    method: 'ticket.changeLog'
  };
}

function pFail(reason) {
  console.log('xxx Error:');
  console.log(reason);
}

function mapDocs(json) {
  var result = [];
  json.result.forEach(function(rpcResponse) {
    if (rpcResponse.error) {
      console.log(rpcResponse.error);
      return; // continue.
    }
    // 0: ticket id
    // 1: created
    // 2: modified
    // 3: fields
    var doc = rpcResponse.result[3];
    doc.id = rpcResponse.result[0];
    for (var k in doc) {
      if (typeof doc[k] === 'object') {
        // 0: type like 'datetime'
        // 1: value
        doc[k] = goog.object.getAnyValue(doc[k])[1] + 'Z'; // TODO:
      }
    }
    result.push(doc);
  });
  return result;
}

function pCollectChangeLogs(docs) {
  return docs.reduce(function(p, d) {
    return p
    .then(buildCommentParams.bind(null, d.id))
    .then(pRequest.bind(null, tracOption))
    .then(JSON.parse)
    .then(buildChangeLogs)
    .then(function (logCat) {
      d.changelogs = logCat;
    });
  }, Q()).then(function() {
    return docs;
  }).fail(function(reason) {
    console.log('xxxx');
    console.log(reason);
  });
}

function buildChangeLogs(logs) {
  var r = [];
  logs.result.forEach(function(l) {
    l.slice(1, 1 + 4).forEach(function(text) {
      goog.array.insert(r, text);
    });
  }, '');
  return r.join(' ');
}

// XXX
// Q.when(buildTicketParams(7112, 1))
// .then(pRequest.bind(null, tracOption))
// .then(JSON.parse)
// .then(mapDocs)
// .then(pCollectChangeLogs)
// .then(pSolrAdd)
// .then(pSolrCommit)
// .then(console.log.bind(console, '### Commit done:'))
// .fail(pFail);





function pRequest(options, body) {
  body = JSON.stringify(body)
  if (!options.headers) options.headers = {};
  options.headers['Content-Length'] = body.length;
  var d = Q.defer();
  var req = http.request(options, function(res) {
    var body = '';
    res.on('data', function(chunk) {
      body += chunk;
    });
    res.on('end', function() {
      d.resolve(body);
    });
  });
  req.on('error', d.reject);
  req.write(body);
  req.end();
  return d.promise;
}

