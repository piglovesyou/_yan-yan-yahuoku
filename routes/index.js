
var express = require('express');
var soy = require('../sources/soynode');

var isProduction = process.env.NODE_ENV === 'production';

module.exports = {};
module.exports['/'] = index;

function index(req, res) {
  res.end(soy.render('app.soy.index', {
    isProduction: isProduction
  }).content);
}

