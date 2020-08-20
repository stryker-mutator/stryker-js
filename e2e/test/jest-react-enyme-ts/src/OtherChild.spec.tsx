import React from 'react';
import { shallow } from 'enzyme';
import { OtherChild } from './OtherChild';

describe('OtherChild Component', () => {
  it('should render correctly', () => {
    expect(shallow(<OtherChild />)).toMatchSnapshot();
  });
});
