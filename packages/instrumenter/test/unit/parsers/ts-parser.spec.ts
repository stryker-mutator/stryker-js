import { expect } from 'chai';

import { TSAst, AstFormat } from '../../../src/syntax';
import { parseTS, parseTsx } from '../../../src/parsers/ts-parser';
import { expectAst, AstExpectation } from '../../helpers/syntax-test-helpers';

describe(parseTS.name, () => {
  it('should be able to parse simple typescript', async () => {
    const expected: Omit<TSAst, 'root'> = {
      format: AstFormat.TS,
      originFileName: 'foo.ts',
      rawContent: 'var foo: string = "bar";',
    };
    const { format, originFileName, root, rawContent } = await parseTS(expected.rawContent, expected.originFileName);
    expect(format).eq(expected.format);
    expect(rawContent).eq(expected.rawContent);
    expect(originFileName).eq(expected.originFileName);
    expectAst(root, (p) => p.isTSTypeAnnotation());
  });

  it('should allow for experimentalDecorators', async () => {
    await arrangeAndAssert("@Component({ selector: 'auto-complete'}) class A {}", (t) => t.isDecorator());
  });

  it('should allow for private fields', async () => {
    await arrangeAndAssert('class A { #foo; get foo() { return this.#foo; }}', (t) => t.isPrivateName() && t.node.id.name === 'foo');
  });

  async function arrangeAndAssert(input: string, expectation: AstExpectation, fileName = 'test.ts') {
    const { root } = await parseTS(input, fileName);
    expectAst(root, expectation);
  }
});

describe(parseTsx.name, () => {
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
    const { root } = await parseTsx(input, fileName);
    expectAst(root, expectation);
  }
});
