import { expect } from 'chai';
import Echo from './Echo';
import ChildProcessProxy from '../../../src/child-proxy/ChildProcessProxy';
import { File } from 'stryker-api/core';

describe('ChildProcessProxy', () => {

  let sut: ChildProcessProxy<Echo>;

  beforeEach(() => {
    sut = ChildProcessProxy.create(require.resolve('./Echo'), 'info', [], Echo, 'World');
  });

  afterEach(() => {
    sut.dispose();
  });

  it('should be able to get direct result', async () => {
    const actual = await sut.proxy.say('hello');
    expect(actual).eq('World: hello');
  });

  it('should be able to get delayed result', async () => {
    const actual = await sut.proxy.sayDelayed('hello', 2);
    expect(actual).eq('World: hello (2 ms)');
  });

  it('should be able to receive files', async () => {
    const actual: string = await sut.proxy.echoFile(new File('hello.txt', 'hello world from file'));
    expect(actual).eq('hello world from file');
  });

  it('should be able to send files', async () => {
    const actual: File = await sut.proxy.readFile();
    expect(actual.textContent).eq('hello foobar');
    expect(actual.name).eq('foobar.txt');
  });

  it('should be able to receive a promise rejection', () => {
    return expect(sut.proxy.reject('Foobar error')).rejectedWith('Foobar error');
  });
});
