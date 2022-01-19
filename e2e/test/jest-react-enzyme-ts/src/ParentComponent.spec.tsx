import React from 'react';
import { shallow } from 'enzyme';
import ParentComponent from './ParentComponent';

describe('Parent Component', () => {
  it('should render correctly', () => {
    expect(shallow(<ParentComponent />)).toMatchSnapshot();
  })
})
