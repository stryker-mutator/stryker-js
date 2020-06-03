"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var todo_1 = require("./todo");
var list = new todo_1.TodoList();
var n = list.createTodoItem('this is valid, right?', 'Mow moving forward.');
console.log(n);
