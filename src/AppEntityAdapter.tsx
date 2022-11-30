import { FormEvent, useState } from 'react'
import { CloseOutlined } from '@ant-design/icons'
import { a, useTransition } from '@react-spring/web'
import { Radio } from 'antd'
import { v4 as uuidv4 } from 'uuid';
import { createSlice, configureStore, createSelector, createEntityAdapter } from '@reduxjs/toolkit'
import {
    Provider,
    useSelector as useReduxSelector,
    TypedUseSelectorHook,
    useDispatch as useReduxDispatch,
} from 'react-redux'

type TodoItem = {
    title: string;
    completed: boolean;
    id: string;
}

type TodoFilter = 'all' | 'completed' | 'incompleted'

type RemoveFn = (item: TodoItem) => void
type TodoItemProps = {
    item: TodoItem;
    remove: RemoveFn;
}

interface TodosState {
    filter: TodoFilter;
    todos: TodoItem[];
}

const initialState: TodosState = {
    filter: 'all',
    todos: [],
}

// auto normalization for the win!
const todoAdapter = createEntityAdapter<TodoItem>({})

const todosSlice = createSlice({
    name: 'todosList',
    initialState: todoAdapter.getInitialState(initialState),
    reducers: {
        setFilter(state, { payload }) {
            state.filter = payload;
        },
        addTodo: todoAdapter.addOne,
        removeTodo: todoAdapter.removeOne,
        toggleCompleted(state, { payload }) {
            todoAdapter.setOne(state, { ...payload, completed: !payload.completed })
        },
    },
})

const { actions } = todosSlice

const store = configureStore({
    reducer: {
        todos: todosSlice.reducer,
    }
})

const adapterSelector = todoAdapter.getSelectors((state: RootState) => state.todos)

type RootState = ReturnType<typeof store.getState>;
const useSelector: TypedUseSelectorHook<RootState> = useReduxSelector;
export const useDispatch = () => useReduxDispatch<typeof store.dispatch>()

const TodoView = ({ item, remove }: TodoItemProps) => {
    const dispatch = useDispatch()

    return (
        <>
            <input
                type="checkbox"
                checked={item.completed}
                onChange={() => dispatch(actions.toggleCompleted(item))}
            />

            <span style={{ textDecoration: item.completed ? 'line-through' : '' }}>
                {item.title}
            </span>

            <CloseOutlined onClick={() => remove(item)} />
        </>
    )
}

const FilterView = () => {
    const dispatch = useDispatch()
    const filter = useSelector(state => state.todos.filter)

    return (
        <Radio.Group onChange={(e) => dispatch(actions.setFilter(e.target.value))} value={filter}>
            <Radio value="all">All</Radio>
            <Radio value="completed">Completed</Radio>
            <Radio value="incompleted">Incompleted</Radio>
        </Radio.Group>
    )
}

type FilteredType = {
    remove: RemoveFn
}
const selectTodos = (state: RootState) => adapterSelector.selectAll(state)
const selectFilter = (state: RootState) => state.todos.filter

const todosSelector = createSelector([selectTodos, selectFilter], (todos, filter) => {
    if (filter === 'all') return todos
    else if (filter === 'completed')
        return todos.filter((item) => item.completed)
    else if (filter === 'incompleted')
        return todos.filter((item) => !item.completed)
    else return todos
})

const Filtered = (props: FilteredType) => {
    const todos = useSelector(todosSelector)

    const transitions = useTransition(todos, {
        keys: (todo) => todo.id,
        from: { opacity: 0, height: 0 },
        enter: { opacity: 1, height: 40 },
        leave: { opacity: 0, height: 0 },
    })

    return transitions((style, item) => (
        <a.div className="item" style={style}>
            <TodoView item={item} {...props} />
        </a.div>
    ))
}

const TodoList = () => {
    const [title, setTitle] = useState('')
    const dispatch = useDispatch()

    const remove: RemoveFn = (todo) => dispatch(actions.removeTodo(todo.id))

    const add = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setTitle('')
        dispatch(actions.addTodo({ title, completed: false, id: uuidv4() }))
    }

    return (
        <form onSubmit={add}>
            <FilterView />

            <input name="inputTitle"
                placeholder="Type ..."
                value={title}
                onChange={e => setTitle(e.target.value)} />
            <Filtered remove={remove} />
        </form>
    )
}

export default function App() {
    return (
        <Provider store={store}>
            <h1>Jōtai</h1>
            <TodoList />
        </Provider>
    )
}
