import React from 'react'
import { render } from '@testing-library/react'
import ErrorBoundary from './ErrorBoundary'

import '@testing-library/jest-dom'

test('should be render fallback page Error was thrown', () => {
  const InvalidComponent = () => undefined
  const { getByText } = render(
    <ErrorBoundary>
      <InvalidComponent />
    </ErrorBoundary>
  )
  expect(getByText('Something Error Ooccurring')).toBeInTheDocument()
})
