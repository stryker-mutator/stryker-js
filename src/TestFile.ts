'use strict';

var FileUtils = require('./utils/FileUtils');
var TypeUtils = require('./utils/TypeUtils');

/**
 * Represents a test file. Upon creation, the test file is saved to the temp folder.
 * If the content parameter is not provided, the TestFile will not be saved to disk.
 * @constructor
 * @param {String} name - The name or path of the test file which may be shown by a reporter.
 * @param {String} [content] - The content of the test file.
 */
function TestFile(name, content) {
  this._typeUtils = new TypeUtils();
  this._typeUtils.expectParameterString(name, 'BaseTestRunner', 'name');
  if (content) {
    this._typeUtils.expectParameterString(content, 'BaseTestRunner', 'content');
    this._content = content;
  }

  this._fileUtils = new FileUtils();
  this._name = name;
  if (content) {
    this._path = this.save();
  } else {
    this._path = name;
  }
}

/**
 * Gets the path to the test file.
 * @function
 * @returns {String} The path to the test file.
 */
TestFile.prototype.getPath = function() {
  return this._path;
};

/**
 * Gets the name of the test file.
 * @function
 * @returns {String} The name of the test file.
 */
TestFile.prototype.getName = function() {
  return this._name;
};

/**
 * Saves the TestFile and returns its path.
 * @function
 * @returns {String} The path to the file.
 */
TestFile.prototype.save = function() {
  return this._fileUtils.createFileInTempFolder(this._name.replace(/ /g, '_') + '.js', this._content);
};

/**
 * Removes the test file from the file system, if it has been saved.
 * @function
 */
TestFile.prototype.remove = function() {
  if (this._content) {
    this._fileUtils.removeTempFile(this._path);
  }
};


module.exports = TestFile;
