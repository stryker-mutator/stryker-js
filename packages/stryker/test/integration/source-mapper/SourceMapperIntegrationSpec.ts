// import * as fs from 'mz/fs';
// import * as path from 'path';
// import { File } from 'stryker-api/core';
// import { IstanbulUtils } from '../../../src/utils/IstanbulUtils';
// import CoverageInstrumenterTranspiler from '../../../src/transpiler/CoverageInstrumenterTranspiler';
// import { config, textFile } from '../../helpers/producers';

// function resolve(...filePart: string[]) {
//   return path.resolve(__dirname, '..', '..', '..', 'testResources', 'istanbul-utils-files', ...filePart);
// }

// function readFiles(...files: string[]): Promise<File[]> {
//   return Promise.all(files.map(fileName => fs.readFile(resolve(fileName), 'utf8').then(content => textFile({
//     content, name: fileName
//   }))));
// }

// describe('Istanbul utils', () => {

//   let sut: IstanbulUtils;

//   beforeEach(() => {
//     sut = new IstanbulUtils();
//   });

//   describe('remapCoverageMaps', () => {

//     it('it should be able to remap coverage', async () => {
//       const files = await readFiles(
//         path.join('typescript-project', 'js', 'math.js'),
//         path.join('typescript-project', 'js', 'math.js.map'));

//       const coverageTranspiler = new CoverageInstrumenterTranspiler({ produceSourceMaps: true, config: config() }, null);
//       await coverageTranspiler.transpile(files);
//       sut.remapCoverageMapsByFile(coverageTranspiler.fileCoverageMaps, files);

//       // .remapCoverageMaps(;

//     });
//   });


// });

