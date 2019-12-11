import { TestFramework, TestSelection } from '@stryker-mutator/api/test_framework';

class TestFramework1 implements TestFramework {

  public beforeEach(codeFragment: string) {
    return '';
  }

  public afterEach(codeFragment: string) {
    return '';
  }

  public filter(selections: TestSelection[]) {
    return selections.map(selection => selection.id).toString();
  }
}

console.log('done');
