
var oa = require('../sources/core/oauth.js');
var isProduction = process.env.NODE_ENV === 'production';

exports.index = function(req, res){
  if(req.session.oauth && req.session.oauth.access_token) {
    res.render('index', {
      isProduction: isProduction
      // screen_name: req.session.yahoo.screen_name
    });
  } else {
    res.redirect("/login");
  }
};

exports.login = function (req, res) {
  if(req.session.oauth && req.session.oauth.access_token) {
  } else {
    res.render('login');
  }
};

exports.logout = function (req, res) {
  req.session.destroy();
  res.render('logout');
};

exports.sandbox = function(req, res){
  res.render('sandbox', {
    layout: false
  });
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
