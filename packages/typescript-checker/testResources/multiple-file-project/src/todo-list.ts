import { Item } from "./item";
import { ITodo, Todo } from "./todo";
import { sum } from './test_node_modules/module';

export class TodoList {
  public static allTodos: Todo[] = [];
  public item: Item = new Item('itemname');
  createTodoItem(name: string, description: string) {
    let newItem = new Todo(name, description, false);
    let totalCount: number = TodoList.allTodos.push(newItem);
    const number = sum(1, 2);
    return totalCount;
  }

  allTodoItems(): ITodo[] {
    return TodoList.allTodos;
  }
}
