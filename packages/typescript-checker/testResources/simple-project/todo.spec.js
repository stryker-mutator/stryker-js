"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var todo_1 = require("./todo");
var list = new todo_1.TodoList();
var n = list.createTodoItem('Mow lawn', 'Mow moving forward.');
console.log(n);
function addTodo(name, description) {
    if (name === void 0) { name = 'test'; }
    if (description === void 0) { description = 'test'; }
    list.createTodoItem(name, description);
}
addTodo();
