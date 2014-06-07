
var express = require('express');
var soy = require('../sources/soynode');
var router = express.Router();

var isProduction = process.env.NODE_ENV === 'production';

/* GET home page. */
router.get('/', function(req, res) {
  res.end(soy.render('app.soy.index', {
    isProduction: isProduction
  }));
});

module.exports = router;
