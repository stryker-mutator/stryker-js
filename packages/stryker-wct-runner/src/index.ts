import * as path from 'path';
import WctTestRunner from './WctTestRunner';
process.chdir(path.resolve(__dirname, '..', 'testResources', 'htmlTestSuite'));
new WctTestRunner({ strykerOptions: {}, fileNames: [], port: 23 }).run();
