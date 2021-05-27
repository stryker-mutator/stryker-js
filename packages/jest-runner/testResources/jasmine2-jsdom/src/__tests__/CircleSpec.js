require('../Circle');

describe('Circle', function() {
  let parent;

  beforeEach(() => {
    parent = document.createElement('div');
    document.body.appendChild(parent);
  });

  afterEach(() => {
    parent.remove();
  });

  it('should have a circumference of 2PI when the radius is 1', function() {
    parent.innerHTML = `<my-circle radius="1" ></<my-calculator>`;
    const calculator = parent.querySelector('my-circle');
    const actual = calculator.circumference;
    expect(actual).toBe(2 * Math.PI);
  });
});
