import React, { useEffect } from 'react'
import { useAppState } from '@laststance/use-app-state'
import TodoTextInput from './TodoTextInput'
import TodoList from './TodoList'
import Menu from './Menu'
import Copyright from './Copyright'
import { Routes, AppState } from '../index'
import { RouteComponentProps } from '@reach/router'
import { Container } from './style'

export enum LocalStorageKey {
  APP_STATE = 'APP_STATE',
}

interface Props {
  path: Routes
}

const App: React.FC<Props & RouteComponentProps> = ({ path }) => {
  const [appState] = useAppState<AppState>()

  // if appState has changes, save it LocalStorage.
  useEffect((): void => {
    window.localStorage.setItem(
      LocalStorageKey.APP_STATE,
      JSON.stringify(appState) // convert JavaScript Object to string
    )
  }, [appState])

  return (
    <Container>
      <section className="todoapp">
        <TodoTextInput />
        {appState.todoList.length ? (
          <>
            <TodoList path={path} />
            <Menu path={path} />
          </>
        ) : null}
      </section>
      <Copyright />
    </Container>
  )
}

export default App
