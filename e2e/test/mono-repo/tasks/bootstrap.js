const fs = require('fs');
const path = require('path');
const fooNodeModule = path.resolve(__dirname, '..', 'packages', 'app', 'node_modules', 'foo');
fs.mkdirSync(fooNodeModule, { recursive: true });
fs.writeFileSync(path.resolve(fooNodeModule, 'index.js'), 'module.exports = "foo"');
