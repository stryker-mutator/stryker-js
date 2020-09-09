import { expect } from 'chai';

import { TSAst, AstFormat } from '../../../src/syntax';
import { parse } from '../../../src/parsers/ts-parser';
import { expectAst, AstExpectation } from '../../helpers/syntax-test-helpers';

describe('ts-parser', () => {
  it('should be able to parse simple typescript', async () => {
    const expected: Omit<TSAst, 'root'> = {
      format: AstFormat.TS,
      originFileName: 'foo.ts',
      rawContent: 'var foo: string = "bar";',
    };
    const { format, originFileName, root, rawContent } = await parse(expected.rawContent, expected.originFileName);
    expect(format).eq(expected.format);
    expect(rawContent).eq(expected.rawContent);
    expect(originFileName).eq(expected.originFileName);
    expectAst(root, (p) => p.isTSTypeAnnotation());
  });

  it('should allow for experimentalDecorators', async () => {
    await arrangeAndAssert("@Component({ selector: 'auto-complete'}) class A {}", (t) => t.isDecorator());
  });

  it('should allow jsx if extension is tsx', async () => {
    await arrangeAndAssert(
      `class MyComponent extends React.Component<Props, {}> {
      render() {
        return <span>{this.props.foo}</span>
      }
    }
    
    <MyComponent foo="bar" />; // ok`,
      (t) => t.isJSXElement(),
      'test.tsx'
    );
  });

  async function arrangeAndAssert(input: string, expectation: AstExpectation, fileName = 'test.ts') {
    const { root } = await parse(input, fileName);
    expectAst(root, expectation);
  }
});
