
var arr = [];
var timerId = null;

module.exports.push = function (fn) {
  arr.push(fn);
};

module.exports.has = has = function () {
  return arr.length >= 1;
};

module.exports.isScheduled = function () {
  return timerId !== null;
};

module.exports.exec = function exec (opt_interval) {
  if (!has()) {
    timerId = null;
    return;
  }
  arr.shift()();

  var interval = typeof opt_interval == 'number' ? opt_interval : 100;
  timerId = setTimeout(function () {
    exec(interval);
  }, interval);
};
