import { expect } from 'chai';

import { IdGenerator } from '../../../src/child-proxy/id-generator.js';

describe(IdGenerator.name, () => {
  let idGenerator: IdGenerator;
  beforeEach(() => {
    idGenerator = new IdGenerator();
  });
  it('should increment workerId on calling `next`', async () => {
    const workerId = idGenerator.next();
    const nextWorkerId = idGenerator.next();
    expect(nextWorkerId - workerId).eq(1);
  });
});
