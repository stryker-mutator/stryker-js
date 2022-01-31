import { TodoList } from '../src/todo.js';

const list = new TodoList();
const n: number = list.createTodoItem('Mow lawn', 'Mow moving forward.')
console.log(n);

function addTodo(name = 'test', description = 'test') {
  list.createTodoItem(name, description);
}

addTodo();
