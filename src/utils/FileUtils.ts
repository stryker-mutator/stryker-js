'use strict';

import * as _ from 'lodash';
import fs = require('fs');
import os = require('os');
import path = require('path');

/**
 * Utility class for handling temporary files.
 */
export default class FileUtils {
  private _baseTempFolder = os.tmpdir() + path.sep + 'stryker-temp';
  private static foldersCreated = 0;
  
  get baseTempFolder(): string {
    return this._baseTempFolder;
  };

  /**
   * Creates the temp directory for Stryker.
   */
  public createBaseTempFolder() : void {
    this.createDirectory(this._baseTempFolder);
  };

  /**
   * Removes the temp directory for Stryker and all subsequent files and folders.
   */
  public removeBaseTempFolder() : void {
    this.removeFolderRecursively(this._baseTempFolder);
  };

  /**
   * Removes a folder recursively.
   * @param dirname - The path to the directory.
   */
  public removeFolderRecursively (dirname: string): void {
    // Source: https://gist.github.com/tkihira/2367067
    var list = fs.readdirSync(dirname);
    for (var i = 0; i < list.length; i++) {
      var filename = path.join(dirname, list[i]);
      var stat = fs.statSync(filename);

      if (filename === "." || filename === "..") {
        // pass these files
      } else if (stat.isDirectory()) {
        // rmdir recursively
        this.removeFolderRecursively(filename);
      } else {
        // rm filename
        fs.unlinkSync(filename);
      }
    }
    this.removeDirectory(dirname);
  };

  /**
   * Saves a file in an unique temp folder.
   * @param filePath - The path to the orignal file, including the name of the file.
   * @param data - The data which should be placed in the new file.
   * @returns The path to the created file.
   */
  createFileInTempFolder (filePath: string, data: string) : string {
    var baseFolderPath = this._baseTempFolder + path.sep + 'temp-' + Date.now() + '-' + FileUtils.foldersCreated;
    this.createDirectory(baseFolderPath);
    var tempFilePath = baseFolderPath + path.sep + path.basename(filePath);
    this.createFile(tempFilePath, data);
    FileUtils.foldersCreated++;
    return tempFilePath;
  };

  /**
   * Creates a directory.
   * @param dirName - The name of the directory which has to be created.
   */
  createDirectory (dirName: string): void {
    if (!this.fileOrFolderExists(dirName)) {
      fs.mkdirSync(dirName);
    }
  };

  /**
   * Removes a directory.
   * @param dirName - The name of the directory which has to be removed.
   */
  removeDirectory (dirName: string): void {
    if (this.fileOrFolderExists(dirName)) {
      fs.rmdirSync(dirName);
    }
  };

  /**
   * Creates a file.
   * @param filename - The name of the file which has to be created.
   * @param data - The data which has to be written to the file.
   */
  createFile (filename: string, data: string): void {
    fs.writeFileSync(filename, data);
  };

  /**
   * Normalizes the paths of a list of filenames.
   * @param files - The list of filenames which have to be normalized.
   */
  normalize (files: string[]): void {
    _.forEach(files, function(file, key) {
      files[key] = path.resolve(path.normalize(file));
    });
  };

  /**
   * Removes a file and its temp folder.
   * @function
   * @param tempFilename - The path to the temp file, including the name of the file.
   */
  removeTempFile (tempFilename: string): void {
    fs.unlinkSync(tempFilename);
    this.removeDirectory(path.dirname(tempFilename));
  };

  /**
   * Reads a file.
   * @function
   * @param filename - The name of the file.
   * @returns The content of the file.
   */
  readFile (filename: string) {
    return fs.readFileSync(filename, 'utf8');
  };

  /**
   * Checks if a file or folder exists.
   * @function
   * @param path - The path to the file or folder.
   * @returns True if the file exists.
   */
  fileOrFolderExists (path: string): boolean {
    try {
      var stats = fs.lstatSync(path);
      return true;
    } catch (errror) {
      return false;
    }
  };
}