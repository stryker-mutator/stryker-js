'use strict';

/**
 * Utility class for checking if a variable has a certain type.
 * @constructor
 */
export default class TypeUtils {
  private arrayType = this.getType([]);
  private booleanType = this.getType(true);
  private functionType = this.getType(function() { });
  private numberType = this.getType(5);
  private objectType = this.getType({});
  private stringType = this.getType("");

  /**
   * Gets the type of an object.
   * @function
   * @param obj - The Object.
   * @returns The type.
   */
  private getType(obj: Object): string {
    return ({}).toString.call(obj).match(/\s([a-z|A-Z]+)/)[1].toLowerCase();
  };

  /**
   * Gets if the type of an object matches it's expected type.
   * @function
   * @param obj - The Object.
   * @param type - The expected type
   * @returns  True if the type of the Object is the expected type.
   */
  private isType(obj: any, type: string): boolean {
    return this.getType(obj) === type;
  };

  isArray<T>(array: Array<T>) {
    return this.isType(array, this.arrayType);
  };

  isBoolean(boolean: boolean) {
    return this.isType(boolean, this.booleanType);
  };

  isFunction(func: Function) {
    return this.isType(func, this.functionType);
  };

  isNumber(number: number) {
    return this.isType(number, this.numberType);
  };

  isObject(object: Object) {
    return this.isType(object, this.objectType);
  };

  isString(string: string) {
    return this.isType(string, this.stringType);
  };

  /**
   * Checks if the provided argument is of the expectd type and throws an error if the types don't match.
   * @function
   * @param {Object} obj - The Object.
   * @param {String} type - The expected type
   * @param {String} className - The name of the class
   * @param {String} parameterName - The name of the parameter
   */
  private expectParameterType(obj: any, type: string, className: string, parameterName: string) {
    if (!this.isType(obj, type)) {
      throw new Error(className + ': parameter `' + parameterName + '`: expected type ' + type + ' but got ' + this.getType(obj));
    }
  };
  expectParameterArray<T>(array: Array<T>, className: string, parameterName: string) {
    return this.expectParameterType(array, this.arrayType, className, parameterName);
  };

  expectParameterBoolean(bool: boolean, className: string, parameterName: string) {
    return this.expectParameterType(bool, this.booleanType, className, parameterName);
  };

  expectParameterFunction(func: Function, className: string, parameterName: string) {
    return this.expectParameterType(func, this.functionType, className, parameterName);
  };

  expectParameterNumber(n: number, className: string, parameterName: string) {
    return this.expectParameterType(n, this.numberType, className, parameterName);
  };

  expectParameterObject(object: Object, className: string, parameterName: string) {
    return this.expectParameterType(object, this.objectType, className, parameterName);
  };

  expectParameterString(str: string, className: string, parameterName: string) {
    return this.expectParameterType(str, this.stringType, className, parameterName);
  };
}