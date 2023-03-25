import React, { createRef } from 'react'
import { UUID } from '../../functions'
import { Todo, AppState } from '../../index'
import { useAppState } from '@laststance/use-app-state'
import { Container } from './style'

const TodoTextInput: React.FC = () => {
  const [appState, setAppState] = useAppState<AppState>()
  const textInput = createRef<HTMLInputElement>()

  function addTodo(e: React.KeyboardEvent<HTMLInputElement>): void {
    if (textInput.current === null) return
    if (e.key === 'Enter' && textInput.current.value.trim().length > 0) {
      // make new TODO object
      const todo: Todo = {
        id: UUID(),
        bodyText: textInput.current.value,
        completed: false,
      }

      // add new TODO to entire TodoList
      setAppState({ todoList: [todo, ...appState.todoList] })

      // reset text input UI value
      textInput.current.value = ''
    }
  }

  return (
    <Container>
      <header className="header">
        <h1>todos</h1>
        <input
          type="text"
          className="new-todo"
          placeholder="What needs to be done?"
          ref={textInput}
          onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => addTodo(e)}
          autoFocus
          data-cy="new-todo-input-text"
        />
      </header>
    </Container>
  )
}

export default TodoTextInput
