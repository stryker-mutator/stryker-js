import os from 'os';

import { MutantStatus } from '@stryker-mutator/api/report';
import { factory } from '@stryker-mutator/test-helpers';
import { expect } from 'chai';
import sinon from 'sinon';
import chalk from 'chalk';

import { DotsReporter } from '../../../src/reporters/dots-reporter';

describe(DotsReporter.name, () => {
  let sut: DotsReporter;
  let sandbox: sinon.SinonSandbox;

  beforeEach(() => {
    sut = new DotsReporter();
    sandbox = sinon.createSandbox();
    sinon.stub(process.stdout, 'write');
  });

  describe('onMutantTested()', () => {
    it('should log "." when status is Killed', () => {
      sut.onMutantTested(factory.killedMutantResult());
      expect(process.stdout.write).to.have.been.calledWith('.');
    });

    it('should log "T" when status is TimedOut', () => {
      sut.onMutantTested(factory.timeoutMutantResult());
      expect(process.stdout.write).to.have.been.calledWith(chalk.yellow('T'));
    });

    it('should log "S" when status is Survived', () => {
      sut.onMutantTested(factory.undetectedMutantResult({ status: MutantStatus.Survived }));
      expect(process.stdout.write).to.have.been.calledWith(chalk.bold.red('S'));
    });
  });

  describe('onAllMutantsTested()', () => {
    it('should write a new line', () => {
      sut.onAllMutantsTested();
      expect(process.stdout.write).to.have.been.calledWith(os.EOL);
    });
  });

  afterEach(() => {
    sandbox.restore();
  });
});
