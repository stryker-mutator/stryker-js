'use strict';

import * as _ from 'lodash';
import fs = require('fs');
import os = require('os');
import path = require('path');
import * as nodeGlob from 'glob';

/**
 * Checks if a file or folder exists.
 * @function
 * @param path - The path to the file or folder.
 * @returns True if the file exists.
 */
export function fileOrFolderExists(path: string): boolean {
  try {
    var stats = fs.lstatSync(path);
    return true;
  } catch (errror) {
    return false;
  }
};

/**
 * Reads a file.
 * @function
 * @param filename - The name of the file.
 * @returns The content of the file.
 */
export function readFile(filename: string) {
  return fs.readFileSync(filename, 'utf8');
};

/**
   * Normalizes the paths of a list of filenames.
   * @param files - The list of filenames which have to be normalized.
   */
export function normalize(files: string[]): void {
  _.forEach(files, function (file, key) {
    files[key] = path.resolve(path.normalize(file));
  });
};

export function glob(expression: string): Promise<string[]> {
  return new Promise<string[]>((resolve, reject) => {

    nodeGlob(expression, (error, matches) => {
      if (error) {
        reject(error);
      } else {
        resolve(matches);
      }
    });

  });
}

/**
 * Wrapper around the 'require' function (for testability)
 */
export function importModule(moduleName: string) {
  require(moduleName);
}