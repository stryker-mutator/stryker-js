'use strict';

/**
 * Utility class for checking if a variable has a certain type.
 * @constructor
 */
export default class TypeUtils {
  private _arrayType = this._getType([]);
  private _booleanType = this._getType(true);
  private _functionType = this._getType(function() { });
  private _numberType = this._getType(5);
  private _objectType = this._getType({});
  private _stringType = this._getType("");

  /**
   * Gets the type of an object.
   * @function
   * @param obj - The Object.
   * @returns The type.
   */
  private _getType(obj: Object): string {
    return ({}).toString.call(obj).match(/\s([a-z|A-Z]+)/)[1].toLowerCase();
  };

  /**
   * Gets if the type of an object matches it's expected type.
   * @function
   * @param obj - The Object.
   * @param type - The expected type
   * @returns  True if the type of the Object is the expected type.
   */
  private _isType(obj: any, type: string): boolean {
    return this._getType(obj) === type;
  };

  isArray<T>(array: Array<T>) {
    return this._isType(array, this._arrayType);
  };

  isBoolean(boolean: boolean) {
    return this._isType(boolean, this._booleanType);
  };

  isFunction(func: Function) {
    return this._isType(func, this._functionType);
  };

  isNumber(number: number) {
    return this._isType(number, this._numberType);
  };

  isObject(object: Object) {
    return this._isType(object, this._objectType);
  };

  isString(string: string) {
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
  private _expectParameterType(obj, type: string, className: string, parameterName: string) {
    if (!this._isType(obj, type)) {
      throw new Error(className + ': parameter `' + parameterName + '`: expected type ' + type + ' but got ' + this._getType(obj));
    }
  };
  expectParameterArray<T>(array: Array<T>, className: string, parameterName) {
    return this._expectParameterType(array, this._arrayType, className, parameterName);
  };

  expectParameterBoolean(bool: boolean, className: string, parameterName: string) {
    return this._expectParameterType(bool, this._booleanType, className, parameterName);
  };

  expectParameterFunction(func: Function, className: string, parameterName: string) {
    return this._expectParameterType(func, this._functionType, className, parameterName);
  };

  expectParameterNumber(n: number, className: string, parameterName: string) {
    return this._expectParameterType(n, this._numberType, className, parameterName);
  };

  expectParameterObject(object: Object, className: string, parameterName: string) {
    return this._expectParameterType(object, this._objectType, className, parameterName);
  };

  expectParameterString(str: string, className: string, parameterName: string) {
    return this._expectParameterType(str, this._stringType, className, parameterName);
  };
}