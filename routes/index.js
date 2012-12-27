
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







// exports.post = function (req, res) {
//   if(req.session.oauth && req.session.oauth.access_token) {
//     var text = req.body.text;
//     oa.post(
//       'https://api.twitter.com/1/statuses/update.json',
//       req.session.oauth.access_token,
//       req.session.oauth.access_token_secret,
//       {"status": text},
//       function (err, data, response) {
//         if (err) {
//           res.send('too bad.' + JSON.stringify(err));
//         } else {
//           res.send('posted successfully...!');
//         }
//       });
//   } else {
//     res.send('fail.');
//   }
// };
//
