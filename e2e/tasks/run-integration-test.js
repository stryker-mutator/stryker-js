"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const path = require("path");
// import * as execa from 'execa';
// import * as semver from 'semver';
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
const testRootDir = path.resolve(__dirname, '..', 'test');

process.exit = (test) => {
  console.log('process.exit aangeroepen')
};
function runIntegrationTests() {
    return __awaiter(this, void 0, void 0, function* () {
        const dirs = yield fs_1.promises.readdir(testRootDir)
            .then(dirs => dirs.filter(file => fs_1.statSync(path.join(testRootDir, file)).isDirectory()));
        const concurrencyToken$ = new rxjs_1.Subject();
        let testsRan = 0;
        const test$ = rxjs_1.zip(rxjs_1.from(dirs), concurrencyToken$).pipe(
        // flatMap(([dir]) => {
        //   return runTest(dir);
        // }),
        operators_1.tap(testDir => console.log(`\u2714 ${testDir} tested (${++testsRan}/${dirs.length})`)), operators_1.tap(() => concurrencyToken$.next(null)));
        const concurrency = 4;
        rxjs_1.range(0, concurrency).subscribe(() => concurrencyToken$.next(null));
        const p = test$.toPromise();
        console.log(p);
        yield p.then(sa => console.log('WHAT??'));
    });
}
runIntegrationTests()
    .then(() => console.log('Done'))
    .catch(err => {
    console.error(err);
    process.exitCode = 1;
});
// function execNpm(command: string, testDir: string) {
//   const currentTestDir = path.resolve(testRootDir, testDir);
//   console.log(`Exec ${testDir} npm ${command}`);
//   const testProcess = execa('npm', [command], { timeout: 500000, cwd: currentTestDir, stdio: 'pipe' });
//   let stderr = '';
//   let stdout = '';
//   testProcess.stderr.on('data', chunk => stderr += chunk.toString());
//   testProcess.stdout.on('data', chunk => stdout += chunk.toString());
//   return testProcess.catch(error => {
//     console.log(`X ${testDir}`);
//     console.log(stdout);
//     console.error(stderr);
//     throw error;
//   });
// }
// function satisfiesNodeVersion(testDir: string): boolean {
//   const pkg = require(path.resolve(testRootDir, testDir, 'package.json'));
//   console.log(pkg.name, pkg.engines);
//   const supportedNodeVersionRange = pkg.engines && pkg.engines.node;
//   if (supportedNodeVersionRange && !semver.satisfies(process.version, supportedNodeVersionRange)) {
//     console.log(`\u2610 ${testDir} skipped (node version ${process.version} did not satisfy ${supportedNodeVersionRange})`);
//     return false;
//   } else {
//     return true;
//   }
// }
// async function runTest(testDir: string) {
//   if (satisfiesNodeVersion(testDir)) {
//     await execNpm('test', testDir);
//   }
//   return testDir;
// }
