import * as path from 'path';

import { testInjector, factory } from '@stryker-mutator/test-helpers';
import { expect } from 'chai';
import * as sinon from 'sinon';
import { StrykerOptions } from '@stryker-mutator/api/core';

import JestOptionsEditor from '../../src/JestOptionsEditor';

describe('Integration test for Jest OptionsEditor', () => {
  let jestConfigEditor: JestOptionsEditor;
  let getProjectRootStub: sinon.SinonStub;

  const projectRoot: string = process.cwd();
  let options: StrykerOptions;

  beforeEach(() => {
    getProjectRootStub = sinon.stub(process, 'cwd');
    getProjectRootStub.returns(projectRoot);

    jestConfigEditor = testInjector.injector.injectClass(JestOptionsEditor);

    options = factory.strykerOptions();
  });

  it('should create a Jest configuration for a create-react-app project', () => {
    options.jest = { projectType: 'create-react-app' };

    jestConfigEditor.edit(options);

    const expectedResult = {
      bail: false,
      collectCoverage: false,
      collectCoverageFrom: ['!src/**/*.d.ts', 'src/**/*.{js,jsx,ts,tsx}'],
      moduleFileExtensions: ['js', 'json', 'jsx', 'node', 'ts', 'tsx', 'web.js', 'web.jsx', 'web.ts', 'web.tsx'],
      moduleNameMapper: {
        '^.+\\.module\\.(css|sass|scss)$': 'identity-obj-proxy',
        '^react-native$': 'react-native-web',
      },
      notify: false,
      rootDir: projectRoot,
      setupFiles: [path.join(projectRoot, 'node_modules', 'react-app-polyfill', 'jsdom.js')],
      setupTestFrameworkScriptFile: undefined,
      testEnvironment: 'jsdom',
      testMatch: ['<rootDir>/src/**/__tests__/**/*.{js,jsx,ts,tsx}', '<rootDir>/src/**/*.{spec,test}.{js,jsx,ts,tsx}'],
      testResultsProcessor: undefined,
      transform: {
        '^(?!.*\\.(js|jsx|ts|tsx|css|json)$)': path.join(projectRoot, 'node_modules', 'react-scripts', 'config', 'jest', 'fileTransform.js'),
        '^.+\\.(js|jsx|ts|tsx)$': path.join(projectRoot, 'node_modules', 'react-scripts', 'config', 'jest', 'babelTransform.js'),
        '^.+\\.css$': path.join(projectRoot, 'node_modules', 'react-scripts', 'config', 'jest', 'cssTransform.js'),
      },
      transformIgnorePatterns: ['[/\\\\]node_modules[/\\\\].+\\.(js|jsx|ts|tsx)$', '^.+\\.module\\.(css|sass|scss)$'],
      verbose: false,
    };

    assertJestConfig(expectedResult, options.jest.config);
  });

  it('should create a Jest configuration for a React project', () => {
    options.jest = { projectType: 'react' };

    jestConfigEditor.edit(options);

    const expectedResult = {
      bail: false,
      collectCoverage: false,
      collectCoverageFrom: ['!src/**/*.d.ts', 'src/**/*.{js,jsx,ts,tsx}'],
      moduleFileExtensions: ['js', 'json', 'jsx', 'node', 'ts', 'tsx', 'web.js', 'web.jsx', 'web.ts', 'web.tsx'],
      moduleNameMapper: {
        '^.+\\.module\\.(css|sass|scss)$': 'identity-obj-proxy',
        '^react-native$': 'react-native-web',
      },
      notify: false,
      rootDir: projectRoot,
      setupFiles: [path.join(projectRoot, 'node_modules', 'react-app-polyfill', 'jsdom.js')],
      setupTestFrameworkScriptFile: undefined,
      testEnvironment: 'jsdom',
      testMatch: ['<rootDir>/src/**/__tests__/**/*.{js,jsx,ts,tsx}', '<rootDir>/src/**/*.{spec,test}.{js,jsx,ts,tsx}'],
      testResultsProcessor: undefined,
      transform: {
        '^(?!.*\\.(js|jsx|ts|tsx|css|json)$)': path.join(projectRoot, 'node_modules', 'react-scripts', 'config', 'jest', 'fileTransform.js'),
        '^.+\\.(js|jsx|ts|tsx)$': path.join(projectRoot, 'node_modules', 'react-scripts', 'config', 'jest', 'babelTransform.js'),
        '^.+\\.css$': path.join(projectRoot, 'node_modules', 'react-scripts', 'config', 'jest', 'cssTransform.js'),
      },
      transformIgnorePatterns: ['[/\\\\]node_modules[/\\\\].+\\.(js|jsx|ts|tsx)$', '^.+\\.module\\.(css|sass|scss)$'],
      verbose: false,
    };

    assertJestConfig(expectedResult, options.jest.config);
  });

  it('should log a deprecation warning when projectType is "react"', () => {
    options.jest = { projectType: 'react' };

    jestConfigEditor.edit(options);

    expect(testInjector.logger.warn).calledWith(
      'DEPRECATED: The projectType "react" is deprecated. Use projectType "create-react-app" for react projects created by "create-react-app" or use "custom" for other react projects.'
    );
  });

  it('should create a Jest configuration for a create-react-app + TypeScript project', () => {
    options.jest = { projectType: 'create-react-app-ts' };

    jestConfigEditor.edit(options);

    const expectedResult = {
      bail: false,
      collectCoverage: false,
      collectCoverageFrom: ['!**/*.d.ts', 'src/**/*.{js,jsx,ts,tsx}'],
      globals: {
        'ts-jest': {
          tsConfigFile: path.join(projectRoot, 'testResources', 'reactTsProject', 'tsconfig.test.json'),
        },
      },
      moduleFileExtensions: ['web.ts', 'ts', 'web.tsx', 'tsx', 'web.js', 'js', 'web.jsx', 'jsx', 'json', 'node', 'mjs'],
      moduleNameMapper: {
        '^react-native$': 'react-native-web',
      },
      notify: false,
      rootDir: projectRoot,
      setupFiles: [path.join(projectRoot, 'node_modules', 'react-scripts-ts', 'config', 'polyfills.js')],
      setupTestFrameworkScriptFile: undefined,
      testEnvironment: 'jsdom',
      testMatch: ['<rootDir>/src/**/__tests__/**/*.(j|t)s?(x)', '<rootDir>/src/**/?(*.)(spec|test).(j|t)s?(x)'],
      testResultsProcessor: undefined,
      testURL: 'http://localhost',
      transform: {
        '^(?!.*\\.(js|jsx|mjs|css|json)$)': path.join(projectRoot, 'node_modules', 'react-scripts-ts', 'config', 'jest', 'fileTransform.js'),
        '^.+\\.(js|jsx|mjs)$': path.join(projectRoot, 'node_modules', 'react-scripts-ts', 'config', 'jest', 'babelTransform.js'),
        '^.+\\.css$': path.join(projectRoot, 'node_modules', 'react-scripts-ts', 'config', 'jest', 'cssTransform.js'),
        '^.+\\.tsx?$': path.join(projectRoot, 'node_modules', 'react-scripts-ts', 'config', 'jest', 'typescriptTransform.js'),
      },
      transformIgnorePatterns: ['[/\\\\]node_modules[/\\\\].+\\.(js|jsx|mjs|ts|tsx)$'],
      verbose: false,
    };

    assertJestConfig(expectedResult, options.jest.config);
  });

  it('should create a Jest configuration for a React + TypeScript project', () => {
    options.jest = { projectType: 'react-ts' };

    jestConfigEditor.edit(options);

    const expectedResult = {
      bail: false,
      collectCoverage: false,
      collectCoverageFrom: ['!**/*.d.ts', 'src/**/*.{js,jsx,ts,tsx}'],
      globals: {
        'ts-jest': {
          tsConfigFile: path.join(projectRoot, 'testResources', 'reactTsProject', 'tsconfig.test.json'),
        },
      },
      moduleFileExtensions: ['web.ts', 'ts', 'web.tsx', 'tsx', 'web.js', 'js', 'web.jsx', 'jsx', 'json', 'node', 'mjs'],
      moduleNameMapper: {
        '^react-native$': 'react-native-web',
      },
      notify: false,
      rootDir: projectRoot,
      setupFiles: [path.join(projectRoot, 'node_modules', 'react-scripts-ts', 'config', 'polyfills.js')],
      setupTestFrameworkScriptFile: undefined,
      testEnvironment: 'jsdom',
      testMatch: ['<rootDir>/src/**/__tests__/**/*.(j|t)s?(x)', '<rootDir>/src/**/?(*.)(spec|test).(j|t)s?(x)'],
      testResultsProcessor: undefined,
      testURL: 'http://localhost',
      transform: {
        '^(?!.*\\.(js|jsx|mjs|css|json)$)': path.join(projectRoot, 'node_modules', 'react-scripts-ts', 'config', 'jest', 'fileTransform.js'),
        '^.+\\.(js|jsx|mjs)$': path.join(projectRoot, 'node_modules', 'react-scripts-ts', 'config', 'jest', 'babelTransform.js'),
        '^.+\\.css$': path.join(projectRoot, 'node_modules', 'react-scripts-ts', 'config', 'jest', 'cssTransform.js'),
        '^.+\\.tsx?$': path.join(projectRoot, 'node_modules', 'react-scripts-ts', 'config', 'jest', 'typescriptTransform.js'),
      },
      transformIgnorePatterns: ['[/\\\\]node_modules[/\\\\].+\\.(js|jsx|mjs|ts|tsx)$'],
      verbose: false,
    };

    assertJestConfig(expectedResult, options.jest.config);
  });

  it('should log a deprecation warning when projectType is "react-ts"', () => {
    options.jest = { projectType: 'react-ts' };

    jestConfigEditor.edit(options);

    expect(testInjector.logger.warn).calledWith(
      'DEPRECATED: The projectType "react-ts" is deprecated. Use projectType "create-react-app-ts" for react projects created by "create-react-app" or use "custom" for other react projects.'
    );
  });

  it('should load the Jest configuration from the jest.config.js', () => {
    getProjectRootStub.returns(path.join(process.cwd(), 'testResources', 'exampleProjectWithExplicitJestConfig'));

    jestConfigEditor.edit(options);

    expect(options.jest.projectType).to.equal('custom');
    expect(options.jest.config).to.deep.equal({
      bail: false,
      collectCoverage: false,
      moduleFileExtensions: ['js', 'json', 'jsx', 'node'],
      notify: false,
      testEnvironment: 'jest-environment-jsdom',
      testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.jsx?$',
      testResultsProcessor: undefined,
      testRunner: 'jest-jasmine2',
      testURL: 'http://localhost',
      verbose: false,
    });
  });

  it('should load the Jest configuration from the package.json', () => {
    getProjectRootStub.returns(path.join(process.cwd(), 'testResources', 'exampleProject'));

    jestConfigEditor.edit(options);

    expect(options.jest.projectType).to.equal('custom');
    expect(options.jest.config).to.deep.equal({
      bail: false,
      collectCoverage: false,
      moduleFileExtensions: ['js', 'json', 'jsx', 'node'],
      notify: false,
      testEnvironment: 'jest-environment-jsdom',
      testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.jsx?$',
      testResultsProcessor: undefined,
      testRunner: 'jest-jasmine2',
      testURL: 'http://localhost',
      verbose: false,
    });
  });

  it('should load the default Jest configuration if there is no package.json config or jest.config.js', () => {
    getProjectRootStub.returns(path.join(process.cwd(), 'testResources', 'exampleProjectWithDefaultJestConfig'));

    jestConfigEditor.edit(options);

    expect(options.jest.config).to.deep.equal({
      bail: false,
      collectCoverage: false,
      notify: false,
      testResultsProcessor: undefined,
      verbose: false,
    });
  });

  it('should return with an error when an invalid projectType is specified', () => {
    const projectType = 'invalidProject';
    options.jest = { projectType };

    expect(() => jestConfigEditor.edit(options)).to.throw(Error, `No configLoader available for ${projectType}`);
  });

  function assertJestConfig(expected: any, actual: any) {
    Object.keys(expected).forEach((key) => {
      if (Array.isArray(expected[key])) {
        expected[key].sort();
        actual[key].sort();
      }
      expect(actual[key]).deep.eq(expected[key]);
    });
  }
});
