import React from 'react';
import ChildComponent from './ChildComponent';

const ParentComponent = () => <div>
  This is a parent component

  <ChildComponent text="Some Text" />
</div>

export default ParentComponent;
