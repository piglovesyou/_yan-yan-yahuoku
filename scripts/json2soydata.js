
var file = process.argv[2];
var fs = require('fs');
var _ = require('underscore');

var INDENT = '    ';



var json = file && JSON.parse(fs.readFileSync(file, 'utf8'));
if (json) {
  console.log(toString(json));
} else {
  console.log(
    'Usage:\n' +
    '    $ node json2soydata.js ./path/to/file.json\n'
  );
}



function toString(obj, depth) {
  var sum = '';
  depth = depth || 0;
  var indent = '';
  for (var i = 0; i < depth; i++)
    indent += INDENT;
  if (_.isObject(obj)) {
    var linebreak = _.keys(obj).length > 1 ? '\n' : '';
    
    sum += '[' + linebreak;
    for (var k in obj)
      sum += (linebreak ? indent + INDENT : ' ') + '\'' + k + '\': ' +
                                toString(obj[k], depth + 1) + linebreak;
    sum += (linebreak ? indent : ' ') + '],';
  }
  else if (_.isArray(sum, obj)) {
    for (var i = 0; i < obj.length; i++) {
      sum += indent + '[\n';
      sum += indent + INDENT + toString(obj[k], depth + 1);
      sum += indent + '],\n';
    }
  } else if (_.isString(obj)) {
    sum += '\'' + obj + '\',';
  } else {
    sum += obj + ',';
  }
  return sum;
}
