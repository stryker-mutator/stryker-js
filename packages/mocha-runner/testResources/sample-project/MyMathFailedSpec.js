import MyMath from './MyMath.js';

describe('MyMath should fail', function () {
  var myMath;

  beforeEach(function () {
    myMath = new MyMath();
  });

  it('should do 1+1=3', function () {
    expect(myMath.add(1, 1)).to.equal(3);
  });

  it('should do 3+1=5', function () {
    expect(myMath.addOne(3)).to.equal(5);
  });

});
