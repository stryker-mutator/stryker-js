import { expect } from 'chai';
import { execStryker, ExecStrykerResult } from '../../../helpers';

describe('Options validation', () => {
  let result: ExecStrykerResult;

  describe('Errors in plugin options', () => {


    before(() => {
      result = execStryker('stryker run stryker-error-in-plugin-options.conf.json');
    });

    it('should exit with 1', () => {
      expect(result.exitCode).eq(1);
    });

    it('should report mochaOptions.spec error', () => {
      expect(result.stdout).includes('Config option "mochaOptions.spec" has the wrong type');
    });

    it('should report jasmineConfigFile error', () => {
      expect(result.stdout).includes('Config option "jasmineConfigFile" has the wrong type');
    });

    it('should report karma.projectType error', () => {
      expect(result.stdout).not.includes('Config option "karma.projectType" has the wrong type');
      expect(result.stdout).includes('Config option "karma.projectType" should be one of the allowed values');
    });
  });

  describe('Warnings ', () => {

    before(() => {
      result = execStryker('stryker run stryker-warnings.conf.js');
    });

    it('should exit with 0', () => {
      expect(result.exitCode).eq(0);
    });

    it('should report about unknown options', () => {
      expect(result.stdout).includes('Unknown stryker config option "myCustomReporter"');
    });

    it('should report about unserializable options', () => {
      expect(result.stdout).includes(' Config option "myCustomReporter.filter" is not (fully) serializable. Primitive type "function" has no JSON representation. Any test runner or checker worker processes might not receive this value is intended.');
    });
  });
});
