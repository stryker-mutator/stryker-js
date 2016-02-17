'use strict';

/**
 * Utility class for checking if a variable has a certain type.
 * @constructor
 */
function TypeUtils() {
  this._arrayType = this._getType([]);
  this._booleanType = this._getType(true);
  this._functionType = this._getType(function() {});
  this._numberType = this._getType(5);
  this._objectType = this._getType({});
  this._stringType = this._getType("");
}

/**
 * Gets the type of an object.
 * @function
 * @param {Object} obj - The Object.
 * @returns {String} The type.
 */
TypeUtils.prototype._getType = function(obj) {
  return ({}).toString.call(obj).match(/\s([a-z|A-Z]+)/)[1].toLowerCase();
};

/**
 * Gets if the type of an object matches it's expected type.
 * @function
 * @param {Object} obj - The Object.
 * @param {String} type - The expected type
 * @returns {Boolean} True if the type of the Object is the expected type.
 */
TypeUtils.prototype._isType = function(obj, type) {
  return this._getType(obj) === type;
};

TypeUtils.prototype.isArray = function(array) {
  return this._isType(array, this._arrayType);
};

TypeUtils.prototype.isBoolean = function(boolean) {
  return this._isType(boolean, this._booleanType);
};

TypeUtils.prototype.isFunction = function(func) {
  return this._isType(func, this._functionType);
};

TypeUtils.prototype.isNumber = function(number) {
  return this._isType(number, this._numberType);
};

TypeUtils.prototype.isObject = function(object) {
  return this._isType(object, this._objectType);
};

TypeUtils.prototype.isString = function(string) {
  return this._isType(string, this._stringType);
};

/**
 * Checks if the provided argument is of the expectd type and throws an error if the types don't match.
 * @function
 * @param {Object} obj - The Object.
 * @param {String} type - The expected type
 * @param {String} className - The name of the class
 * @param {String} parameterName - The name of the parameter
 */
TypeUtils.prototype._expectParameterType = function(obj, type, className, parameterName) {
  if (!this._isType(obj, type)) {
    throw new Error(className + ': parameter `' + parameterName + '`: expected type ' + type + ' but got ' + this._getType(obj));
  }
};

TypeUtils.prototype.expectParameterArray = function(array, className, parameterName) {
  return this._expectParameterType(array, this._arrayType, className, parameterName);
};

TypeUtils.prototype.expectParameterBoolean = function(boolean, className, parameterName) {
  return this._expectParameterType(boolean, this._booleanType, className, parameterName);
};

TypeUtils.prototype.expectParameterFunction = function(func, className, parameterName) {
  return this._expectParameterType(func, this._functionType, className, parameterName);
};

TypeUtils.prototype.expectParameterNumber = function(number, className, parameterName) {
  return this._expectParameterType(number, this._numberType, className, parameterName);
};

TypeUtils.prototype.expectParameterObject = function(object, className, parameterName) {
  return this._expectParameterType(object, this._objectType, className, parameterName);
};

TypeUtils.prototype.expectParameterString = function(string, className, parameterName) {
  return this._expectParameterType(string, this._stringType, className, parameterName);
};

module.exports = TypeUtils;
