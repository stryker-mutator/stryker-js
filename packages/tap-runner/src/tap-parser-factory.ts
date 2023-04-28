import * as tap from 'tap-parser';

export const TapParser = {
  Parser: (options?: tap.ParserOptions, onComplete?: (results: tap.FinalResults) => any): tap.Parser => new tap.Parser(options, onComplete),
};
