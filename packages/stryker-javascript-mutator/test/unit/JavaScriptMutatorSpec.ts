import { expect } from 'chai';
import { File } from 'stryker-api/core';
import JavaScriptMutator from '../../src/JavaScriptMutator';
import '../../src/index';
import { Config } from 'stryker-api/config';

describe('JavaScriptMutator', () => {

  it('should generate a correct mutant', () => {
    const mutator = new JavaScriptMutator(new Config());
    const files: File[] = [new File('testFile.js', '"use strict"; var a = 1 + 2;')];

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
    const files: File[] = [new File('testFile.jsx', `
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
        `)];

    const mutants = mutator.mutate(files);

    expect(mutants.length).to.equal(4);
    expect(mutants).to.deep.include({
      mutatorName: 'IfStatement',
      fileName: 'testFile.jsx',
      range: [197, 202],
      replacement: 'true'
    });
  });

  it('should not mutate unknown extensions', () => {
    const mutator = new JavaScriptMutator(new Config());
    const files: File[] = [new File('testFile.html', `
      <html>
        <head>
          <title>Test</title>
        </head>
        <body>
          <h1>Hello World</h1>
        </body>
      </html>
    `)];
    const mutants = mutator.mutate(files);

    expect(mutants.length).to.equal(0);
  });

  it('should generate mutants for flow code', () => {
    const mutator = new JavaScriptMutator(new Config());
    const files: File[] = [new File('testFile.js', `
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
        `)];

    const mutants = mutator.mutate(files);

    expect(mutants.length).to.equal(4);
    expect(mutants).to.deep.include({
      mutatorName: 'IfStatement',
      fileName: 'testFile.js',
      range: [131, 138],
      replacement: 'false'
    });
  });

  it('should generate mutants for js vnext code', () => {
    const sut = new JavaScriptMutator(new Config());
    const files: File[] = [new File('testFile.js', `
          function objectRestSpread(input) {
            return {
              ...input,
              foo: true,
            };
          }

          class ClassProperties { b = 1; }

          async function* asyncGenerators(i) {
            yield i;
            yield i + 10;
          }

          function dynamicImport(){
            import('./guy').then(a)
          }
        `)];

    const mutants = sut.mutate(files);
    expect(mutants).lengthOf.above(2);
  });

  it('should generate mutants for multiple files', () => {
    const mutator = new JavaScriptMutator(new Config());
    const file: File = new File('testFile.js', '"use strict"; var a = 1 + 2;');
    const file2: File = new File('testFile2.js', '"use strict"; var a = 1 + 2;');
    const mutants = mutator.mutate([file, file2]);

    expect(mutants.length).to.equal(2);
  });
});