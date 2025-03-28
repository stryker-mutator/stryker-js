// src/components/Counter.tsx
import { useState } from 'react';

export const Counter = () => {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>
        Count:
        <span data-testId="counter">{count}</span>
      </p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  );
};
