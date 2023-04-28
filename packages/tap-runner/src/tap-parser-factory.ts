import * as tap from 'tap-parser';

// This is a workaround for stubbing tap-parser in the tests.
// When stubbing TypeError: ES Modules cannot be stubbed
export const TapParser = {
  Parser: (options?: tap.ParserOptions, onComplete?: (results: tap.FinalResults) => any): tap.Parser => new tap.Parser(options, onComplete),
};
