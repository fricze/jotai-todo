import { Provider, atom, useAtom } from 'jotai'
import type { PrimitiveAtom } from 'jotai'
import { TodoItem, TodoFilter } from './interfaces'
import { splitAtom } from 'jotai/utils'

export const draggedAtom = atom<number>(-1)

export const filterAtom = atom<TodoFilter>('all')

export const todosAtom = atom<TodoItem[]>(new Array(4)
  .fill(0)
  .map((_, idx) => ({
    title: `event ${idx}`,
    id: crypto.randomUUID(),
    color: "#" + ((1 << 24) * Math.random() | 0).toString(16).padStart(6, "0"),
    order: idx,
    duration: 30,
  })))

export const splitTodos = splitAtom(todosAtom)

export const filteredAtom = atom<TodoItem[]>((get) => {
  const filter = get(filterAtom)
  const todos = get(todosAtom)

  switch (filter) {
    case 'all':
      return todos;
    case 'completed':
      return todos.filter((item) => (item).completed)
    case 'incompleted':
      return todos.filter((item) => (item).completed)
  }
})
