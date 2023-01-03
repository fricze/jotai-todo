import type { FormEvent } from 'react'
import { CloseOutlined } from '@ant-design/icons'
import { a, useTransition } from '@react-spring/web'
import { Radio } from 'antd'
import { Provider, atom, useAtom } from 'jotai'
import { useUpdateAtom } from 'jotai/utils'
import type { PrimitiveAtom } from 'jotai'
import { List } from './List'

type TodoItem = {
  title: string;
  completed?: boolean;
}

type TodoFilter = 'all' | 'completed' | 'incompleted'

const filterAtom = atom<TodoFilter>('all')

const todosAtom = atom<PrimitiveAtom<TodoItem>[]>([
  atom({ title: 'hello girls' }),
  atom({ title: 'how are you???' }),
  atom({ title: 'help me plska' }),
])


const filteredAtom = atom<PrimitiveAtom<TodoItem>[]>((get) => {
  const filter = get(filterAtom)
  const todos = get(todosAtom)

  switch (filter) {
    case 'all':
      return todos;
    case 'completed':
      return todos.filter((atom) => get(atom).completed)
    case 'incompleted':
      return todos.filter((atom) => !get(atom).completed)
  }
})

type RemoveFn = (item: PrimitiveAtom<TodoItem>) => void
type TodoItemProps = {
  atom: PrimitiveAtom<TodoItem>;
  remove: RemoveFn;
}

const TodoView = ({ atom, remove }: TodoItemProps) => {
  const [item, setItem] = useAtom(atom)
  const toggleCompleted = () =>
    setItem((props) => ({ ...props, completed: !props.completed }))

  return (
    <>
      <input
        type="checkbox"
        checked={item.completed}
        onChange={toggleCompleted}
      />
      <span style={{ textDecoration: item.completed ? 'line-through' : '' }}>
        {item.title}
      </span>
      <button onClick={(e) => {
        e.preventDefault()
        remove(atom)
      }}>
        <CloseOutlined />
      </button>
    </>
  )
}

const Filter = () => {
  const [filter, set] = useAtom(filterAtom)
  return (
    <Radio.Group onChange={(e) => set(e.target.value)} value={filter}>
      <Radio value="all">All</Radio>
      <Radio value="completed">Completed</Radio>
      <Radio value="incompleted">Incompleted</Radio>
    </Radio.Group>
  )
}

type FilteredType = {
  remove: RemoveFn
}
const Filtered = (props: FilteredType) => {
  const [todos] = useAtom(filteredAtom)

  return <List items={todos} />

  // const transitions = useTransition(todos, {
  //   keys: (todo) => todo.toString(),
  //   from: { opacity: 0, height: 0 },
  //   enter: { opacity: 1, height: 100 },
  //   leave: { opacity: 0, height: 0 },
  // })

  // return transitions((style, atom) => (
  //   <a.div className="item" style={style}>
  //     <TodoView atom={atom} {...props} />
  //   </a.div>
  // ))
}

const TodoList = () => {
  const setTodos = useUpdateAtom(todosAtom)

  const remove: RemoveFn = (todo) =>
    setTodos((prev) => prev.filter((item) => item !== todo))

  const add = (e: FormEvent<HTMLInputElement>) => {
    e.preventDefault()
    const title = e.currentTarget.value
    e.currentTarget.value = ''
    setTodos((prev) => [...prev, atom<TodoItem>({ title, completed: false })])
  }

  return (
    <form>
      <Filter />
      <input name="newTodo" placeholder="Type ..."
        onKeyPress={function handleKeyPress(e) {
          if (e.key == 'Enter') {
            add(e)
          }
        }} />
      <Filtered remove={remove} />
    </form>
  )
}

export default function App() {
  return (
    <Provider>
      <TodoList />
    </Provider>
  )
}
