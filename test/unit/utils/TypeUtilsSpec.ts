'use strict';

var expect = require('chai').expect;
var TypeUtils = require('../../../src/utils/TypeUtils');

describe('TypeUtils', function() {
  var typeUtils;

  beforeEach(function() {
    typeUtils = new TypeUtils();
  });

  describe('should throw an error', function() {
    it('if an Array is expected and but not provided', function() {
      expect(function() {
        typeUtils.expectParameterArray({}, 'TypeUtilsSpec', 'test');
      }).to.throw(Error);
    });

    it('if a Boolean is expected and but not provided', function() {
      expect(function() {
        typeUtils.expectParameterBoolean("true", 'TypeUtilsSpec', 'test');
      }).to.throw(Error);
    });

    it('if a Function is expected and but not provided', function() {
      expect(function() {
        typeUtils.expectParameterFunction({}, 'TypeUtilsSpec', 'test');
      }).to.throw(Error);
    });

    it('if a Number is expected and but not provided', function() {
      expect(function() {
        typeUtils.expectParameterNumber("0", 'TypeUtilsSpec', 'test');
      }).to.throw(Error);
    });

    it('if an Object is expected and but not provided', function() {
      expect(function() {
        typeUtils.expectParameterObject([], 'TypeUtilsSpec', 'test');
      }).to.throw(Error);
    });

    it('if a String is expected and but not provided', function() {
      expect(function() {
        typeUtils.expectParameterString({}, 'TypeUtilsSpec', 'test');
      }).to.throw(Error);
    });
  });

  describe('should not throw an error', function() {
    it('if an Array is expected and provided', function() {
      expect(function() {
        typeUtils.expectParameterArray([], 'TypeUtilsSpec', 'test');
      }).to.not.throw();
    });

    it('if a Boolean is expected and provided', function() {
      expect(function() {
        typeUtils.expectParameterBoolean(true, 'TypeUtilsSpec', 'test');
      }).to.not.throw();
    });

    it('if a Function is expected and provided', function() {
      expect(function() {
        typeUtils.expectParameterFunction(function(){}, 'TypeUtilsSpec', 'test');
      }).to.not.throw();
    });

    it('if a Number is expected and provided', function() {
      expect(function() {
        typeUtils.expectParameterNumber(0, 'TypeUtilsSpec', 'test');
      }).to.not.throw();
    });

    it('if an Object is expected and provided', function() {
      expect(function() {
        typeUtils.expectParameterObject({}, 'TypeUtilsSpec', 'test');
      }).to.not.throw();
    });

    it('if a String is expected and provided', function() {
      expect(function() {
        typeUtils.expectParameterString('Hello world!', 'TypeUtilsSpec', 'test');
      }).to.not.throw();
    });
  });

  describe('should see', function() {
    it('an Array as an Array', function() {
      var result = typeUtils.isArray([]);

      expect(result).to.equal(true);
    });

    it('a Boolean as a Boolean', function() {
      var result = typeUtils.isBoolean(true);

      expect(result).to.equal(true);
    });

    it('a Number as a Number', function() {
      var result = typeUtils.isNumber(0);

      expect(result).to.equal(true);
    });

    it('an Object as an Object', function() {
      var result = typeUtils.isObject({});

      expect(result).to.equal(true);
    });

    it('a String as a String', function() {
      var result = typeUtils.isString('Hello world!');

      expect(result).to.equal(true);
    });
  });

  describe('should not see an Array', function() {
    it('as a Boolean', function() {
      var result = typeUtils.isBoolean([]);

      expect(result).to.equal(false);
    });

    it('as a Function', function() {
      var result = typeUtils.isFunction([]);

      expect(result).to.equal(false);
    });

    it('as a Number', function() {
      var result = typeUtils.isNumber([]);

      expect(result).to.equal(false);
    });

    it('as an Object', function() {
      var result = typeUtils.isObject([]);

      expect(result).to.equal(false);
    });

    it('as a String', function() {
      var result = typeUtils.isString([]);

      expect(result).to.equal(false);
    });
  });

  describe('should not see a Boolean', function() {
    it('as an Array', function() {
      var result = typeUtils.isArray(true);

      expect(result).to.equal(false);
    });

    it('as a Function', function() {
      var result = typeUtils.isFunction(true);

      expect(result).to.equal(false);
    });

    it('as a Number', function() {
      var result = typeUtils.isNumber(true);

      expect(result).to.equal(false);
    });

    it('as an Object', function() {
      var result = typeUtils.isObject(true);

      expect(result).to.equal(false);
    });

    it('as a String', function() {
      var result = typeUtils.isString(true);

      expect(result).to.equal(false);
    });
  });

  describe('should not see a Function', function() {
    it('as an Array', function() {
      var result = typeUtils.isArray(function(){});

      expect(result).to.equal(false);
    });

    it('as a Boolean', function() {
      var result = typeUtils.isBoolean(function(){});

      expect(result).to.equal(false);
    });

    it('as a Number', function() {
      var result = typeUtils.isNumber(function(){});

      expect(result).to.equal(false);
    });

    it('as an Object', function() {
      var result = typeUtils.isObject(function(){});

      expect(result).to.equal(false);
    });

    it('as a String', function() {
      var result = typeUtils.isString(function(){});

      expect(result).to.equal(false);
    });
  });

  describe('should not see a Number', function() {
    it('as an Array', function() {
      var result = typeUtils.isArray(0);

      expect(result).to.equal(false);
    });

    it('as a Boolean', function() {
      var result = typeUtils.isBoolean(0);

      expect(result).to.equal(false);
    });

    it('as a Function', function() {
      var result = typeUtils.isFunction(0);

      expect(result).to.equal(false);
    });

    it('as an Object', function() {
      var result = typeUtils.isObject(0);

      expect(result).to.equal(false);
    });

    it('as a String', function() {
      var result = typeUtils.isString(0);

      expect(result).to.equal(false);
    });
  });

  describe('should not see an Object', function() {
    it('as an Array', function() {
      var result = typeUtils.isArray({});

      expect(result).to.equal(false);
    });

    it('as a Boolean', function() {
      var result = typeUtils.isBoolean({});

      expect(result).to.equal(false);
    });

    it('as a Function', function() {
      var result = typeUtils.isFunction({});

      expect(result).to.equal(false);
    });

    it('as a Number', function() {
      var result = typeUtils.isNumber({});

      expect(result).to.equal(false);
    });

    it('as a String', function() {
      var result = typeUtils.isString({});

      expect(result).to.equal(false);
    });
  });

  describe('should not see a String', function() {
    it('as an Array', function() {
      var result = typeUtils.isArray('Hello world!');

      expect(result).to.equal(false);
    });

    it('as a Boolean', function() {
      var result = typeUtils.isBoolean('Hello world!');

      expect(result).to.equal(false);
    });

    it('as a Function', function() {
      var result = typeUtils.isFunction('Hello world!');

      expect(result).to.equal(false);
    });

    it('as a Number', function() {
      var result = typeUtils.isNumber('Hello world!');

      expect(result).to.equal(false);
    });

    it('as an Object', function() {
      var result = typeUtils.isObject('Hello world!');

      expect(result).to.equal(false);
    });
  });
});
