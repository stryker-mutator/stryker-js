import { expect } from 'chai';
import sinon from 'sinon';

import {
  loadTypescriptNative,
  nativeModuleLoader,
} from '../../../src/ts-native/load-typescript-native.js';

describe(loadTypescriptNative.name, () => {
  let importModuleStub: sinon.SinonStub;

  beforeEach(() => {
    importModuleStub = sinon.stub(nativeModuleLoader, 'importModule');
    importModuleStub.callThrough();
  });

  it('should load TypeScript 7 installed under the "@typescript/native" alias', async () => {
    const actual = await loadTypescriptNative();

    expect(actual.API).a('function');
    expect(importModuleStub).calledOnceWith('@typescript/native/unstable/sync');
  });

  it('should explain how to install the "@typescript/native" alias when it cannot be loaded', async () => {
    const importError = new Error('Cannot find package');
    importModuleStub.rejects(importError);

    const error = await loadTypescriptNative().catch((err: unknown) => err);

    expect(error).instanceOf(Error);
    const { message, cause } = error as Error;
    expect(message).contains('"@typescript/native/unstable/sync"');
    expect(message).contains(
      'npm install --save-dev @typescript/native@npm:typescript@latest',
    );
    expect(cause).eq(importError);
  });
});
