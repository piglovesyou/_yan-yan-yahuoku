
var isProduction = process.env.NODE_ENV === 'production';


/**
 * @param {Object} req Connect reqest object.
 * @return {boolean} .
 */
var isAuthed = function(req) {
  var ref;
  return !!((ref = req.session) &&
            (ref = ref.oauth) &&
            (ref.expires_at > Date.now()));
};


/**
 * @param {Object} req A request object.
 * @param {Object} res A response object.
 */
exports.index = function(req, res) {
  res.render('index', {
    isProduction: isProduction,
    isAuthed: isAuthed(req),
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






