import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'
import Provider from '@laststance/use-app-state'

const initialAppState = {
  todoList: [],
}

it('renders without crashing', () => {
  const div = document.createElement('div')
  ReactDOM.render(
    <Provider initialState={initialAppState}>
      <App path="/" />
    </Provider>,
    div
  )
  ReactDOM.unmountComponentAtNode(div)
})
