import HtmlReporter from '../../src/HtmlReporter';
import * as fs from 'fs';
import * as path from 'path';
import {expect} from 'chai';
import * as _ from 'lodash';

const EVENTS_DIR = 'testResources/strykerEvents';
const REPORT_DIR = 'reports/stryker';

describe('Html report of stryker', () => {
  let sut: any;

  let replayAll = (eventPromisses: Promise<{ name: string, content: any }>[]) => {
    return Promise.all(eventPromisses).then(events => {
      events.forEach(event => {
        if (sut[event.name]) {
          sut[event.name](event.content);
        }
      })
    });
  };

  describe('when replaying the events', () => {
    beforeEach(() => {
      sut = new HtmlReporter({ htmlReporter: { baseDir: REPORT_DIR } });
      let events = readAllEvents();
      return replayAll(events);
    });

    describe('wrapUp()', () => {

      beforeEach(() => sut.wrapUp());

      it('should build all files in the report', () => {
        expect(JSON.stringify(readDirectoryTree())).to.be.deep.eq({"name":"stryker","directories":[{"name":"bootstrap","directories":[{"name":"css","directories":[],"files":["bootstrap-theme.css","bootstrap-theme.min.css","bootstrap.css","bootstrap.min.css"]},{"name":"js","directories":[],"files":["bootstrap.js","bootstrap.min.js","npm.js"]}],"files":[]},{"name":"highlightjs","directories":[{"name":"styles","directories":[],"files":["default.css"]}],"files":[]},{"name":"isolated-runner","directories":[],"files":["IsolatedTestRunnerAdapter.js.html","IsolatedTestRunnerAdapterFactory.js.html","IsolatedTestRunnerAdapterWorker.js.html","Message.js.html","ResultMessageBody.js.html","RunMessageBody.js.html","StartMessageBody.js.html","index.html"]},{"name":"jasmine_test_selector","directories":[],"files":["JasmineTestSelector.js.html","index.html"]},{"name":"mutators","directories":[],"files":["BlockStatementMutator.js.html","ConditionalBoundaryMutator.js.html","MathMutator.js.html","OperatorMutator.js.html","OperatorMutatorMap.js.html","RemoveConditionalsMutator.js.html","ReverseConditionalMutator.js.html","UnaryOperatorMutator.js.html","index.html"]},{"name":"reporters","directories":[],"files":["BroadcastReporter.js.html","ClearTextReporter.js.html","EventReporter.js.html","ProgressReporter.js.html","index.html"]},{"name":"utils","directories":[],"files":["StrykerTempFolder.js.html","fileUtils.js.html","index.html","objectUtils.js.html","parserUtils.js.html"]}],"files":["ConfigReader.js.html","InputFileResolver.js.html","Mutant.js.html","MutantRunResultMatcher.js.html","MutatorOrchestrator.js.html","PluginLoader.js.html","ReporterOrchestrator.js.html","Stryker.js.html","TestRunnerOrchestrator.js.html","TestSelectorOrchestrator.js.html","index.html","stryker-80x80.png","stryker.css","stryker.js"]});
      });
    });
  });
});

interface Directory {
  name: string;
  files: string[];
  directories: Directory[];
}

let readDirectoryTree = (current = REPORT_DIR): Directory => {
  let dir: Directory = {
    name: path.basename(current),
    directories: [],
    files: []
  }
  let fileNames = fs.readdirSync(current);
  fileNames
    .sort()
    .map(filename => path.join(current, filename))
    .map(path => ({ path, stats: fs.statSync(path) }))
    .forEach(file => {
      if (file.stats.isDirectory()) {
        dir.directories.push(readDirectoryTree(file.path));
      } else {
        dir.files.push(path.basename(file.path));
      }
    });
  return dir;
}


let readFile = (filename: string) => {
  return new Promise<string>((resolve, reject) => {
    fs.readFile(filename, { encoding: 'utf8' }, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    })
  });
}

let retrieveEventName = (filename: string) => {
  return filename.substring(filename.indexOf('-') + 1, filename.indexOf('.'));
};

let normalizePath = (event: any) => {
  if (event.path) {
    event.path = path.normalize(event.path);
  }
  if (event.sourceFilePath) {
    event.sourceFilePath = path.normalize(event.sourceFilePath);
  }
  return event;
};

let eventContent = (fileContent: any) => {
  let event = JSON.parse(fileContent);
  if (_.isArray(event)) {
    event.forEach((item: any) => normalizePath(item));
  } else {
    normalizePath(event);
  }
  return event;
}

let readAllEvents = () => {
  let files = fs.readdirSync(EVENTS_DIR).sort();
  let allEvents: Promise<{ name: string, content: string }>[] = [];
  files.forEach(filename => {
    allEvents.push(readFile(path.join(EVENTS_DIR, filename)).then(fileContent => ({ name: retrieveEventName(filename), content: eventContent(fileContent) })));
  });
  return allEvents;
}
