
var express = require('express');
var soy = require('../sources/soynode');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  // res.render('index', { title: 'Express' });
  res.end(soy.render('app.soy.index', {
    // isProduction: isProduction,
    // items: items
  }));
});

module.exports = router;
