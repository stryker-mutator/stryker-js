import { expect } from 'chai';
import { File } from '@stryker-mutator/api/core';
import { STRYKER_PLUGINS } from '../../src/index';
import { TEST_INJECTOR } from '@stryker-mutator/test-helpers';
import { PluginKind } from '@stryker-mutator/api/plugin';
import { Mutator } from '@stryker-mutator/api/mutant';
import { STRYKER_PLUGINS as javascriptMutatorStrykerPlugins } from '@stryker-mutator/javascript-mutator';
import { STRYKER_PLUGINS as typescriptMutatorStrykerPlugins } from '@stryker-mutator/typescript';

const javascriptMutatorPlugin = javascriptMutatorStrykerPlugins.find(plugin => plugin.kind === PluginKind.Mutator);
const typescriptMutatorPlugin = typescriptMutatorStrykerPlugins.find(plugin => plugin.kind === PluginKind.Mutator);

describe('VueMutator', () => {

  function createSut(): Mutator {
    return TEST_INJECTOR.injector
      .injectFunction(STRYKER_PLUGINS[0].factory);
  }

  describe('JavaScript project', () => {
    it('should generate mutants', () => {
      TEST_INJECTOR.pluginResolver.resolveAll.returns([javascriptMutatorPlugin]);

      const vueCode = `<template>
      <span id="msg">{{ message }}</span>
      </template>

      <script>
      export default {
        data () {
          return {
            message: 'hello!'
          }
        },
        doMath () {
          return 1 - 2;
        }
      }
      </script>

      <msg>
      #app {
      text-align: center;
      }
      </msg>`;
      const jsCode = `"use strict";
      var fs = require('fs');
      function checkAge(user) {
        return user.age >= 18;
      }`;
      const files = [new File('AppComponent.vue', vueCode), new File('age.js', jsCode)];
      const sut = createSut();

      const mutants = sut.mutate(files);

      expect(mutants.filter(m => m.mutatorName === 'StringLiteral').length).to.equal(2);
      expect(mutants.filter(m => m.mutatorName === 'Block').length).to.equal(3);
      expect(mutants.filter(m => m.mutatorName === 'BinaryExpression').length).to.equal(3);
    });
  });

  describe('TypeScript project', () => {
    it('should generate mutants', () => {
      TEST_INJECTOR.pluginResolver.resolveAll.returns([typescriptMutatorPlugin]);
      const vueCode = `<template>
      <span id="msg">{{ message }}</span>
      </template>

      <script lang="ts">
      export default {
        data () {
          return {
            message: 'hello!'
          }
        },
        doMath () {
          return 1 - 2;
        }
      }
      </script>

      <msg>
      #app {
      text-align: center;
      }
      </msg>`;
      const jsCode = `import * as fs from 'fs';
      function checkAge(user: { age: number } ): boolean {
        return user.age >= 18;
      }`;
      const files = [new File('AppComponent.vue', vueCode), new File('age.ts', jsCode)];
      const sut = createSut();

      const mutants = sut.mutate(files);

      expect(mutants.filter(m => m.mutatorName === 'StringLiteral').length).to.equal(1);
      expect(mutants.filter(m => m.mutatorName === 'Block').length).to.equal(3);
      expect(mutants.filter(m => m.mutatorName === 'BinaryExpression').length).to.equal(3);
    });
  });
});
