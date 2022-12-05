// @ts-ignore
const App = require('./App.svelte').default;
// @ts-ignore
const sum = require('./App.svelte').sum;
// @ts-ignore
const multiply = require('./App.svelte').sum;
// @ts-ignore
const isOldEnough = require('./App.svelte').isOldEnough;
// @ts-ignore
const loop = require('./App.svelte').loop;

// @ts-ignore
const render = require('@testing-library/svelte').render;
// @ts-ignore
const screen = require('@testing-library/svelte').screen;

test("says 'hello world!'", () => {
    render(App);
    const node = screen.queryByText("Hello world!");
    expect(node).not.toBeNull();
})

test('adds 1 + 2 to equal 3', () => {
    expect(sum(1, 2)).toBe(3);
});

test('check if age goes over ', () => {
  expect(isOldEnough(18)).toBe(true);
});

test('should result in 15 for n=5 and a sum function', () => {
  let result = 0;
  loop(5, (n) => (result += n));
  expect(result).toEqual(15);
});
