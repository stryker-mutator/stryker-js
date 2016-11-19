const istanbul = require('istanbul');
const fs = require('fs');
var instrumenter = new istanbul.Instrumenter();

['Add.js', 'Circle.js'].forEach(f => {
  let path = 'src/' + f;
  let code = fs.readFileSync(path, {encoding: 'utf8'});
  let instrumentedCode = instrumenter.instrumentSync(code, path);
  fs.writeFileSync('src-instrumented-for-coverage-all/' + f, instrumentedCode);
});

