export interface ITodo {
  name: string;
  description: string;
  completed: boolean;
}

class Todo implements ITodo {
  constructor(public name: string, public description: string, public completed: boolean) { }
}

export class TodoList {
  public static allTodos: Todo[] = [];
  createTodoItem(name: string, description: string) {
    let newItem = new Todo(name, description, false);
    let totalCount: number = TodoList.allTodos.push(newItem);
    return totalCount;
  }

  allTodoItems(): ITodo[] {
    return TodoList.allTodos;
  }
}

