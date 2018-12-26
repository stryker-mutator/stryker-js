import { TestFramework, TestFrameworkFactory, TestFrameworkSettings, TestSelection } from 'stryker-api/test_framework';

class TestFramework1 implements TestFramework {

  public afterEach(codeFragment: string) {
    return '';
  }

  public beforeEach(codeFragment: string) {
    return '';
  }

  public filter(selections: TestSelection[]) {
    return selections.map(selection => selection.id).toString();
  }
}

TestFrameworkFactory.instance().register('framework-1', TestFramework1);
const testFramework = TestFrameworkFactory.instance().create('framework-1', null);
if (!(testFramework instanceof TestFramework1)) {
  throw Error('Test framework does not seem to be working');
}
console.log(TestFrameworkFactory.instance().knownNames());
