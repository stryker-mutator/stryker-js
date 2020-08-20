import React from 'react';
import ChildComponent from './ChildComponent';
import { OtherChild } from './OtherChild';

const ParentComponent = () => (
  <div>
    This is a parent component
    <ChildComponent text="Some Text" />
    <OtherChild />
  </div>
);

export default ParentComponent;
