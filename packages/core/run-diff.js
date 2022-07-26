// @ts-check
import { diffChars } from 'diff';

const old = `
function add(a, b){
  return a + b;
}
`;
const newStr = `
function add(a, b){\r
  return a + b;
}
`;

const diffs = diffChars(old.replace(/\r\n/g, '\n'), newStr.replace(/\r\n/g, '\n'));

console.log(JSON.stringify(diffs, null, 2));
