import { expect } from 'chai';
import { deserialize, serialize } from 'surrial';

import { File } from '../../../src/core';

describe('File', () => {
  it('should allow utf8 encoded string content in the constructor', () => {
    const actual = new File('foobar.js', 'string-content');
    expect(actual.content).deep.eq(Buffer.from('string-content'));
  });

  it('should allow buffered content in the constructor', () => {
    const actual = new File('foobar.js', Buffer.from('string-content'));
    expect(actual.textContent).deep.eq('string-content');
  });

  it('should be serializable', () => {
    const expected = new File('foo', Buffer.from('bar'));
    const serialized = serialize(expected);
    const actual = deserialize(serialized, [File]);
    expect(actual).deep.eq(expected);
    expect(actual).instanceOf(File);
  });

  /**
   * @see https://github.com/stryker-mutator/stryker/issues/2025
   */
  it('should customize serialization to allow different instances of the class file to be compatible', () => {
    expect(new File('foo', Buffer.from('bar')).surrialize()).eq('new File("foo", Buffer.from("bar", "binary"))');
  });
});
