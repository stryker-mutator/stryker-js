import { File } from '@stryker-mutator/api/core';
import { testInjector } from '@stryker-mutator/test-helpers';
import { expect } from 'chai';

import { JavaScriptMutator } from '../../src/JavaScriptMutator';
import { nodeMutators } from '../../src/mutators';
import { NodeMutator } from '../../src/mutators/NodeMutator';
import BabelParser from '../../src/helpers/BabelParser';
import { NODE_MUTATORS_TOKEN, PARSER_TOKEN } from '../../src/helpers/tokens';

describe('JavaScriptMutator', () => {
  let selectedMutators: readonly NodeMutator[];

  beforeEach(() => {
    selectedMutators = nodeMutators;
  });

  function createSut() {
    return testInjector.injector
      .provideValue(NODE_MUTATORS_TOKEN, selectedMutators)
      .provideClass(PARSER_TOKEN, BabelParser)
      .injectClass(JavaScriptMutator);
  }

  it('should generate a correct mutant', () => {
    const mutator = createSut();
    const files: File[] = [new File('testFile.js', '"use strict"; var a = 1 + 2;')];

    const mutants = mutator.mutate(files);

    expect(mutants.length).to.equal(1);
    expect(mutants[0]).to.deep.equal({
      fileName: files[0].name,
      mutatorName: 'ArithmeticOperator',
      range: [22, 27],
      replacement: '1 - 2'
    });
  });

  it('should generate mutant a correct mutant for jsx code', () => {
    const mutator = createSut();
    const files: File[] = [
      new File(
        'testFile.jsx',
        `
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
      )
    ];

    const mutants = mutator.mutate(files);

    expect(mutants.length).to.equal(6);
    expect(mutants).to.deep.include({
      fileName: 'testFile.jsx',
      mutatorName: 'ConditionalExpression',
      range: [197, 202],
      replacement: 'true'
    });
  });

  it('should not mutate unknown extensions', () => {
    const mutator = createSut();
    const files: File[] = [
      new File(
        'testFile.html',
        `
      <html>
        <head>
          <title>Test</title>
        </head>
        <body>
          <h1>Hello World</h1>
        </body>
      </html>
    `
      )
    ];
    const mutants = mutator.mutate(files);

    expect(mutants.length).to.equal(0);
  });

  it('should generate mutants for flow code', () => {
    const mutator = createSut();
    const files: File[] = [
      new File(
        'testFile.js',
        `
          // @flow
          import React from 'react'

          function getMessage(message: string) {
            if(message) {
              return message;
            }

            return 'Hello!!';
          }

          const App = ({ if: message }: Props) => (<div>
            <h1>{ getMessage(message) }</h1>
          </div>)

          type Props = {
            message: string
          }

          export default App
        `
      )
    ];

    const mutants = mutator.mutate(files);

    expect(mutants.length).to.equal(6);
    expect(mutants).to.deep.include({
      fileName: 'testFile.js',
      mutatorName: 'ConditionalExpression',
      range: [121, 128],
      replacement: 'false'
    });
  });

  it('should generate mutants for js vnext code', () => {
    const sut = createSut();
    const files: File[] = [
      new File(
        'testFile.js',
        `
          function objectRestSpread(input) {
            return {
              ...input,
              foo: true,
            };
          }

          class ClassProperties { b = 1n; }

          async function* asyncGenerators(i) {
            yield i;
            yield i + 10;
          }

          function dynamicImport(){
            import('./guy').then(a)
          }
        `
      )
    ];

    const mutants = sut.mutate(files);
    expect(mutants).lengthOf.above(2);
  });

  it('should generate mutants for multiple files', () => {
    const mutator = createSut();
    const file: File = new File('testFile.js', '"use strict"; var a = 1 + 2;');
    const file2: File = new File('testFile2.js', '"use strict"; var a = 1 + 2;');
    const mutants = mutator.mutate([file, file2]);

    expect(mutants.length).to.equal(2);
  });

  it('should generate mutants when file contains a decorator', () => {
    const sut = createSut();
    const files: File[] = [
      new File(
        'testFile.js',
        `
          @decorator()
          export class Foo {
            bar = 'bar';
          };
        `
      )
    ];

    const mutants = sut.mutate(files);
    expect(mutants).lengthOf.above(0);
  });
});
