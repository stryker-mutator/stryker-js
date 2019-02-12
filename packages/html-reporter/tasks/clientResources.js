const path = require('path');
const glob = require('glob');
const mkdirp = require('mkdirp');
const fs = require('fs');
const rimraf = require('rimraf');

const callbackAsPromised = (res, rej) => (err, result) => {
  if (err) {
    rej(err);
  } else {
    res(result);
  }
};

const rmAsPromised = path => new Promise((res, rej) => rimraf(path, callbackAsPromised(res, rej)));

const globAsPromised = (expression, options) => new Promise((res, rej) => glob(expression, options, callbackAsPromised(res, rej)));
const mkdirpAsPromised = location => new Promise((res, rej) => mkdirp(location, callbackAsPromised(res, rej)));
const copyAsPromised = (from, to) => mkdirpAsPromised(path.dirname(to))
  .then(() => new Promise((res, rej) => {
    const readStream = fs.createReadStream(from);
    readStream.on('error', rej);
    var writeStream = fs.createWriteStream(to);
    writeStream.on('error', rej);
    readStream.pipe(writeStream);
    writeStream.on('finish', res);
  }));

const copyAll = (from, to, globExpression) => Promise.all([globAsPromised(globExpression, { cwd: from }), rmAsPromised(to)])
  .then(result => result[0])
  .then(files => Promise.all(files.map(file => copyAsPromised(path.join(from, file), path.join(to, file)))))
  .catch(err => console.error(`Error during copy from ${from}/${globExpression} to ${to}`, err));

copyAll('node_modules/bootstrap/dist', 'resources/bootstrap', '**/*+(.css|.js)');
copyAll('node_modules/jquery', 'resources/jquery', 'dist/jquery.slim.min.js');
copyAll('node_modules/tooltip.js', 'resources/tooltip.js', 'dist/umd/tooltip.min.js');
copyAll('node_modules/popper.js', 'resources/popper.js', 'dist/umd/popper.min.js');
copyAll('node_modules/highlight.js', 'resources/highlightjs', 'styles/default.css');
copyAll('srcResources/stryker', 'resources/stryker', '*.*');