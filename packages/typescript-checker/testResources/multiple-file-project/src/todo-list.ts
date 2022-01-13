import { Item } from "./item";
import { ITodo, Todo } from "./todo";

export class TodoList {
  public static allTodos: Todo[] = [];
  public item: Item = new Item('itemname');
  createTodoItem(name: string, description: string) {
    let newItem = new Todo(name, description, false);
    let totalCount: number = TodoList.allTodos.push(newItem);
    return totalCount;
  }

  allTodoItems(): ITodo[] {
    return TodoList.allTodos;
  }
}
