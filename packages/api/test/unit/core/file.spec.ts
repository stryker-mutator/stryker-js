import { expect } from 'chai';

import { File } from '../../../src/core/index.js';

describe('File', () => {
  it('should allow utf8 encoded string content in the constructor', () => {
    const actual = new File('foobar.js', 'string-content');
    expect(actual.content).deep.eq(Buffer.from('string-content'));
  });

  it('should allow buffered content in the constructor', () => {
    const actual = new File('foobar.js', Buffer.from('string-content'));
    expect(actual.textContent).deep.eq('string-content');
  });
});
