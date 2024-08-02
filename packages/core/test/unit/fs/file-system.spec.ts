import fs from 'fs';

import { expect } from 'chai';

import sinon from 'sinon';

import { Task } from '@stryker-mutator/util';

import { tick } from '@stryker-mutator/test-helpers';

import { FileSystem } from '../../../src/fs/file-system.js';
import { createDirent } from '../../helpers/producers.js';

describe(FileSystem.name, () => {
  let sut: FileSystem;

  beforeEach(() => {
    sut = new FileSystem();
  });

  describe('forward', () => {
    it('should forward "writeFile"', async () => {
      const stub = sinon.stub(fs.promises, 'writeFile');
      await sut.writeFile('file.js', 'data');
      sinon.assert.calledOnceWithExactly(stub, 'file.js', 'data');
    });

    it('should forward "copyFile"', async () => {
      const stub = sinon.stub(fs.promises, 'copyFile');
      await sut.copyFile('file.js', 'other.js');
      sinon.assert.calledOnceWithExactly(stub, 'file.js', 'other.js');
    });

    it('should forward "readFile"', async () => {
      const stub = sinon.stub(fs.promises, 'readFile');
      stub.resolves('some data');
      const actual = await sut.readFile('file.js');
      sinon.assert.calledOnceWithExactly(stub, 'file.js');
      expect(actual).eq('some data');
    });

    it('should forward "mkdir"', async () => {
      const stub = sinon.stub(fs.promises, 'mkdir');
      await sut.mkdir('file.js', 'data');
      sinon.assert.calledOnceWithExactly(stub, 'file.js', 'data');
    });

    it('should forward "readdir"', async () => {
      const stub = sinon.stub(fs.promises, 'readdir');
      const expectedResult = [createDirent()];
      stub.resolves(expectedResult);
      const actualResult = await sut.readdir('bar', { withFileTypes: true });
      sinon.assert.calledOnceWithExactly(stub, 'bar', { withFileTypes: true });
      expect(actualResult).eq(expectedResult);
    });

    it('should forward any errors', async () => {
      const stub = sinon.stub(fs.promises, 'mkdir');
      const expectedError = new Error('Expected error for testing');
      stub.rejects(expectedError);
      await expect(sut.mkdir('file.js', 'data')).rejectedWith(expectedError);
    });

    it('should keep track and resolve the correct promise', async () => {
      // Arrange
      const stub = sinon.stub(fs.promises, 'readFile');
      const task1 = new Task<string>();
      const task2 = new Task<string>();
      stub.onFirstCall().returns(task1.promise).onSecondCall().returns(task2.promise);

      // Act
      const onGoing = sut.readFile('file.js');
      const onGoing2 = sut.readFile('file2.js');
      task2.resolve('result2');
      task1.resolve('result1');

      // Arrange
      expect(await onGoing).eq('result1');
      expect(await onGoing2).eq('result2');
    });

    it('should keep track and reject the correct promise', async () => {
      // Arrange
      const stub = sinon.stub(fs.promises, 'readFile');
      const expectedError = new Error('Expected error for testing');
      const task1 = new Task<string>();
      const task2 = new Task<string>();
      stub.onFirstCall().returns(task1.promise).onSecondCall().returns(task2.promise);

      // Act
      const onGoing = sut.readFile('file.js');
      const onGoing2 = sut.readFile('file2.js');
      task2.reject(expectedError);
      task1.resolve('result1');

      // Arrange
      expect(await onGoing).eq('result1');
      await expect(onGoing2).rejectedWith(expectedError);
    });

    const MAX_CONCURRENT_FILE_IO = 256;
    it(`should buffer a max of ${MAX_CONCURRENT_FILE_IO} parallel actions`, async () => {
      // Arrange
      const stub = sinon.stub(fs.promises, 'readFile');
      const tasks: Array<Task<string>> = [];
      const onGoingActs: Array<Promise<string>> = [];
      for (let i = 0; i <= MAX_CONCURRENT_FILE_IO + 1; i++) {
        const task = new Task<string>();
        tasks.push(task);
        stub.onCall(i).returns(task.promise);

        // Act
        onGoingActs.push(sut.readFile(`file_${i}.js`, 'utf-8'));
      }

      // Assert
      sinon.assert.callCount(stub, MAX_CONCURRENT_FILE_IO);
      tasks[5].resolve('some data');
      await onGoingActs[5];
      await tick(); // scheduled next tick
      sinon.assert.callCount(stub, MAX_CONCURRENT_FILE_IO + 1);
    });
  });

  describe('dispose', () => {
    it('cleanup its own subscription', () => {
      expect(sut['todoSubject'].observed).true;
      sut.dispose();

      expect(sut['todoSubject'].observed).false;
    });
  });
});
