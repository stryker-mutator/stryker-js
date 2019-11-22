describe('Sum', function() {
    it('should be able to add two numbers', function() {
        var number = 2;
        var expected = number + number;

        var actual = sum(number);

        expect(actual).toEqual(expected);
      });
});