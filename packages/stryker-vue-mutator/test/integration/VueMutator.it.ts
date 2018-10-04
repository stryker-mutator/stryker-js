import { expect } from 'chai';
import { Config } from 'stryker-api/config';
import { File } from 'stryker-api/core';
import { MutatorFactory } from 'stryker-api/mutant';
import VueMutator from '../../src/VueMutator';
import '../../src/index';
import 'stryker-javascript-mutator';
import 'stryker-typescript';

describe('VueMutator', () => {
  describe('JavaScript project', () => {
    it('should generate mutants', () => {
      sandbox.stub(MutatorFactory.instance(), 'knownNames').returns(['javascript']);
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
      const sut = new VueMutator(new Config());

      const mutants = sut.mutate(files);

      expect(mutants.filter(m => m.mutatorName === 'StringLiteral').length).to.equal(2);
      expect(mutants.filter(m => m.mutatorName === 'Block').length).to.equal(3);
      expect(mutants.filter(m => m.mutatorName === 'BinaryExpression').length).to.equal(3);
    });
  });

  describe('TypeScript project', () => {
    it('should generate mutants', () => {
      sandbox.stub(MutatorFactory.instance(), 'knownNames').returns(['typescript']);
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
      const sut = new VueMutator(new Config());

      const mutants = sut.mutate(files);

      expect(mutants.filter(m => m.mutatorName === 'StringLiteral').length).to.equal(1);
      expect(mutants.filter(m => m.mutatorName === 'Block').length).to.equal(3);
      expect(mutants.filter(m => m.mutatorName === 'BinaryExpression').length).to.equal(3);
    });
  });
});
