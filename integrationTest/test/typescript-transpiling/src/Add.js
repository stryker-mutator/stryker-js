"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function add(num1, num2) {
    return num1 + num2;
}
exports.add = add;
function addOne(n) {
    n++;
    return n;
}
exports.addOne = addOne;
function negate(n) {
    return -n;
}
exports.negate = negate;
function notCovered(n) {
    return n > 10;
}
exports.notCovered = notCovered;
function isNegativeNumber(n) {
    var isNegative = false;
    if (n < 0) {
        isNegative = true;
    }
    return isNegative;
}
exports.isNegativeNumber = isNegativeNumber;
//# sourceMappingURL=Add.js.map