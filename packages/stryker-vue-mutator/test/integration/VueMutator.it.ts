import { expect } from 'chai';
import { File } from 'stryker-api/core';
import { strykerPlugins } from '../../src/index';
import { testInjector } from '@stryker-mutator/test-helpers';
import { PluginKind } from 'stryker-api/plugin';
import { Mutator } from 'stryker-api/mutant';
import { strykerPlugins as javascriptMutatorStrykerPlugins } from 'stryker-javascript-mutator';
import { strykerPlugins as typescriptMutatorStrykerPlugins } from 'stryker-typescript';

const javascriptMutatorPlugin = javascriptMutatorStrykerPlugins.find(plugin => plugin.kind === PluginKind.Mutator);
const typescriptMutatorPlugin = typescriptMutatorStrykerPlugins.find(plugin => plugin.kind === PluginKind.Mutator);

describe('VueMutator', () => {

  function createSut(): Mutator {
    return testInjector.injector
      .injectFunction(strykerPlugins[0].factory);
  }

  describe('JavaScript project', () => {
    it('should generate mutants', () => {
      testInjector.pluginResolver.resolveAll.returns([javascriptMutatorPlugin]);

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
      testInjector.pluginResolver.resolveAll.returns([typescriptMutatorPlugin]);
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
