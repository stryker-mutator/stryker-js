import { expect } from 'chai';
import { File, FileKind } from 'stryker-api/core';
import JavaScriptMutator from '../../src/JavaScriptMutator';
import '../../src/index';
import { Config } from 'stryker-api/config';

describe('JavaScriptMutator', () => {

  it('should generate a correct mutant', () => {
    const mutator = new JavaScriptMutator(new Config());
    const files: File[] = [
      {
        name: 'testFile.js',
        included: false,
        mutated: true,
        transpiled: false,
        kind: FileKind.Text,
        content: '"use strict"; var a = 1 + 2;'
      }
    ];

    const mutants = mutator.mutate(files);

    expect(mutants.length).to.equal(1);
    expect(mutants[0]).to.deep.equal({
      mutatorName: 'BinaryExpression',
      fileName: files[0].name,
      range: [22, 27],
      replacement: '1 - 2'
    });
  });

  it('should generate mutant a correct mutant for jsx code', () => {
    const mutator = new JavaScriptMutator(new Config());
    const files: File[] = [
      {
        name: 'testFile.js',
        included: false,
        mutated: true,
        transpiled: false,
        kind: FileKind.Text,
        content: `
          "use strict";
          import React from 'react'
          import { render } from 'react-dom'
          import App from 'app/components/app'

          const hello = true;
          if(hello) {
            console.log("Hello world!");
          }

          render(
            <App message="Hello!" />,
            document.getElementById('appContainer')
          )
        `
      }
    ];

    const mutants = mutator.mutate(files);

    expect(mutants.length).to.equal(4);
    expect(mutants).to.deep.include({ 
      mutatorName: 'IfStatement',
      fileName: 'testFile.js',
      range: [ 197, 202 ],
      replacement: 'true' 
    });
  });
  
  it('should generate mutants for multiple files', () => {
    let mutator = new JavaScriptMutator(new Config());
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
    let mutator = new JavaScriptMutator(new Config());
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
    expect(mutants[0].fileName).to.equal('testFile2.js');
  });
});