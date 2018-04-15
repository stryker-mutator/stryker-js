import * as fs from 'fs';

export function requireModule(name: string): any {
  return require(name);
}

/**
 * Creates an empty file if it did not exist
 * @param fileName the name of the file
 */
export function touchSync(fileName: string) {
  try {
    fs.closeSync(fs.openSync(fileName, 'w'));
  } catch {

  }
}