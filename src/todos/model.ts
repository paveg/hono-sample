export interface Todo {
  id: string;
  title: string;
  done: boolean;
}

export interface CreateTodo {
  title: string;
}

export interface UpdateTodo {
  title?: string;
  done?: boolean;
}

export const PREFIX = 'v1:todo:';

export const fetchTodos = async (KV: KVNamespace): Promise<Todo[]> => {
  const list = await KV.list({ prefix: PREFIX });
  const todos: Todo[] = [];

  for (const key of list.keys) {
    const value = await KV.get<Todo>(key.name, 'json');
    if (value) {
      todos.push(value)
    }
  }

  return todos
}

export const fetchTodo = (KV: KVNamespace, id: string): Promise<Todo | null> => {
  return KV.get<Todo>(PREFIX + id, 'json')
}

export const createTodo = async (KV: KVNamespace, param: CreateTodo): Promise<Todo> => {
  const id = crypto.randomUUID()
  const newTodo: Todo = { id, title: param.title, done: false };

  await KV.put(PREFIX + id, JSON.stringify(newTodo), { expirationTtl: 60 * 60 });

  return newTodo
}

export const updateTodo = async (KV: KVNamespace, id: string, param: UpdateTodo): Promise<void> => {
  const todo = await fetchTodo(KV, id);
  if (!todo) {
    return
  }

  const updatedTodo = {
    ...todo,
    ...param
  }

  await KV.put(PREFIX + id, JSON.stringify(updatedTodo), { expirationTtl: 60 * 60 })
}

export const deleteTodo = async (KV: KVNamespace, id: string): Promise<void> => {
  return KV.delete(PREFIX + id)
}
