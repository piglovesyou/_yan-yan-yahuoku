
var fs = require('fs');

var scriptlist = fs
    .readFileSync(__dirname + '/scriptlist')
    .toString()
    .replace(/public\/(.+?)[\n\r]/g, "script(src='$1')\n");

console.log(scriptlist);
