declare module 'web-component-tester' {
  const cli: typeof import('./web-component-tester/runner/cli');
  const config: typeof import('./web-component-tester/runner/config');
  const steps: typeof import('./web-component-tester/runner/steps');
  const test: typeof import('./web-component-tester/runner/test');
}