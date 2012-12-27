
var isProduction = process.env.NODE_ENV === 'production';

/**
 * @param {Object} req A request object.
 * @param {Object} res A response object.
 */
exports.index = function(req, res) {

  res.render('index', {
    isProduction: isProduction,
    affiliateBase: require('secret-strings').AUC_PRO.AFFILIATE_BASE
  });

  // if(req.session.oauth && req.session.oauth.access_token) {
  //   res.render('index', {
  //     isProduction: isProduction
  //     // screen_name: req.session.yahoo.screen_name
  //   });
  // } else {
  //   res.redirect("/login");
  // }
};

/**
 * @param {Object} req A request object.
 * @param {Object} res A response object.
 */
exports.about = function(req, res) {
  res.render('about', {
    layout: !req.query.noLayout
  });
};

if (!isProduction) {

  /**
   * @param {Object} req A request object.
   * @param {Object} res A response object.
   */
  exports.sandbox = function(req, res) {
    res.render('sandbox');
  };

}






