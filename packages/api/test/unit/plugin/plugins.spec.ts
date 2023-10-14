import { expect } from 'chai';

import { tokens, commonTokens, PluginKind, declareClassPlugin, declareFactoryPlugin, declareValuePlugin } from '../../../src/plugin/index.js';
import { Logger } from '../../../src/logging/index.js';
import { MutantResult } from '../../../src/core/index.js';

describe('plugins', () => {
  describe(declareClassPlugin.name, () => {
    it('should declare a class plugin', () => {
      class MyReporter {
        constructor(private readonly log: Logger) {}
        public static inject = tokens(commonTokens.logger);

        public onMutantTested(result: MutantResult) {
          this.log.info(JSON.stringify(result));
        }
      }
      expect(declareClassPlugin(PluginKind.Reporter, 'rep', MyReporter)).deep.eq({
        injectableClass: MyReporter,
        kind: PluginKind.Reporter,
        name: 'rep',
      });
    });
  });

  describe(declareFactoryPlugin.name, () => {
    it('should declare a factory plugin', () => {
      function createReporter(log: Logger) {
        return {
          onMutantTested(result: MutantResult) {
            log.info(JSON.stringify(result));
          },
        };
      }
      createReporter.inject = tokens(commonTokens.logger);

      expect(declareFactoryPlugin(PluginKind.Reporter, 'rep', createReporter)).deep.eq({
        factory: createReporter,
        kind: PluginKind.Reporter,
        name: 'rep',
      });
    });
  });
  describe(declareValuePlugin.name, () => {
    it('should declare a value plugin', () => {
      const value = {
        onMutantTested(_: MutantResult) {
          // idle
        },
      };
      expect(declareValuePlugin(PluginKind.Reporter, 'rep', value)).deep.eq({
        kind: PluginKind.Reporter,
        name: 'rep',
        value,
      });
    });
  });
});
