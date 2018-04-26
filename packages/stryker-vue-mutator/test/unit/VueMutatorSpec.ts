import { expect } from 'chai';
import * as sinon from 'sinon';
import { Config } from 'stryker-api/config';
import { File } from 'stryker-api/core';
import { Mutator, MutatorFactory } from 'stryker-api/mutant';
import VueMutator from '../../src/VueMutator';

describe('VueMutator', () => {
  let config: Config;
  let sut: VueMutator;
  let stubJavaScriptMutator: sinon.SinonStubbedInstance<Mutator>;
  let stubTypeScriptMutator: sinon.SinonStubbedInstance<Mutator>;

  beforeEach(() => {
    config = new Config();
    sut = new VueMutator(config);
    stubJavaScriptMutator = sandbox.createStubInstance<Mutator>(VueMutator);
    stubTypeScriptMutator = sandbox.createStubInstance<Mutator>(VueMutator);
    sandbox.stub(MutatorFactory.instance(), 'create')
      .withArgs('javascript', config).returns(stubJavaScriptMutator)
      .withArgs('typescript', config).returns(stubTypeScriptMutator);
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('with JavaScript', () => {
    it('should throw an error if no JavaScript mutator is installed', () => {
      sandbox.stub(MutatorFactory.instance(), 'knownNames').returns([]);
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

      expect(() => sut.mutate(files)).throws(`The 'javascript' mutator is required to mutate a <script> block but it was not found. Please read the README of this package for information on configuration.`);
    });

    describe('when the first file is not a Vue file', () => {
      it('should throw an error if no JavaScript mutator is installed', () => {
        sandbox.stub(MutatorFactory.instance(), 'knownNames').returns([]);
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

        expect(() => sut.mutate(files)).throws(`Unable to mutate file "${jsFile.name}" because neither the typescript or the javascript mutator was installed. Please read the README of this package for information on configuration.`);
      });
    });

    it('should pass Vue script blocks to the JavaScript mutator', () => {
      sandbox.stub(MutatorFactory.instance(), 'knownNames').returns(['javascript']);
      stubJavaScriptMutator.mutate.returns([]);
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

      sut.mutate(files);

      expect(stubJavaScriptMutator.mutate).calledWith([new File(`${vueFile.name}.js`, script)]);
    });

    it('should pass Vue script blocks with lang="js" to the JavaScript mutator', () => {
      sandbox.stub(MutatorFactory.instance(), 'knownNames').returns(['javascript']);
      stubJavaScriptMutator.mutate.returns([]);
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

      sut.mutate(files);

      expect(stubJavaScriptMutator.mutate).calledWith([new File(`${vueFile.name}.js`, script)]);
    });

    it('should pass Vue script blocks with lang="javascript" to the JavaScript mutator', () => {
      sandbox.stub(MutatorFactory.instance(), 'knownNames').returns(['javascript']);
      stubJavaScriptMutator.mutate.returns([]);
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

      sut.mutate(files);

      expect(stubJavaScriptMutator.mutate).calledWith([new File(`${vueFile.name}.js`, script)]);
    });

    it('should pass regular files to the TypeScript mutator, even if the JavaScript mutator is installed', () => {
      sandbox.stub(MutatorFactory.instance(), 'knownNames').returns(['javascript', 'typescript']);
      const jsFile = new File('index.js', 'var name = "MyApp";');
      const files = [jsFile];

      sut.mutate(files);

      expect(stubTypeScriptMutator.mutate).calledWith([jsFile]);
      expect(stubJavaScriptMutator.mutate).not.called;
    });

    it('should pass regular files to the JavaScript mutator', () => {
      sandbox.stub(MutatorFactory.instance(), 'knownNames').returns(['javascript']);
      const jsFile = new File('index.js', 'var name = "MyApp";');
      const files = [jsFile];

      sut.mutate(files);

      expect(stubJavaScriptMutator.mutate).calledWith([jsFile]);
    });
  });

  describe('with TypeScript', () => {
    it('should throw an error if no TypeScript mutator is installed', () => {
      sandbox.stub(MutatorFactory.instance(), 'knownNames').returns([]);
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

      expect(() => sut.mutate(files)).throws(`The 'typescript' mutator is required to mutate a <script> block but it was not found. Please read the README of this package for information on configuration.`);
    });

    describe('when the first file is not a Vue file', () => {
      it('should throw an error if no JavaScript mutator is installed', () => {
        sandbox.stub(MutatorFactory.instance(), 'knownNames').returns([]);
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

        expect(() => sut.mutate(files)).throws(`Unable to mutate file "${jsFile.name}" because neither the typescript or the javascript mutator was installed. Please read the README of this package for information on configuration.`);
      });
    });

    it('should pass Vue script blocks with lang="ts" to the TypeScript mutator', () => {
      sandbox.stub(MutatorFactory.instance(), 'knownNames').returns(['typescript']);
      stubTypeScriptMutator.mutate.returns([]);
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

      sut.mutate(files);

      expect(stubTypeScriptMutator.mutate).calledWith([new File(`${vueFile.name}.js`, script)]);
    });

    it('should pass Vue script blocks with lang="typescript" to the TypeScript mutator', () => {
      sandbox.stub(MutatorFactory.instance(), 'knownNames').returns(['typescript']);
      stubTypeScriptMutator.mutate.returns([]);
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

      sut.mutate(files);

      expect(stubTypeScriptMutator.mutate).calledWith([new File(`${vueFile.name}.js`, script)]);
    });


    it('should pass regular files to the TypeScript mutator', () => {
      sandbox.stub(MutatorFactory.instance(), 'knownNames').returns(['typescript']);
      const jsFile = new File('index.js', 'var name = "MyApp";');
      const files = [jsFile];

      sut.mutate(files);

      expect(stubTypeScriptMutator.mutate).calledWith([jsFile]);
    });
  });

  it('should throw an error when a Vue script block has an unknown lang attribute', () => {
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

    expect(() => sut.mutate(files)).throws(`Found unsupported language attribute 'lang="coffeescript"' on a <script> block.`);
  });
});