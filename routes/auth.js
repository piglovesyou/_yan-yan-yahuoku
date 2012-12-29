
var oa = require('../sources/core/oauth.js');

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

/**
 * @param {Object} req A request object.
 * @param {Object} res A response object.
 */
exports.auth = function(req, res) {
  oa.getOAuthRequestToken(function(error,
                                   oauth_token, oauth_token_secret, results) {
    if (error) {
      res.send("didn't work.<br />" + JSON.stringify(error));
    } else {
      req.session.oauth = {
        token: oauth_token,
        token_secret: oauth_token_secret,
        expires_at: Date.now() +
                    (/* '3600' */results.oauth_expires_in * 1000) -
                    /* Less is fine. */5 * 60 * 1000
      };

      res.redirect(results.xoauth_request_auth_url);
    }
  });
};

/**
 * @param {Object} req A request object.
 * @param {Object} res A response object.
 * @param {function} next Run if done in this scope.
 */
exports.callback = function(req, res, next) {
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

