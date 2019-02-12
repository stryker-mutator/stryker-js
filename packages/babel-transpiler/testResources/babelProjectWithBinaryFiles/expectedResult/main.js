"use strict";

function add() {
  for (var _len = arguments.length, varArgs = new Array(_len), _key = 0; _key < _len; _key++) {
    varArgs[_key] = arguments[_key];
  }

  return varArgs.reduce(function (a, b) {
    return a + b;
  });
}