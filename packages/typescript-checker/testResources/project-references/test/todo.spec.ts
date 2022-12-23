import { TodoList } from '../src/todo.js';

const list = new TodoList();

function addTodo(name = 'test', description = 'test') {
  list.createTodoItem(name, description);
}

addTodo();
