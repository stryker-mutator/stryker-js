import { expect } from 'chai';
import Echo from './Echo';
import ChildProcessProxy from '../../../src/child-proxy/ChildProcessProxy';

describe('ChildProcessProxy', () => {

  it('should be able to get direct result', async () => {
    const sut = ChildProcessProxy.create(require.resolve('./Echo'), 'info', [], Echo, 'World');
    const actual = await sut.proxy.say('hello');
    expect(actual).eq('World: hello');
    sut.dispose();
  });

  it('should be able to get delayed result', async () => {
    const sut = ChildProcessProxy.create(require.resolve('./Echo'), 'info', [], Echo, 'World');
    const actual = await sut.proxy.sayDelayed('hello', 2);
    expect(actual).eq('World: hello (2 ms)');
    sut.dispose();
  });
});
