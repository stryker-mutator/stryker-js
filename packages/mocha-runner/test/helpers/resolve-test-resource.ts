import path = require('path');

export const resolveTestResource: typeof path.resolve = path.resolve.bind(
  path,
  __dirname,
  '..' /* helpers */,
  '..' /* test */,
  '..' /* dist */,
  'testResources'
);
