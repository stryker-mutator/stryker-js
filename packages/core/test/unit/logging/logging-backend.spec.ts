import sinon from 'sinon';
import fs, { WriteStream } from 'fs';
import { LoggingBackend } from '../../../src/logging/logging-backend.js';
import { LoggingEvent } from '../../../src/logging/logging-event.js';
import { LogLevel } from '@stryker-mutator/api/core';
import { Writable } from 'stream';
import { expect } from 'chai';

describe(LoggingBackend.name, () => {
  let sut: LoggingBackend;
  let consoleStream: NodeJS.WritableStream;
  let stdoutStub: sinon.SinonStubbedMember<NodeJS.WritableStream['write']>;
  let createWriteStreamStub: sinon.SinonStubbedMember<
    typeof fs.createWriteStream
  >;
  let logFileStream: Writable;
  let logFileWriteStub: sinon.SinonStubbedMember<Writable['write']>;
  let logFileEndStub: sinon.SinonStubbedMember<Writable['end']>;
  let consoleErrorStub: sinon.SinonStubbedMember<typeof console.error>;

  beforeEach(() => {
    consoleStream = new Writable();
    logFileStream = new Writable();
    sut = new LoggingBackend(consoleStream);
    createWriteStreamStub = sinon.stub(fs, 'createWriteStream');
    logFileWriteStub = sinon.stub(logFileStream, 'write');
    logFileEndStub = sinon.stub(logFileStream, 'end');
    createWriteStreamStub.returns(logFileStream as unknown as WriteStream);
    consoleErrorStub = sinon.stub(console, 'error');
    stdoutStub = sinon.stub(consoleStream, 'write');
  });

  describe(LoggingBackend.prototype.configure.name, () => {
    it('should be able to update properties using "configure"', () => {
      sut.configure({
        allowConsoleColors: false,
        fileLogLevel: LogLevel.Information,
        logLevel: LogLevel.Warning,
      });
      expect(sut.showColors).false;
      expect(sut.activeFileLevel).eq(LogLevel.Information);
      expect(sut.activeStdoutLevel).eq(LogLevel.Warning);
    });
  });

  describe(LoggingBackend.prototype.isEnabled.name, () => {
    it('should return true when the level is enabled for stdout', () => {
      sut.activeStdoutLevel = LogLevel.Information;
      expect(sut.isEnabled(LogLevel.Information)).true;
    });

    it('should return false when the level is not enabled for stdout', () => {
      sut.activeStdoutLevel = LogLevel.Information;
      expect(sut.isEnabled(LogLevel.Debug)).false;
    });

    it('should return false when the level is enabled for file', () => {
      sut.activeFileLevel = LogLevel.Information;
      sut.activeStdoutLevel = LogLevel.Off;
      expect(sut.isEnabled(LogLevel.Debug)).false;
      expect(sut.isEnabled(LogLevel.Information)).true;
    });
  });

  describe(LoggingBackend.prototype.log.name, () => {
    it('should log to stdout in color', () => {
      sut.log(LoggingEvent.create('category', LogLevel.Information, ['foo']));
      sinon.assert.calledWithMatch(stdoutStub, 'foo');
      sinon.assert.calledWithMatch(stdoutStub, '\x1B');
    });

    it('should not log to stdout in color when showColor is disabled', () => {
      sut.showColors = false;
      sut.log(LoggingEvent.create('category', LogLevel.Information, ['foo']));
      sinon.assert.calledWithMatch(stdoutStub, 'foo');
      sinon.assert.neverCalledWithMatch(stdoutStub, '\x1B');
    });

    it('should log info, warn and error to stdout by default', () => {
      sut.log(LoggingEvent.create('category', LogLevel.Information, ['foo']));
      sut.log(LoggingEvent.create('category', LogLevel.Error, ['foo']));
      sut.log(LoggingEvent.create('category', LogLevel.Warning, ['foo']));
      sinon.assert.calledThrice(stdoutStub);
    });

    it('should not log to file by default', () => {
      sut.log(LoggingEvent.create('category', LogLevel.Fatal, ['foo']));
      sinon.assert.notCalled(logFileWriteStub);
    });

    it('should create a log file when needed', () => {
      sut.activeFileLevel = LogLevel.Information;
      sut.log(LoggingEvent.create('category', LogLevel.Information, ['foo']));
      sinon.assert.calledWith(createWriteStreamStub, 'stryker.log', {
        flags: 'a',
      });
    });

    it('should not create a log file when not needed', () => {
      sut.activeFileLevel = LogLevel.Information;
      sut.log(LoggingEvent.create('category', LogLevel.Debug, ['foo']));
      sinon.assert.notCalled(createWriteStreamStub);
    });

    it('should not log debug to stdout by default', () => {
      sut.log(LoggingEvent.create('category', LogLevel.Debug, ['foo']));
      sinon.assert.notCalled(stdoutStub);
    });

    it('should log to file when log level is set', () => {
      sut.activeFileLevel = LogLevel.Information;
      sut.log(LoggingEvent.create('category', LogLevel.Information, ['foo']));
      sinon.assert.calledWithMatch(logFileWriteStub, 'foo');
    });

    it('should log to file without color', () => {
      sut.activeFileLevel = LogLevel.Information;
      sut.log(LoggingEvent.create('category', LogLevel.Information, ['foo']));
      sinon.assert.calledWithMatch(logFileWriteStub, 'foo');
      sinon.assert.neverCalledWithMatch(logFileWriteStub, '\x1B');
    });

    it('should log file errors to stderr', () => {
      // Arrange
      sut.activeFileLevel = LogLevel.Information;
      sut.log(LoggingEvent.create('category', LogLevel.Information, ['foo']));
      const expectedError = new Error('expected');

      // Act
      logFileStream.emit('error', expectedError);

      // Assert
      sinon.assert.called(logFileWriteStub);
      sinon.assert.calledOnceWithExactly(
        consoleErrorStub,
        'An error occurred while writing to "stryker.log"',
        expectedError,
      );
    });

    it('should not write to file when the stream errored', () => {
      sut.activeFileLevel = LogLevel.Information;
      logFileStream.destroy(new Error('expected'));
      sut.log(LoggingEvent.create('category', LogLevel.Information, ['bar']));
      sinon.assert.notCalled(logFileWriteStub);
    });

    it('should end the file stream when dispose is called', async () => {
      sut.activeFileLevel = LogLevel.Information;
      sut.log(LoggingEvent.create('category', LogLevel.Information, ['foo']));
      logFileEndStub.callsArg(0);
      await sut.dispose();
      sinon.assert.called(logFileEndStub);
    });
  });
});
