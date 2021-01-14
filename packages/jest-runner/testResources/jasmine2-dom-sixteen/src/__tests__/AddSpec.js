/**
 * @jest-environment jest-environment-jsdom-sixteen
 */
require('../Add.js');

describe('Add', function() {

  let parent;

  beforeEach(() => {
    parent = document.createElement('div');
    document.body.appendChild(parent);
  });

  afterEach(() => {
    parent.remove();
  });
  
  it('should be able to add two numbers', function() {
    parent.innerHTML = `<my-calculator operator="add" a="2" b="5" ></<my-calculator>`

    const calculator = parent.querySelector('my-calculator');
    const actual = calculator.innerHTML;

    expect(actual).toBe('7');
  });

  it('should be able to add one to a number', function() {
    parent.innerHTML = `<my-calculator operator="add" a="3" ></<my-calculator>`

    const calculator = parent.querySelector('my-calculator');
    const actual = calculator.innerHTML;

    expect(actual).toBe('3');
  });

  it('should be able negate a number', function() {
    parent.innerHTML = `<my-calculator operator="negate" a="2" ></<my-calculator>`;
    const calculator = parent.querySelector('my-calculator');
    const actual = calculator.innerHTML;

    expect(actual).toBe('-2');
  });

  it('should be able to recognize a negative number', function() {
    parent.innerHTML = `<my-calculator operator="isNegative" a="-2" ></<my-calculator>`;
    const calculator = parent.querySelector('my-calculator');
    const actual = calculator.innerHTML;
    expect(actual).toBe('true');
  });

});
