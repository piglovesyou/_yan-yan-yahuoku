
module.exports.outError = function(e) {
  console.log(e.stack);
  throw new Error(e);
};


