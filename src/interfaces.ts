export type TodoItem = {
  title: string;
  id: string;
  completed?: boolean;
}

export type TodoFilter = 'all' | 'completed' | 'incompleted'
