
var AUC_PRO = require('secret-strings').AUC_PRO;
var OAuth  = require('oauth').OAuth;
module.exports = new OAuth(
    "https://auth.login.yahoo.co.jp/oauth/v2/get_request_token",
    "https://auth.login.yahoo.co.jp/oauth/v2/get_token", 
    AUC_PRO.CONSUMER_KEY,
    AUC_PRO.CONSUMER_SECRET,
    "1.0",
    "oob", // AUC_PRO.DOMAIN + "/authcallback",
    "HMAC-SHA1");


