

var soynode = require('soynode');
var isProduction = process.env.NODE_ENV === 'production';

soynode.setOptions({
  tmpDir: '/tmp/soynode-example',
  allowDynamicRecompile: !isProduction
});

soynode.compileTemplates(__dirname + '/../public/app/soy', function(err) {
  if (err) throw err;
  console.log('soynode is ready.');
});

module.exports = soynode;
