import React from 'react';
import { shallow } from 'enzyme';
import ChildComponent from './ChildComponent';

describe('Child Component', () => {
  it('should render correctly', () => {
    expect(shallow(<ChildComponent text="text" />)).toMatchSnapshot();
  });
});
