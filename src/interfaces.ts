type TodoId = string;
type TodoDate = Date;
type Minutes = number;

export interface TodoItem {
  title: string;
  id: TodoId;
  order: number;
  completed?: boolean;
  parent?: TodoItem;
  color?: string;
  start?: TodoDate;
  duration: Minutes;
  active?: boolean;
}

export type TodoFilter = 'all' | 'completed' | 'incompleted'
