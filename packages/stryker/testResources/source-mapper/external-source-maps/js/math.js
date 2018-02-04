"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function max() {
    var numbers = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        numbers[_i] = arguments[_i];
    }
    return Math.max.apply(Math, numbers);
}
exports.max = max;
function total() {
    var numbers = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        numbers[_i] = arguments[_i];
    }
    return numbers.reduce(function (a, b) { return a + b; });
}
exports.total = total;
//# sourceMappingURL=math.js.map