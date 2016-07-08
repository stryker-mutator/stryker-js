import HtmlReporter from '../../src/HtmlReporter';
import * as fs from 'fs';
import * as path from 'path';
import {expect} from 'chai';

const EVENTS_DIR = 'testResources/strykerEvents';
const REPORT_DIR = 'reports/stryker';

describe('Html report of stryker', () => {
  let sut: any;

  let replayAll = (eventPromisses: Promise<{ name: string, content: string }>[]) => {
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

      it('should work', () => {
        expect(readDirectoryTree()).to.be.deep.eq({"name":"stryker","directories":[{"name":"bootstrap","directories":[{"name":"css","directories":[],"files":["bootstrap-theme.css","bootstrap-theme.min.css","bootstrap.css","bootstrap.min.css"]},{"name":"js","directories":[],"files":["bootstrap.js","bootstrap.min.js","npm.js"]}],"files":[]},{"name":"highlightjs","directories":[{"name":"styles","directories":[],"files":["default.css"]}],"files":[]},{"name":"isolated-runner","directories":[],"files":["index.html","IsolatedTestRunnerAdapter.js.html","IsolatedTestRunnerAdapterFactory.js.html","IsolatedTestRunnerAdapterWorker.js.html","Message.js.html","ResultMessageBody.js.html","RunMessageBody.js.html","StartMessageBody.js.html"]},{"name":"jasmine_test_selector","directories":[],"files":["index.html","JasmineTestSelector.js.html"]},{"name":"mutators","directories":[],"files":["BlockStatementMutator.js.html","ConditionalBoundaryMutator.js.html","index.html","MathMutator.js.html","OperatorMutator.js.html","OperatorMutatorMap.js.html","RemoveConditionalsMutator.js.html","ReverseConditionalMutator.js.html","UnaryOperatorMutator.js.html"]},{"name":"reporters","directories":[],"files":["BroadcastReporter.js.html","ClearTextReporter.js.html","EventReporter.js.html","index.html","ProgressReporter.js.html"]},{"name":"utils","directories":[],"files":["fileUtils.js.html","index.html","objectUtils.js.html","parserUtils.js.html","StrykerTempFolder.js.html"]}],"files":["ConfigReader.js.html","index.html","InputFileResolver.js.html","Mutant.js.html","MutantRunResultMatcher.js.html","MutatorOrchestrator.js.html","PluginLoader.js.html","ReporterOrchestrator.js.html","stryker-80x80.png","stryker.css","stryker.js","Stryker.js.html","TestRunnerOrchestrator.js.html","TestSelectorOrchestrator.js.html"]});
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

let readAllEvents = () => {
  let files = fs.readdirSync(EVENTS_DIR).sort();
  let allEvents: Promise<{ name: string, content: string }>[] = [];
  files.forEach(filename => {
    allEvents.push(readFile(path.join(EVENTS_DIR, filename)).then(fileContent => ({ name: retrieveEventName(filename), content: JSON.parse(fileContent) })));
  });
  return allEvents;
}
