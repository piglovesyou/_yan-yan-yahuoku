
var fs = require('fs'),
    scripts = process.argv[2];

if (!scripts) {
  throw new Error('I need one argument for a script filename.');
  process.exit();
}

console.log(
  fs.readFileSync(scripts)
    .toString()
    .replace(/public\/(.+?)[\n\r]/g, "script(src='/$1')\n")
);
