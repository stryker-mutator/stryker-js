import { expect } from 'chai';
import { File, FileKind } from 'stryker-api/core';
import JavaScriptMutator from '../../src/JavaScriptMutator';
require('../../src/index');

describe('JavaScriptMutator', () => {
  it('should generate a correct mutant', () => {
    let mutator = new JavaScriptMutator();
    let files: File[] = [
      {
        name: 'testFile.js',
        included: false,
        mutated: true,
        transpiled: false,
        kind: FileKind.Text,
        content: '"use strict"; var a = 1 + 2;'
      }
    ];

    let mutants = mutator.mutate(files);

    expect(mutants.length).to.equal(1);
    expect(mutants[0]).to.deep.equal({
      mutatorName: 'BinaryOperator',
      fileName: files[0].name,
      range: [22, 27],
      replacement: '1 - 2'
    });
  });

  
  it('should generate mutants for multiple files', () => {
    let mutator = new JavaScriptMutator();
    let file: File = {
      name: 'testFile.js',
      included: false,
      mutated: true,
      transpiled: false,
      kind: FileKind.Text,
      content: '"use strict"; var a = 1 + 2;'
    };

    let mutants = mutator.mutate([file, file]);

    expect(mutants.length).to.equal(2);
  });

  it('should not mutate files with mutate: false', () => {
    let mutator = new JavaScriptMutator();
    let files: File[] = [
      {
        name: 'testFile.js',
        included: false,
        mutated: false,
        transpiled: false,
        kind: FileKind.Text,
        content: '"use strict"; var a = 1 + 2;'
      },
      {
        name: 'testFile2.js',
        included: false,
        mutated: true,
        transpiled: false,
        kind: FileKind.Text,
        content: '"use strict"; var a = 1 + 2;'
      }
    ];

    let mutants = mutator.mutate(files);

    expect(mutants.length).to.equal(1);
    expect(mutants[0].fileName).to.equal(files[1].name);
  });
});