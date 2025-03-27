export interface Todo {
  id: string;
  title: string;
  description?: string | null;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTodoInput {
  title: string;
  description?: string;
  completed?: boolean;
}

export interface UpdateTodoInput {
  id: string;
  title?: string;
  description?: string;
  completed?: boolean;
}

export interface TodosData {
  todos: Todo[];
}

export interface TodoData {
  todo: Todo;
}

export interface CreateTodoData {
  createTodo: Todo;
}

export interface UpdateTodoData {
  updateTodo: Todo;
}

export interface DeleteTodoData {
  deleteTodo: boolean;
}

export interface CreateTodoVariables {
  createTodoInput: CreateTodoInput;
}

export interface UpdateTodoVariables {
  updateTodoInput: UpdateTodoInput;
}

export interface DeleteTodoVariables {
  id: string;
}

export interface TodoVariables {
  id: string;
} 