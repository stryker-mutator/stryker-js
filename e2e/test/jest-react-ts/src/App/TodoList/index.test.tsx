import React from 'react'
import { render, fireEvent } from '@testing-library/react'
import Provider from '@laststance/use-app-state'
import '@testing-library/jest-dom'
import TodoList from './index'
import { AppState } from '../../index'

const initialAppState: AppState = {
  todoList: [
    {
      id: 'TsHx9eEN5Y4A',
      bodyText: 'monster',
      completed: false,
    },
    {
      id: 'ba91OwrK0Dt8',
      bodyText: 'boss black',
      completed: false,
    },
    {
      id: 'QwejYipEf5nk',
      bodyText: 'caffe latte',
      completed: false,
    },
  ],
}

test('should be render 3 todo items in initialAppState', () => {
  const { getByTestId, getAllByTestId } = render(
    <Provider initialState={initialAppState}>
      <TodoList path="/" />
    </Provider>
  )

  expect(getByTestId('todo-list')).toBeInTheDocument()
  expect(getByTestId('todo-list').children.length).toBe(3)
  expect(Array.isArray(getAllByTestId('todo-item'))).toBe(true)
  expect(getAllByTestId('todo-item')[0]).toHaveTextContent('monster')
  expect(getAllByTestId('todo-item')[1]).toHaveTextContent('boss black')
  expect(getAllByTestId('todo-item')[2]).toHaveTextContent('caffe latte')
})

test('should be work delete todo button', () => {
  const { getByTestId, getAllByTestId } = render(
    <Provider initialState={initialAppState}>
      <TodoList path="/" />
    </Provider>
  )

  // delete first item
  fireEvent.click(getAllByTestId('delete-todo-btn')[0])
  // assertions
  expect(getByTestId('todo-list').children.length).toBe(2)
  expect(Array.isArray(getAllByTestId('todo-item'))).toBe(true)
  expect(getAllByTestId('todo-item')[0]).toHaveTextContent('boss black')
  expect(getAllByTestId('todo-item')[1]).toHaveTextContent('caffe latte')
})

test('should be work correctly all completed:true|false checkbox toggle button', () => {
  const { getByTestId, getAllByTestId } = render(
    <Provider initialState={initialAppState}>
      <TodoList path="/" />
    </Provider>
  )

  // toggle on
  fireEvent.click(getByTestId('toggle-all-btn'))
  // should be completed all todo items
  expect((getAllByTestId('todo-item-complete-check')[0] as HTMLInputElement).checked).toBe(true) 
  expect((getAllByTestId('todo-item-complete-check')[1] as HTMLInputElement).checked).toBe(true) 
  expect((getAllByTestId('todo-item-complete-check')[2] as HTMLInputElement).checked).toBe(true) 

  // toggle off
  fireEvent.click(getByTestId('toggle-all-btn'))
  // should be not comleted all todo items
  expect((getAllByTestId('todo-item-complete-check')[0] as HTMLInputElement).checked).toBe(false)
  expect((getAllByTestId('todo-item-complete-check')[1] as HTMLInputElement).checked).toBe(false)
  expect((getAllByTestId('todo-item-complete-check')[2] as HTMLInputElement).checked).toBe(false)
})
