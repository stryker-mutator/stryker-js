import { TestRunnerFactory } from 'stryker-api/test_runner';
import { TestFrameworkFactory } from 'stryker-api/test_framework';
import { ConfigWriterFactory } from 'stryker-api/config';
import { MutatorFactory } from 'stryker-api/mutant';
import { ReporterFactory } from 'stryker-api/report';
import MyReporter from './MyReporter';
import MyTestRunner from './MyTestRunner';
import MyTestFramework from './MyTestFramework';
import MyMutator from './MyMutator';
import MyConfigWriter from './MyConfigWriter';


// This is the main file loaded when stryker loads this plugin
// Report your plugin to the correct Factory
ReporterFactory.instance().register('my-reporter', MyReporter);
TestRunnerFactory.instance().register('my-test-runner', MyTestRunner);
TestFrameworkFactory.instance().register('my-test-framework', MyTestFramework);
MutatorFactory.instance().register('my-mutator', MyMutator);
ConfigWriterFactory.instance().register('my-config-writer', MyConfigWriter);

// Note: it might not be a good idea to mix all these extensions points into one npm module
// This is just done for demo purposes here.