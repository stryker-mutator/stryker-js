import { Counter } from './counter';
import { TodoList } from './todo';

const counter = new Counter(1);
const todoList = new TodoList();
todoList.createTodoItem('test', 'test description');
const newCount: number = counter.increment();
