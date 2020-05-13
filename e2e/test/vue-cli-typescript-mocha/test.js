require('./test/setup.ts');

// Then we find all the tests.
const context = require.context('./src', true, /\.spec\.ts$/);
// And load the modules.
context.keys().map(context);
