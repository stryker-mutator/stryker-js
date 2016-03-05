'use strict';

import FileUtils from './utils/FileUtils';

/**
 * Represents a test file. Upon creation, the test file is saved to the temp folder.
 * If the content parameter is not provided, the TestFile will not be saved to disk.
 */
export default class TestFile {

  private fileUtils = new FileUtils();
  public path: string;
  
  /**
   * @constructor
   * @param name - The name or path of the test file which may be shown by a reporter.
   * @param content - The content of the test file.
   */
  constructor(public name: string, private content?: string) {
    if (content) {
      this.path = this.save();
    } else {
      this.path = name;
    }
  }

  /**
   * Saves the TestFile and returns its path.
   * @function
   * @returns {String} The path to the file.
   */
  save() {
    return this.fileUtils.createFileInTempFolder(this.name.replace(/ /g, '_') + '.js', this.content);
  };

  /**
   * Removes the test file from the file system, if it has been saved.
   * @function
   */
  remove() {
    if (this.content) {
      this.fileUtils.removeTempFile(this.path);
    }
  };
}
