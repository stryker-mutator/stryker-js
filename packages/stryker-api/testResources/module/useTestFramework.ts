import { TestFramework, TestFrameworkFactory, TestFrameworkSettings } from 'stryker-api/test_framework';

class TestFramework1 implements TestFramework {

  constructor(settings: TestFrameworkSettings) {

  }

  beforeEach(codeFragment: string) {
    return '';
  }

  afterEach(codeFragment: string) {
    return '';
  }

  filter(ids: number[]) {
    return ids.toString();
  }
}

TestFrameworkFactory.instance().register('framework-1', TestFramework1);
const testFramework = TestFrameworkFactory.instance().create('framework-1', null);
if (!(testFramework instanceof TestFramework1)) {
  throw Error('Test framework does not seem to be working');
}
console.log(TestFrameworkFactory.instance().knownNames());