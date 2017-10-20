import { expect } from 'chai';
import { File, FileKind } from 'stryker-api/core';
import ES6Mutator from '../../src/ES6Mutator';
require('../../src/index');

describe('ES6Mutator', () => {

  it('should not prepend "use strict"', () => {
    let mutator = new ES6Mutator();
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

    expect(mutants[0].replacement).to.equal('1 - 2');
  });
});