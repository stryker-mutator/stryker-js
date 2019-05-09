import { expect } from 'chai';
import { File } from '@stryker-mutator/api/core';
import { Mutant, Mutator } from '@stryker-mutator/api/mutant';
import * as MutatorHelpers from '../../src/helpers/MutatorHelpers';
import VueMutator from '../../src/VueMutator';
import { SinonStubbedInstance } from 'sinon';
import * as sinon from 'sinon';
import { testInjector } from '@stryker-mutator/test-helpers';

describe('VueMutator', () => {
  let stubJavaScriptMutator: SinonStubbedInstance<Mutator>;
  let stubTypeScriptMutator: SinonStubbedInstance<Mutator>;
  let mutators: { [name: string]: Mutator };

  beforeEach(() => {
    mutators = {};
    stubJavaScriptMutator = sinon.createStubInstance<Mutator>(VueMutator);
    stubJavaScriptMutator.mutate.returns([]);
    stubTypeScriptMutator = sinon.createStubInstance<Mutator>(VueMutator);
    stubTypeScriptMutator.mutate.returns([]);
  });

  function createSut() {
    return testInjector.injector
      .provideValue(MutatorHelpers.MUTATORS_TOKEN, mutators)
      .injectClass(VueMutator);
  }

  describe('with JavaScript', () => {
    it('should throw an error if no JavaScript mutator is installed', () => {
      mutators = {};
      const vueFile = new File('Component.vue',
        `<template>
          <span id="msg">{{ message }}</span>
        </template>
        <script>
          export default {
            data () {
              return {
                message: 'hello!'
              }
            }
          }
        </script>`);

      const files = [vueFile];
      const sut = createSut();

      expect(() => sut.mutate(files)).throws(`The 'javascript' mutator is required to mutate a <script> block but it was not found. Please read the README of this package for information on configuration.`);
    });

    it('should throw an error when the first file is not a Vue file and no mutators are installed', () => {
      mutators = {};
      const vueFile = new File('Component.vue',
        `<template>
          <span id="msg">{{ message }}</span>
        </template>
        <script>
          export default {
            data () {
              return {
                message: 'hello!'
              }
            }
          }
        </script>`);
      const jsFile = new File('index.js', 'var name = "MyApp";');

      const files = [jsFile, vueFile];
      const sut = createSut();

      expect(() => sut.mutate(files)).throws(`Unable to mutate file "${jsFile.name}" because neither the typescript or the javascript mutator was installed. Please read the README of this package for information on configuration.`);
    });

    it('should pass Vue script blocks to the JavaScript mutator', () => {
      mutators = { javascript: stubJavaScriptMutator };
      const script = `export default {
        data () {
          return {
            message: 'hello!'
          }
        }
      }`;
      const vueFile = new File('Component.vue',
        `<template>
        <span id="msg">{{ message }}</span>
      </template>
      <script>${script}</script>`);
      const files = [vueFile];
      const sut = createSut();

      sut.mutate(files);

      expect(stubJavaScriptMutator.mutate).calledWith([new File(`${vueFile.name}.js`, script)]);
    });

    it('should pass Vue script blocks with lang="js" to the JavaScript mutator', () => {
      mutators = { javascript: stubJavaScriptMutator };
      const script = `export default {
        data () {
          return {
            message: 'hello!'
          }
        }
      }`;
      const vueFile = new File('Component.vue',
        `<template>
        <span id="msg">{{ message }}</span>
      </template>
      <script lang="js">${script}</script>`);
      const files = [vueFile];
      const sut = createSut();

      sut.mutate(files);

      expect(stubJavaScriptMutator.mutate).calledWith([new File(`${vueFile.name}.js`, script)]);
    });

    it('should pass Vue script blocks with lang="javascript" to the JavaScript mutator', () => {
      mutators = { javascript: stubJavaScriptMutator };
      const script = `export default {
        data () {
          return {
            message: 'hello!'
          }
        }
      }`;
      const vueFile = new File('Component.vue',
        `<template>
        <span id="msg">{{ message }}</span>
      </template>
      <script lang="javascript">${script}</script>`);
      const files = [vueFile];
      const sut = createSut();

      sut.mutate(files);

      expect(stubJavaScriptMutator.mutate).calledWith([new File(`${vueFile.name}.js`, script)]);
    });

    it('should pass regular files to the TypeScript mutator, even if the JavaScript mutator is installed', () => {
      mutators = { javascript: stubJavaScriptMutator, typescript: stubTypeScriptMutator };
      const jsFile = new File('index.js', 'var name = "MyApp";');
      const files = [jsFile];
      const sut = createSut();

      sut.mutate(files);

      expect(stubTypeScriptMutator.mutate).calledWith([jsFile]);
      expect(stubJavaScriptMutator.mutate).not.called;
    });

    it('should pass regular files to the JavaScript mutator', () => {
      mutators = { javascript: stubJavaScriptMutator };
      const jsFile = new File('index.js', 'var name = "MyApp";');
      const files = [jsFile];
      const sut = createSut();

      sut.mutate(files);

      expect(stubJavaScriptMutator.mutate).calledWith([jsFile]);
    });
  });

  describe('with TypeScript', () => {
    it('should throw an error if no TypeScript mutator is installed', () => {
      mutators = {};
      const vueFile = new File('Component.vue',
        `<template>
          <span id="msg">{{ message }}</span>
        </template>
        <script lang="ts">
          export default {
            data () {
              return {
                message: 'hello!'
              }
            }
          }
        </script>`);

      const files = [vueFile];
      const sut = createSut();

      expect(() => sut.mutate(files)).throws(`The 'typescript' mutator is required to mutate a <script> block but it was not found. Please read the README of this package for information on configuration.`);
    });

    it('should throw an error when the first file is not a Vue file and no mutators are installed', () => {
      mutators = {};
      const vueFile = new File('Component.vue',
        `<template>
          <span id="msg">{{ message }}</span>
        </template>
        <script lang="ts">
          export default {
            data () {
              return {
                message: 'hello!'
              }
            }
          }
        </script>`);
      const jsFile = new File('index.js', 'var name = "MyApp";');

      const files = [jsFile, vueFile];
      const sut = createSut();

      expect(() => sut.mutate(files)).throws(`Unable to mutate file "${jsFile.name}" because neither the typescript or the javascript mutator was installed. Please read the README of this package for information on configuration.`);
    });

    it('should pass Vue script blocks with lang="ts" to the TypeScript mutator', () => {
      mutators = { typescript: stubTypeScriptMutator };
      const script = `export default {
        data () {
          return {
            message: 'hello!'
          }
        }
      }`;
      const vueFile = new File('Component.vue',
        `<template>
        <span id="msg">{{ message }}</span>
      </template>
      <script lang="ts">${script}</script>`);
      const files = [vueFile];
      const sut = createSut();

      sut.mutate(files);

      expect(stubTypeScriptMutator.mutate).calledWith([new File(`${vueFile.name}.ts`, script)]);
    });

    it('should pass Vue script blocks with lang="typescript" to the TypeScript mutator', () => {
      mutators = { typescript: stubTypeScriptMutator };
      const script = `export default {
        data () {
          return {
            message: 'hello!'
          }
        }
      }`;
      const vueFile = new File('Component.vue',
        `<template>
        <span id="msg">{{ message }}</span>
      </template>
      <script lang="typescript">${script}</script>`);
      const files = [vueFile];
      const sut = createSut();

      sut.mutate(files);

      expect(stubTypeScriptMutator.mutate).calledWith([new File(`${vueFile.name}.ts`, script)]);
    });

    it('should pass regular files to the TypeScript mutator', () => {
      mutators = { typescript: stubTypeScriptMutator };
      const jsFile = new File('index.js', 'var name = "MyApp";');
      const files = [jsFile];
      const sut = createSut();

      sut.mutate(files);

      expect(stubTypeScriptMutator.mutate).calledWith([jsFile]);
    });
  });

  it('should throw an error when a Vue script block has an unknown lang attribute', () => {
      mutators = {};
      const script = `export default {
      data () {
        return {
          message: 'hello!'
        }
      }
    }`;
      const vueFile = new File('Component.vue',
      `<template>
      <span id="msg">{{ message }}</span>
    </template>
    <script lang="coffeescript">${script}</script>`);
      const files = [vueFile];
      const sut = createSut();

      expect(() => sut.mutate(files)).throws(`Found unsupported language attribute 'lang="coffeescript"' on a <script> block.`);
  });

  it('should not mutate a .vue file without a <script> block', () => {
    mutators = { javascript: stubJavaScriptMutator };
    const vueFile = new File('Component.vue',
      `<template>
      <span id="msg">{{ message }}</span>
    </template>`);
    const files = [vueFile];
    const sut = createSut();

    const result = sut.mutate(files);

    expect(result).to.be.empty;
    expect(stubJavaScriptMutator.mutate).calledWith([vueFile]);
  });

  it('should generate correct vue mutants', () => {
    mutators = { javascript: stubJavaScriptMutator };

    const codeToMutate = `'hello!'`;
    const script = `export default {
      data () {
        return {
          message: ${codeToMutate};
        }
      }
    }`;
    const vueFile = new File('Component.vue',
      `<template>
      <span id="msg">{{ message }}</span>
    </template>
    <script>${script}</script>`);
    const files = [vueFile];
    const jsMutant: Mutant = {
      fileName: `${vueFile.name}.js`,
      mutatorName: 'StringLiteral',
      range: [script.indexOf(codeToMutate), script.indexOf(codeToMutate) + codeToMutate.length],
      replacement: ''
    };
    stubJavaScriptMutator.mutate.returns([jsMutant]);
    const sut = createSut();

    const mutants = sut.mutate(files);
    const generatedMutant = mutants[0];

    expect(mutants.length).to.equal(1);
    expect(generatedMutant.mutatorName).to.equal(jsMutant.mutatorName);
    expect(generatedMutant.fileName).to.equal(vueFile.name);
    expect(generatedMutant.range).to.deep.equal([vueFile.textContent.indexOf(codeToMutate), vueFile.textContent.indexOf(codeToMutate) + codeToMutate.length]);
    expect(generatedMutant.replacement).to.equal(jsMutant.replacement);
  });
});
