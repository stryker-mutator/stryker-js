import { expect } from 'chai';

import { declareClassPlugin, declareFactoryPlugin } from '../../../src/plugin/Plugins';
import { PluginKind } from '../../../src/plugin/PluginKind';
import { tokens, commonTokens } from '../../../src/plugin/tokens';
import { Logger } from '../../../logging';
import { Mutant } from '../../../mutant';

describe('plugins', () => {
  describe(declareClassPlugin.name, () => {
    it('should declare a class plugin', () => {
      class MyMutator {
        constructor(private readonly log: Logger) {}
        public static inject = tokens(commonTokens.logger);

        public mutate(): readonly Mutant[] {
          this.log.info('');
          return [];
        }
      }
      expect(declareClassPlugin(PluginKind.Mutator, 'mut', MyMutator)).deep.eq({
        injectableClass: MyMutator,
        kind: PluginKind.Mutator,
        name: 'mut'
      });
    });
  });

  describe(declareFactoryPlugin.name, () => {
    it('should declare a factory plugin', () => {
      function myMutator() {
        return {
          mutate(): readonly Mutant[] {
            return [];
          }
        };
      }

      expect(declareFactoryPlugin(PluginKind.Mutator, 'mut', myMutator)).deep.eq({
        factory: myMutator,
        kind: PluginKind.Mutator,
        name: 'mut'
      });
    });
  });
});
