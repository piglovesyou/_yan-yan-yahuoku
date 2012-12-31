
var fs = require('fs');


/**
 * @param {string} path .
 * @return {Object} .
 */
var readJson = function(path) {
  return Object.freeze(JSON.parse(fs.readFileSync(path)));
};


/**
 * TODO: Category Suggest can also be served as JSON here.
 */


(function() {

  var apiEndpoints = readJson(__dirname + '/apiendpoints.json');

  /**
   * @return {Object} .
   */
  module.exports.getApiEndpoints = function() {
    return apiEndpoints;
  };

})();

