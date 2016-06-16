import HtmlReporter from '../../src/HtmlReporter';
import * as fs from 'fs';
import * as path from 'path';
import {expect} from 'chai';

const exampleMutations = require('./exampleMutations.json');
const exampleSourceFiles = require('./exampleSourceFiles.json');

function expectFileExists(file: string, expected: boolean){
  try{
    fs.readFileSync(file);
    expect(expected, `file ${file} does not exist`).to.be.true;
  }catch(err){
    expect(expected, `file ${file} exists`).to.be.false;
  }
}

describe.only('HtmlReporter with example project', () => {
  let sut: HtmlReporter, baseDir = 'reports/mutation/integrationTest/' + Math.random();

  describe(`with baseDir ${baseDir}`, () => {
    beforeEach(() => {
      sut = new HtmlReporter({ htmlReporter: { baseDir } });
      sut.onAllSourceFilesRead(exampleSourceFiles);
    });

    describe('onAllMutantsTested()', () => {

      beforeEach(() => {
        sut.onAllMutantsTested(exampleMutations);
        return sut.wrapUp();
      });

      it('should have created index.html, Circle.js.html and Add.js.html file in the configured directory', () => {
        expectFileExists(`${baseDir}/index.html`, true);
        expectFileExists(`${baseDir}/Circle.js.html`, true);
        expectFileExists(`${baseDir}/Add.js.html`, true);
      });
    });

    describe('when initiated a second time with empty events', () => {

      beforeEach( () => {
        sut = new HtmlReporter({ htmlReporter: { baseDir } });
        sut.onAllSourceFilesRead([]);
        sut.onAllMutantsTested([]);
        return sut.wrapUp();
      });

      it(`should clean the folder ${baseDir}`, () => { 
        expectFileExists(`${baseDir}/index.html`, false);
        expectFileExists(`${baseDir}/Circle.js.html`, false);
        expectFileExists(`${baseDir}/Add.js.html`, false);
      });
    });

  });


});

