import { expect } from 'chai';

import { IdGenerator } from '../../../src/child-proxy/id-generator.js';

describe(IdGenerator.name, () => {
  let idGenerator: IdGenerator;
  beforeEach(() => {
    idGenerator = new IdGenerator();
  });
  it('should return 0 on first call to `next`', () => {
    const workerId = idGenerator.next();
    expect(workerId).eq(0);
  });
  it('should increment `workerId` on calling `next`', () => {
    const workerId = idGenerator.next();
    const nextWorkerId = idGenerator.next();
    expect(nextWorkerId - workerId).eq(1);
  });
});
