import 'source-map-support/register.js';
import { use } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import sinonChai from 'sinon-chai';
import sinon from 'sinon';

use(sinonChai);
use(chaiAsPromised);

export const mochaHooks = {
  afterEach(): void {
    sinon.restore();
  },
};
