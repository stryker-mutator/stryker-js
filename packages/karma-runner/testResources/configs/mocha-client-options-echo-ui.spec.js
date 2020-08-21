suite('mocha client options', () => {
  test('should not override client options', async function() {
    expect(mocha.options.global).include('jQuery');
  });
  test('should override bail', async () => {
    throw new Error('Expected exception');
  });
  test('should not execute this test', async () => {
  });
})
