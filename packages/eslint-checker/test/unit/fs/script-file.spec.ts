import { describe, it } from 'mocha';
import { expect } from 'chai';
import { Mutant } from '@stryker-mutator/api/core';

import { ScriptFile } from '../../../src/fs/script-file.js';

describe('ScriptFile unit tests', () => {
  const initialContents = 'add(x, y) { return x + y; }';
  let testFile: ScriptFile;

  beforeEach(() => {
    testFile = new ScriptFile(initialContents, 'add.js');
  });

  it("should create a 'file'", () => {
    expect(testFile.content).to.equal(initialContents);
  });

  it('should remember the original contents on update', () => {
    testFile.write('updated');
    testFile.resetMutant();
    expect(testFile.content).to.equal(initialContents);
  });

  it('should apply a mutation', () => {
    const mutation: Mutant = {
      fileName: testFile.fileName,
      id: 'mutation-id',
      location: {
        start: {
          line: 0,
          column: testFile.content.indexOf('{'),
        },
        end: {
          line: 0,
          column: testFile.content.indexOf('}') + 1,
        },
      },
      mutatorName: 'test-mutator',
      replacement: '{}',
    };

    testFile.mutate(mutation);

    expect(testFile.content).to.equal('add(x, y) {}');
  });
});
