import type { FormEvent } from 'react'
import { CloseOutlined } from '@ant-design/icons'
import { a, useTransition } from '@react-spring/web'
import { Radio } from 'antd'
import { Provider, atom, useAtom } from 'jotai'
import { useUpdateAtom } from 'jotai/utils'
import type { PrimitiveAtom } from 'jotai'
import { List } from './List'
import { TodoItem, TodoFilter } from './interfaces'
import { activeAtom } from './model'
import { filterAtom, todosAtom, filteredAtom, draggedAtom } from './atoms'

type RemoveFn = (item: TodoItem) => void

/* type TodoItemProps = {
*     atom: PrimitiveAtom<TodoItem>;
*     remove: RemoveFn;
* }
* 
* const TodoView = ({ atom, remove }: TodoItemProps) => {
*     const [item, setItem] = useAtom(atom)
*     const toggleCompleted = () =>
*         setItem((props) => ({ ...props, completed: !props.completed }))
* 
*     return (
*         <>
*             <input
*                 type="checkbox"
*                 checked={item.completed}
*                 onChange={toggleCompleted}
*             />
*             <span style={{ textDecoration: item.completed ? 'line-through' : '' }}>
*                 {item.title}
*             </span>
*             <button onClick={(e) => {
*                 e.preventDefault()
*                 remove(atom)
*             }}>
*                 <CloseOutlined />
*             </button>
*         </>
*     )
* } */

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

const Legend = () => {
    const [todos, setTodos] = useAtom(todosAtom)
    const [active] = useAtom(draggedAtom)

    return <div className="legend">
        {[7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18].map(
            (hour, idx) => <div className="hour-row"
                onDragEnter={() =>
                    setTodos(todos => {
                        todos[active].order = idx;

                        return [...todos]
                    })
                }
            >{hour > 12 ? `${hour - 12} PM` : `${hour} AM`}</div>
        )}
    </div >
}

const Filtered = (props: FilteredType) => {
    const [todos] = useAtom(filteredAtom)

    return <div
        style={{ display: 'flex', flexDirection: 'row', position: 'relative' }}>
        <Legend />
        <List />
    </div>

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
    const [active, setActive] = useAtom(activeAtom)

    const [todos, setTodos] = useAtom(todosAtom)

    const remove: RemoveFn = (todo: TodoItem) =>
        setTodos((prev) => prev.filter((item) => item.id !== todo.id))

    const add = (e: FormEvent<HTMLInputElement>) => {
        e.preventDefault()
        const title = e.currentTarget.value
        e.currentTarget.value = ''

        const newTodo: TodoItem = {
            title, completed: false, id: crypto.randomUUID(),
            ...active ? { parent: active } : {},
            color: "#" + ((1 << 24) * Math.random() | 0).toString(16).padStart(6, "0"),
            duration: 30,
            order: todos.length
        };

        setTodos((prev) => [...prev, newTodo])
    }

    return (
        <form>
            {active ? <div>{active.title}</div> : <div />}

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
