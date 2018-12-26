import { expect } from 'chai';
import * as typedHtml from 'typed-html';
import Breadcrumb from '../../../src/Breadcrumb';
import { layout } from '../../../src/templates/layout';

function removeNewLines(source: string) {
  return source.replace(/\n|\r/g, '');
}

describe('layout', () => {

  it('should print breadcrumb', () => {
    const actual = layout(Breadcrumb.start.add('title1', 2).add('title2', 1).add('current', 0), 'foobar');
    expect(removeNewLines(actual)).contains(removeNewLines(<ol class='breadcrumb'>
      <li class='breadcrumb-item'><a href='../../../index.html'>All files</a></li>
      <li class='breadcrumb-item'><a href='../index.html'>title1</a></li>
      <li class='breadcrumb-item'><a href='index.html'>title2</a></li>
      <li class='breadcrumb-item active'>current</li>
    </ol>));
  });

});
