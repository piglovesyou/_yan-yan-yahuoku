
var oa = require('../sources/core/oauth.js');
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

/**
 * @param {Object} req A request object.
 * @param {Object} res A response object.
 */
exports.login = function(req, res) {
  if (req.session.oauth && req.session.oauth.access_token) {
    res.render('login');
  } else {
    res.render('login');
  }
};

/**
 * @param {Object} req A request object.
 * @param {Object} res A response object.
 */
exports.logout = function(req, res) {
  req.session.destroy();
  res.render('logout');
};

var requestAuthEndpoint =
    'https://auth.login.yahoo.co.jp/oauth/v2/request_auth?oauth_token=';

/**
 * @param {Object} req A request object.
 * @param {Object} res A response object.
 */
exports.authenticate = function(req, res) {
  oa.getOAuthRequestToken(function(error,
                                   oauth_token, oauth_token_secret, results) {
    if (error) {
      res.send("didn't work.<br />" + JSON.stringify(error));
    } else {
      req.session.oauth = {};
      req.session.oauth.token = oauth_token;
      req.session.oauth.token_secret = oauth_token_secret;
      res.redirect(requestAuthEndpoint + oauth_token);
    }
  });
};

/**
 * @param {Object} req A request object.
 * @param {Object} res A response object.
 * @param {function} next Run if done in this scope.
 */
exports.authcallback = function(req, res, next) {
  if (req.session.oauth) {
    req.session.oauth.verifier = req.query.oauth_verifier;
    var oauth = req.session.oauth;
    oa.getOAuthAccessToken(oauth.token, oauth.token_secret, oauth.verifier,
      function(error, oauth_access_token, oauth_access_token_secret, results) {
        if (error) {
          res.send('yeah something broke.');
        } else {
          req.session.oauth.access_token = oauth_access_token;
          req.session.oauth.access_token_secret = oauth_access_token_secret;
          req.session.yahoo = results;
          res.render('authcallback');
        }
      }
    );
  } else
    next(new Error("you're not supposed to be here."));
};







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
