const foo = 'bar';
import { readFileSync } from 'fs';

export default function () {
  if (foo === 'bar') {
    const buf = readFileSync('input.docx');
    return buf;
  }
  return 'baz';
}
