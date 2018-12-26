import { expect } from 'chai';
import { SinonStubbedInstance } from 'sinon';
import { Config } from 'stryker-api/config';
import { File } from 'stryker-api/core';
import { Mutant, Mutator } from 'stryker-api/mutant';
import * as MutatorHelpers from '../../src/helpers/MutatorHelpers';
import VueMutator from '../../src/VueMutator';

describe('VueMutator', () => {
  let config: Config;
  let stubJavaScriptMutator: SinonStubbedInstance<Mutator>;
  let stubTypeScriptMutator: SinonStubbedInstance<Mutator>;

  beforeEach(() => {
    config = new Config();
    stubJavaScriptMutator = sandbox.createStubInstance<Mutator>(VueMutator);
    stubJavaScriptMutator.mutate.returns([]);
    stubTypeScriptMutator = sandbox.createStubInstance<Mutator>(VueMutator);
    stubTypeScriptMutator.mutate.returns([]);
  });

  const setMutators = (mutators: { [name: string]: Mutator }) => sandbox.stub(MutatorHelpers, 'discoverMutators').returns(mutators);
  const activateNoMutators = () => setMutators({});
  const activateJavaScriptMutator = () => setMutators({ javascript: stubJavaScriptMutator });
  const activateTypeScriptMutator = () => setMutators({ typescript: stubTypeScriptMutator });
  const activateJavaScriptAndTypeScriptMutators = () => setMutators({ javascript: stubJavaScriptMutator, typescript: stubTypeScriptMutator });

  describe('with JavaScript', () => {
    it('should throw an error if no JavaScript mutator is installed', () => {
      activateNoMutators();
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
      const sut = new VueMutator(config);

      expect(() => sut.mutate(files)).throws(`The 'javascript' mutator is required to mutate a <script> block but it was not found. Please read the README of this package for information on configuration.`);
    });

    it('should throw an error when the first file is not a Vue file and no mutators are installed', () => {
      activateNoMutators();
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
      const sut = new VueMutator(config);

      expect(() => sut.mutate(files)).throws(`Unable to mutate file "${jsFile.name}" because neither the typescript or the javascript mutator was installed. Please read the README of this package for information on configuration.`);
    });

    it('should pass Vue script blocks to the JavaScript mutator', () => {
      activateJavaScriptMutator();
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
      const sut = new VueMutator(config);

      sut.mutate(files);

      expect(stubJavaScriptMutator.mutate).calledWith([new File(`${vueFile.name}.js`, script)]);
    });

    it('should pass Vue script blocks with lang="js" to the JavaScript mutator', () => {
      activateJavaScriptMutator();
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
      const sut = new VueMutator(config);

      sut.mutate(files);

      expect(stubJavaScriptMutator.mutate).calledWith([new File(`${vueFile.name}.js`, script)]);
    });

    it('should pass Vue script blocks with lang="javascript" to the JavaScript mutator', () => {
      activateJavaScriptMutator();
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
      const sut = new VueMutator(config);

      sut.mutate(files);

      expect(stubJavaScriptMutator.mutate).calledWith([new File(`${vueFile.name}.js`, script)]);
    });

    it('should pass regular files to the TypeScript mutator, even if the JavaScript mutator is installed', () => {
      activateJavaScriptAndTypeScriptMutators();
      const jsFile = new File('index.js', 'var name = "MyApp";');
      const files = [jsFile];
      const sut = new VueMutator(config);

      sut.mutate(files);

      expect(stubTypeScriptMutator.mutate).calledWith([jsFile]);
      expect(stubJavaScriptMutator.mutate).not.called;
    });

    it('should pass regular files to the JavaScript mutator', () => {
      activateJavaScriptMutator();
      const jsFile = new File('index.js', 'var name = "MyApp";');
      const files = [jsFile];
      const sut = new VueMutator(config);

      sut.mutate(files);

      expect(stubJavaScriptMutator.mutate).calledWith([jsFile]);
    });
  });

  describe('with TypeScript', () => {
    it('should throw an error if no TypeScript mutator is installed', () => {
      activateNoMutators();
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
      const sut = new VueMutator(config);

      expect(() => sut.mutate(files)).throws(`The 'typescript' mutator is required to mutate a <script> block but it was not found. Please read the README of this package for information on configuration.`);
    });

    it('should throw an error when the first file is not a Vue file and no mutators are installed', () => {
      activateNoMutators();
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
      const sut = new VueMutator(config);

      expect(() => sut.mutate(files)).throws(`Unable to mutate file "${jsFile.name}" because neither the typescript or the javascript mutator was installed. Please read the README of this package for information on configuration.`);
    });

    it('should pass Vue script blocks with lang="ts" to the TypeScript mutator', () => {
      activateTypeScriptMutator();
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
      const sut = new VueMutator(config);

      sut.mutate(files);

      expect(stubTypeScriptMutator.mutate).calledWith([new File(`${vueFile.name}.ts`, script)]);
    });

    it('should pass Vue script blocks with lang="typescript" to the TypeScript mutator', () => {
      activateTypeScriptMutator();
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
      const sut = new VueMutator(config);

      sut.mutate(files);

      expect(stubTypeScriptMutator.mutate).calledWith([new File(`${vueFile.name}.ts`, script)]);
    });

    it('should pass regular files to the TypeScript mutator', () => {
      activateTypeScriptMutator();
      const jsFile = new File('index.js', 'var name = "MyApp";');
      const files = [jsFile];
      const sut = new VueMutator(config);

      sut.mutate(files);

      expect(stubTypeScriptMutator.mutate).calledWith([jsFile]);
    });
  });

  it('should throw an error when a Vue script block has an unknown lang attribute', () => {
    activateNoMutators();
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
    const sut = new VueMutator(config);

    expect(() => sut.mutate(files)).throws(`Found unsupported language attribute 'lang="coffeescript"' on a <script> block.`);
  });

  it('should generate correct vue mutants', () => {
    activateJavaScriptMutator();
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
    const sut = new VueMutator(config);

    const mutants = sut.mutate(files);
    const generatedMutant = mutants[0];

    expect(mutants.length).to.equal(1);
    expect(generatedMutant.mutatorName).to.equal(jsMutant.mutatorName);
    expect(generatedMutant.fileName).to.equal(vueFile.name);
    expect(generatedMutant.range).to.deep.equal([vueFile.textContent.indexOf(codeToMutate), vueFile.textContent.indexOf(codeToMutate) + codeToMutate.length]);
    expect(generatedMutant.replacement).to.equal(jsMutant.replacement);
  });
});
