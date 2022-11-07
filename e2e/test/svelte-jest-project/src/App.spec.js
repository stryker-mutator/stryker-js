// import { render, screen } from '@testing-library/svelte';
// import App from './App.svelte';

// @ts-ignore
const App = require('./App.svelte').default;
// @ts-ignore
const sum = require('./App.svelte').sum;

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
