import JestConfigEditor from '../../src/JestConfigEditor';
import { Config } from 'stryker-api/config';
import { expect } from 'chai';
import * as sinon from 'sinon';
import * as path from 'path';

describe('Integration test for Jest ConfigEditor', () => {
  let jestConfigEditor: JestConfigEditor;
  let getProjectRootStub: sinon.SinonStub;

  const projectRoot: string = process.cwd();
  let config: Config;

  beforeEach(() => {
    getProjectRootStub = sinon.stub(process, 'cwd');
    getProjectRootStub.returns(projectRoot);

    jestConfigEditor = new JestConfigEditor();

    config = new Config();
  });

  it('should create a Jest configuration for a React project', () => {
    config.set({ jest: { projectType: 'react' } });

    jestConfigEditor.edit(config);

    const expectedResult = {
      bail: false,
      collectCoverage: false,
      collectCoverageFrom: [
        'src/**/*.{js,jsx,mjs}'
      ],
      moduleFileExtensions: [
        'web.js',
        'js',
        'json',
        'web.jsx',
        'jsx',
        'node',
        'mjs'
      ],
      moduleNameMapper: {
        '^react-native$': 'react-native-web'
      },
      rootDir: projectRoot,
      setupFiles: [path.join(projectRoot, 'node_modules', 'react-scripts', 'config', 'polyfills.js')],
      setupTestFrameworkScriptFile: undefined,
      testEnvironment: 'jsdom',
      testMatch: [
        '<rootDir>/src/**/__tests__/**/*.{js,jsx,mjs}',
        '<rootDir>/src/**/?(*.)(spec|test).{js,jsx,mjs}'
      ],
      testResultsProcessor: undefined,
      testURL: 'http://localhost',
      transform: {
        '^(?!.*\\.(js|jsx|mjs|css|json)$)': path.join(projectRoot, 'node_modules', 'react-scripts', 'config', 'jest', 'fileTransform.js'),
        '^.+\\.(js|jsx|mjs)$': path.join(projectRoot, 'node_modules', 'react-scripts', 'config', 'jest', 'babelTransform.js'),
        '^.+\\\.css$': path.join(projectRoot, 'node_modules', 'react-scripts', 'config', 'jest', 'cssTransform.js'),
      },
      transformIgnorePatterns: [
        '[/\\\\]node_modules[/\\\\].+\\.(js|jsx|mjs)$'
      ],
      verbose: false
    };

    assertJestConfig(expectedResult, config.jest.config);
  });

  it('should create a Jest configuration for a React + TypeScript project', () => {
    config.set({ jest: { projectType: 'react-ts' } });

    jestConfigEditor.edit(config);

    const expectedResult = {
      bail: false,
      collectCoverage: false,
      collectCoverageFrom: [
        'src/**/*.{js,jsx,ts,tsx}'
      ],
      globals: {
        'ts-jest': {
          tsConfigFile: path.join(projectRoot, 'testResources', 'reactTsProject', 'tsconfig.test.json'),
        },
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
      moduleNameMapper: {
        '^react-native$': 'react-native-web'
      },
      rootDir: projectRoot,
      setupFiles: [path.join(projectRoot, 'node_modules', 'react-scripts-ts', 'config', 'polyfills.js')],
      setupTestFrameworkScriptFile: undefined,
      testEnvironment: 'jsdom',
      testMatch: [
        '<rootDir>/src/**/__tests__/**/*.(j|t)s?(x)',
        '<rootDir>/src/**/?(*.)(spec|test).(j|t)s?(x)'
      ],
      testResultsProcessor: undefined,
      testURL: 'http://localhost',
      transform: {
        '^(?!.*\\.(js|jsx|mjs|css|json)$)': path.join(projectRoot, 'node_modules', 'react-scripts-ts', 'config', 'jest', 'fileTransform.js'),
        '^.+\\.(js|jsx|mjs)$': path.join(projectRoot, 'node_modules', 'react-scripts-ts', 'config', 'jest', 'babelTransform.js'),
        '^.+\\\.css$': path.join(projectRoot, 'node_modules', 'react-scripts-ts', 'config', 'jest', 'cssTransform.js'),
        '^.+\\.tsx?$': path.join(projectRoot, 'node_modules', 'react-scripts-ts', 'config', 'jest', 'typescriptTransform.js'),
      },
      transformIgnorePatterns: [
        '[/\\\\]node_modules[/\\\\].+\\.(js|jsx|mjs|ts|tsx)$'
      ],
      verbose: false
    };

    assertJestConfig(expectedResult, config.jest.config);
  });

  it('should load the Jest configuration from the jest.config.js', () => {
    getProjectRootStub.returns(path.join(process.cwd(), 'testResources', 'exampleProjectWithExplicitJestConfig'));

    jestConfigEditor.edit(config);

    expect(config.jest.projectType).to.equal('custom');
    expect(config.jest.config).to.deep.equal({
      bail: false,
      collectCoverage: false,
      moduleFileExtensions: ['js', 'json', 'jsx', 'node'],
      testEnvironment: 'jest-environment-jsdom',
      testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.jsx?$',
      testResultsProcessor: undefined,
      testRunner: 'jest-jasmine2',
      testURL: 'http://localhost',
      verbose: false
    });
  });

  it('should load the Jest configuration from the package.json', () => {
    getProjectRootStub.returns(path.join(process.cwd(), 'testResources', 'exampleProject'));

    jestConfigEditor.edit(config);

    expect(config.jest.projectType).to.equal('custom');
    expect(config.jest.config).to.deep.equal({
      bail: false,
      collectCoverage: false,
      moduleFileExtensions: ['js', 'json', 'jsx', 'node'],
      testEnvironment: 'jest-environment-jsdom',
      testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.jsx?$',
      testResultsProcessor: undefined,
      testRunner: 'jest-jasmine2',
      testURL: 'http://localhost',
      verbose: false
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

  it('should return with an error when an invalid projectType is specified', () => {
    const projectType = 'invalidProject';
    config.set({ jest: { projectType } });

    expect(() => jestConfigEditor.edit(config)).to.throw(Error, `No configLoader available for ${projectType}`);
  });

  function assertJestConfig(expected: any, actual: any) {
    Object.keys(expected).forEach(key => {
      if (Array.isArray(expected[key])) {
        expected[key].sort();
        actual[key].sort();
      }
      expect(actual[key]).deep.eq(expected[key]);
    });
  }
});
