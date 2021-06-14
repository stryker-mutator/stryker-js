import React from 'react'
import { render, fireEvent } from '@testing-library/react'
import Provider, { useAppState } from '@laststance/use-app-state'
import '@testing-library/jest-dom'
import Item from './index'
import { AppState } from '../../../index'

const initialAppState: AppState = {
  todoList: [
    {
      id: '8btxpD9kDBlo',
      bodyText: 'cut tomato',
      completed: false,
    },
  ],
}

const App = () => {
  const [appState] = useAppState<AppState>()
  if (appState.todoList.length === 0) return null
  return (
    <div>
      <Item todo={appState.todoList[0]} />
    </div>
  )
}

test('should each initialAppstate todo object value is set to Item element', () => {
  const { getByTestId } = render(
    <Provider initialState={initialAppState}>
      <Item todo={initialAppState.todoList[0]} />
    </Provider>
  )

  expect(getByTestId('todo-item')).toBeInTheDocument()

  expect(
    (getByTestId('todo-item-complete-check') as HTMLInputElement).checked
  ).toBe(false)
  expect(getByTestId('todo-body-text')).toHaveTextContent('cut tomato')
  expect((getByTestId('todo-edit-input') as HTMLInputElement).value).toBe(
    'cut tomato'
  )
})

test('should set css classes correctly', () => {
  const { getByTestId } = render(
    <Provider initialState={initialAppState}>
      <App />
    </Provider>
  )

  // when not.completed & not.onEdit, SwitchStyle doesn't show .completed .editting selectors
  expect(getByTestId('todo-item')).not.toHaveClass('completed')
  expect(getByTestId('todo-item')).not.toHaveClass('editing')
})

test('should work todo completed checkbox', () => {
  const { getByTestId } = render(
    <Provider initialState={initialAppState}>
      <App />
    </Provider>
  )

  // click complete checkbox then should appear completed class
  fireEvent.click(getByTestId('todo-item-complete-check'))
  expect(
    (getByTestId('todo-item-complete-check') as HTMLInputElement).checked
  ).toBe(true)
  expect(getByTestId('todo-item')).toHaveClass('completed')

  // should working as toggle
  fireEvent.click(getByTestId('todo-item-complete-check'))
  expect(
    (getByTestId('todo-item-complete-check') as HTMLInputElement).checked
  ).toBe(false)
  expect(getByTestId('todo-item')).not.toHaveClass('completed')
})

test('should work edit mode and toggle show/hide', () => {
  const { getByTestId } = render(
    <Provider initialState={initialAppState}>
      <App />
    </Provider>
  )

  // by default, edit input form is not visible
  expect(getByTestId('todo-edit-input')).not.toBeVisible()
  // double click todo text label, then focus and enable todo text edit code
  fireEvent.doubleClick(getByTestId('todo-body-text'))
  expect(getByTestId('todo-item')).toHaveClass('editing')
  expect(getByTestId('todo-edit-input')).toBeVisible()
  expect(getByTestId('todo-edit-input')).toHaveFocus()
  fireEvent.change(getByTestId('todo-edit-input'), {
    target: { value: 'cut tomato plus' },
  })
  fireEvent.keyPress(getByTestId('todo-edit-input'), {
    key: 'Enter',
    code: 13,
    charCode: 13, // I had issue that doesn't trigger keyPress event relevant charCode. https://github.com/testing-library/react-testing-library/issues/269
  })

  expect(getByTestId('todo-body-text')).toHaveTextContent('cut tomato plus')
  expect(getByTestId('todo-item')).not.toHaveClass('editing')
  expect(getByTestId('todo-edit-input')).not.toBeVisible()
})

test('delete todo item', () => {
  const { getByTestId, queryByTestId } = render(
    <Provider initialState={initialAppState}>
      <App />
    </Provider>
  )

  // click delete button, then todo item is removed
  expect(getByTestId('todo-item')).toBeInTheDocument()
  fireEvent.click(getByTestId('delete-todo-btn'))
  expect(queryByTestId('todo-item')).toBe(null)
})
