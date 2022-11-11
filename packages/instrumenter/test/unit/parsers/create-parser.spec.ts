import { expect } from 'chai';

import { createParser } from '../../../src/parsers/index.js';

describe(createParser.name, () => {
  it('should throw an error if the file extension is not supported', async () => {
    const sut = createParser({ plugins: null });
    await expect(sut('# Readme', 'readme.md')).rejectedWith('Unable to parse readme.md. No parser registered for .md!');
  });
});
