suite('mocha client options', () => {
  test('should not override client options', async function () {
    if (!mocha.options.global.includes('jQuery')) {
      throw new Error('Expected global to include jQuery');
    }
  });
  test('should override bail', async () => {
    throw new Error('Expected exception');
  });
  test('should not execute this test', async () => {});
});
