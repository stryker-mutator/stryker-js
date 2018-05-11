import JestConfigEditor from '../../src/JestConfigEditor';
import { Config } from 'stryker-api/config';
import { expect } from 'chai';
import * as sinon from 'sinon';
import * as path from 'path';

describe('Integration test for Jest ConfigEditor', () => {
  let jestConfigEditor: JestConfigEditor;
  let sandbox: sinon.SinonSandbox;
  let getProjectRootStub: sinon.SinonStub;

  let projectRoot: string = process.cwd();
  let config: Config;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    getProjectRootStub = sandbox.stub(process, 'cwd');
    getProjectRootStub.returns(projectRoot);

    jestConfigEditor = new JestConfigEditor();

    config = new Config;
  });

  afterEach(() => sandbox.restore());

  it('should create a Jest configuration for a React project', () => {
    config.set({ jest: { project: 'react' } });

    jestConfigEditor.edit(config);

    const expectedResult = {
      collectCoverageFrom: [
        'src/**/*.{js,jsx,mjs}'
      ],
      setupFiles: [path.join(projectRoot, 'node_modules', 'react-scripts', 'config', 'polyfills.js')],
      testMatch: [
        '<rootDir>/src/**/__tests__/**/*.{js,jsx,mjs}',
        '<rootDir>/src/**/?(*.)(spec|test).{js,jsx,mjs}'
      ],
      testEnvironment: 'jsdom',
      testURL: 'http://localhost',
      transform: {
        '^.+\\.(js|jsx|mjs)$': path.join(projectRoot, 'node_modules', 'react-scripts', 'config', 'jest', 'babelTransform.js'),
        '^.+\\\.css$': path.join(projectRoot, 'node_modules', 'react-scripts', 'config', 'jest', 'cssTransform.js'),
        '^(?!.*\\.(js|jsx|mjs|css|json)$)': path.join(projectRoot, 'node_modules', 'react-scripts', 'config', 'jest', 'fileTransform.js')
      },
      transformIgnorePatterns: [
        '[/\\\\]node_modules[/\\\\].+\\.(js|jsx|mjs)$'
      ],
      moduleNameMapper: {
        '^react-native$': 'react-native-web'
      },
      moduleFileExtensions: [
        'web.js',
        'js',
        'json',
        'web.jsx',
        'jsx',
        'node',
        'mjs'
      ],
      rootDir: projectRoot,
      setupTestFrameworkScriptFile: undefined,
      testResultsProcessor: undefined,
      collectCoverage: false,
      verbose: false,
      bail: false
    };

    // Parse the json back to an object in order to match
    expect(config.jest.config).to.deep.equal(expectedResult);
  });

  it('should create a Jest configuration for a React + TypeScript project', () => {
    config.set({ jest: { project: 'react-ts' } });

    jestConfigEditor.edit(config);

    const expectedResult = {
      collectCoverageFrom: [
        'src/**/*.{js,jsx,ts,tsx}'
      ],
      globals: {
        'ts-jest': {
          tsConfigFile: path.join(projectRoot, 'testResources', 'reactTsProject', 'tsconfig.test.json'),
        },
      },
      setupFiles: [path.join(projectRoot, 'node_modules', 'react-scripts-ts', 'config', 'polyfills.js')],
      testMatch: [
        '<rootDir>/src/**/__tests__/**/*.(j|t)s?(x)',
        '<rootDir>/src/**/?(*.)(spec|test).(j|t)s?(x)'
      ],
      testEnvironment: 'jsdom',
      testURL: 'http://localhost',
      transform: {
        '^.+\\.(js|jsx|mjs)$': path.join(projectRoot, 'node_modules', 'react-scripts-ts', 'config', 'jest', 'babelTransform.js'),
        '^.+\\\.css$': path.join(projectRoot, 'node_modules', 'react-scripts-ts', 'config', 'jest', 'cssTransform.js'),
        '^(?!.*\\.(js|jsx|mjs|css|json)$)': path.join(projectRoot, 'node_modules', 'react-scripts-ts', 'config', 'jest', 'fileTransform.js'),
        '^.+\\.tsx?$': path.join(projectRoot, 'node_modules', 'react-scripts-ts', 'config', 'jest', 'typescriptTransform.js'),
      },
      transformIgnorePatterns: [
        '[/\\\\]node_modules[/\\\\].+\\.(js|jsx|mjs|ts|tsx)$'
      ],
      moduleNameMapper: {
        '^react-native$': 'react-native-web'
      },
      moduleFileExtensions: [
        'web.ts',
        'ts',
        'web.tsx',
        'tsx',
        'web.js',
        'js',
        'web.jsx',
        'jsx',
        'json',
        'node',
        'mjs'
      ],
      rootDir: projectRoot,
      setupTestFrameworkScriptFile: undefined,
      testResultsProcessor: undefined,
      collectCoverage: false,
      verbose: false,
      bail: false
    };

    // Parse the json back to an object in order to match
    expect(config.jest.config).to.deep.equal(expectedResult);
  });

  it('should load the Jest configuration from the jest.config.js', () => {
    getProjectRootStub.returns(path.join(process.cwd(), 'testResources', 'exampleProjectWithExplicitJestConfig'));

    jestConfigEditor.edit(config);

    expect(config.jest.project).to.equal('default');
    expect(config.jest.config).to.deep.equal({
      moduleFileExtensions: ['js', 'json', 'jsx', 'node'],
      testEnvironment: 'jest-environment-jsdom',
      testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.jsx?$',
      testRunner: 'jest-jasmine2',
      testResultsProcessor: undefined,
      collectCoverage: false,
      verbose: false,
      bail: false
    });
  });

  it('should load the Jest configuration from the package.json', () => {
    getProjectRootStub.returns(path.join(process.cwd(), 'testResources', 'exampleProject'));

    jestConfigEditor.edit(config);

    expect(config.jest.project).to.equal('default');
    expect(config.jest.config).to.deep.equal({
      moduleFileExtensions: ['js', 'json', 'jsx', 'node'],
      testEnvironment: 'jest-environment-jsdom',
      testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.jsx?$',
      testRunner: 'jest-jasmine2',
      testResultsProcessor: undefined,
      collectCoverage: false,
      verbose: false,
      bail: false
    });
  });

  it('should load the default Jest configuration if there is no package.json config or jest.config.js', () => {
    getProjectRootStub.returns(path.join(process.cwd(), 'testResources', 'exampleProjectWithDefaultJestConfig'));

    jestConfigEditor.edit(config);

    expect(config.jest.config).to.deep.equal({
      bail: false,
      collectCoverage: false,
      testResultsProcessor: undefined,
      verbose: false,
    });
  });

  it('should return with an error when an invalid project is specified', () => {
    const project = 'invalidProject';
    config.set({ jest: { project } });

    expect(() => jestConfigEditor.edit(config)).to.throw(Error, `No configLoader available for ${project}`);
  });
});