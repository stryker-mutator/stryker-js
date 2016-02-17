'use strict';

var _ = require('lodash');
var fs = require('fs');
var os = require('os');
var path = require('path');
var TypeUtils = require('./TypeUtils');

/**
 * Utility class for handling temporary files.
 * @constructor
 */
function FileUtils() {
  this._typeUtils = new TypeUtils();
  this._baseTempFolder = os.tmpdir() + path.sep + 'stryker-temp';
}

FileUtils._foldersCreated = 0;

/**
 * Creates the temp directory for Stryker.
 * @function
 */
FileUtils.prototype.createBaseTempFolder = function() {
  this.createDirectory(this._baseTempFolder);
};

/**
 * Removes the temp directory for Stryker and all subsequent files and folders.
 * @function
 */
FileUtils.prototype.removeBaseTempFolder = function() {
  this.removeFolderRecursively(this._baseTempFolder);
};

/**
 * Removes a folder recursively.
 * @function
 * @param {String} dirname - The path to the directory.
 */
FileUtils.prototype.removeFolderRecursively = function(dirname) {
  this._typeUtils.expectParameterString(dirname, 'FileUtils', 'dirname');

  // Source: https://gist.github.com/tkihira/2367067
  var list = fs.readdirSync(dirname);
  for (var i = 0; i < list.length; i++) {
    var filename = path.join(dirname, list[i]);
    var stat = fs.statSync(filename);

    if (filename == "." || filename == "..") {
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
 * Gets the temp directory for Stryker.
 * @function
 */
FileUtils.prototype.getBaseTempFolder = function() {
  return this._baseTempFolder;
};

/**
 * Saves a file in an unique temp folder.
 * @function
 * @param {String} filePath - The path to the orignal file, including the name of the file.
 * @param {String} data - The data which should be placed in the new file.
 * @returns {String} The path to the created file.
 */
FileUtils.prototype.createFileInTempFolder = function(filePath, data) {
  this._typeUtils.expectParameterString(filePath, 'FileUtils', 'filePath');
  this._typeUtils.expectParameterString(data, 'FileUtils', 'data');

  var baseFolderPath = this._baseTempFolder + path.sep + 'temp-' + Date.now() + '-' + FileUtils._foldersCreated;
  this.createDirectory(baseFolderPath);
  var tempFilePath = baseFolderPath + path.sep + path.basename(filePath);
  this.createFile(tempFilePath, data);
  FileUtils._foldersCreated++;
  return tempFilePath;
};

/**
 * Creates a directory.
 * @function
 * @param {String} dirName - The name of the directory which has to be created.
 */
FileUtils.prototype.createDirectory = function(dirName) {
  this._typeUtils.expectParameterString(dirName, 'FileUtils', 'dirName');

  if (!this.fileOrFolderExists(dirName)) {
    fs.mkdirSync(dirName);
  }
};

/**
 * Removes a directory.
 * @function
 * @param {String} dirName - The name of the directory which has to be removed.
 */
FileUtils.prototype.removeDirectory = function(dirName) {
  this._typeUtils.expectParameterString(dirName, 'FileUtils', 'dirName');

  if (this.fileOrFolderExists(dirName)) {
    fs.rmdirSync(dirName);
  }
};

/**
 * Creates a file.
 * @function
 * @param {String} filename - The name of the file which has to be created.
 * @param {String} data - The data which has to be written to the file.
 */
FileUtils.prototype.createFile = function(filename, data) {
  this._typeUtils.expectParameterString(filename, 'FileUtils', 'filename');
  this._typeUtils.expectParameterString(data, 'FileUtils', 'data');

  fs.writeFileSync(filename, data);
};

/**
 * Normalizes the paths of a list of filenames.
 * @function
 * @param {String[]} files - The list of filenames which have to be normalized.
 */
FileUtils.prototype.normalize = function(files) {
  this._typeUtils.expectParameterArray(files, 'FileUtils', 'files');

  _.forEach(files, function(file, key) {
    files[key] = path.resolve(path.normalize(file));
  });
};

/**
 * Removes a file and its temp folder.
 * @function
 * @param {String} tempFilename - The path to the temp file, including the name of the file.
 */
FileUtils.prototype.removeTempFile = function(tempFilename) {
  this._typeUtils.expectParameterString(tempFilename, 'FileUtils', 'tempFilename');

  fs.unlinkSync(tempFilename);
  this.removeDirectory(path.dirname(tempFilename));
};

/**
 * Reads a file.
 * @function
 * @param {String} filename - The name of the file.
 * @returns The content of the file.
 */
FileUtils.prototype.readFile = function(filename) {
  this._typeUtils.expectParameterString(filename, 'FileUtils', 'filename');

  return fs.readFileSync(filename, 'utf8');
};

/**
 * Checks if a file or folder exists.
 * @function
 * @param {String} path - The path to the file or folder.
 * @returns True if the file exists.
 */
FileUtils.prototype.fileOrFolderExists = function(path) {
  this._typeUtils.expectParameterString(path, 'FileUtils', 'path');
  try {
    var stats = fs.lstatSync(path);
    return true;
  } catch (errror) {
    return false;
  }
};



module.exports = FileUtils;
