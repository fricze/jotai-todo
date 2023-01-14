import { RefObject, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useSprings, animated } from '@react-spring/web'
import { useDrag } from 'react-use-gesture'
import clamp from 'lodash.clamp'
import swap from 'lodash-move'
import { PrimitiveAtom, useAtom } from 'jotai'
import useResizeObserver from '@react-hook/resize-observer'

import { TodoItem, TodoFilter } from './interfaces';
import { activeAtom } from './model'
import { draggedAtom, filteredAtom, todosAtom } from './atoms'

const springFn = (order: number[], active = false, originalIndex = 0, curIndex = 0, y = 0) => (index: number) => {
    if (active && index === originalIndex) {
        const newY = curIndex * 40 + y;

        return {
            y: newY < 0 ? 0 : newY > order.length * 40 ? order.length * 40 : newY,
            scale: 1.1,
            zIndex: 1,
            shadow: 15,
            immediate: (key: string) => key === 'y' || key === 'zIndex',
        }
    }

    return {
        y: order.indexOf(index) * 40,
        scale: 1,
        zIndex: 0,
        shadow: 1,
        immediate: false,
    }
}

type SetActive = (i: TodoItem) => any;

const getColor = (item: TodoItem): TodoItem['color'] => item.parent ? getColor(item.parent) : item.color;

const useSize = (target: RefObject<HTMLElement>) => {
    const [size, setSize] = useState<DOMRect>()

    useLayoutEffect(() => {
        setSize(target.current?.getBoundingClientRect())
    }, [target])

    // Where the magic happens
    useResizeObserver(target, (entry) => setSize(entry.contentRect))
    return size
}

const Element = ({ item }: { item: TodoItem }) => {
    const elRef = useRef<HTMLDivElement>(null)
    const size = useSize(elRef)

    const adjustSize = () => {
        const height = elRef.current?.clientHeight || 0;
        const diff = (height + 4) % 40;

        if (elRef.current) {
            const newHeight = height - diff;
            console.log(newHeight)
            elRef.current.style.height = `${newHeight}px`;
        }
    }
    /* onClick = {() => setActive(item)} */

    return <div
        className="event-name"
        style={{ background: getColor(item) }}
        onMouseUp={adjustSize}
        ref={elRef}>
        <div>
            {item.title}
        </div>

        {item.parent ? <div>
            {/* ↑ {item?.parent.substring(0, 6)} */}
            ↑ {item?.parent?.title}
        </div> : <div />}
    </div>
};

function move(arr: any[], from: number, to: number) {
    arr.splice(to, 0, arr.splice(from, 1)[0]);

    return arr;
};

function DraggableList() {
    const [todos, setTodos] = useAtom(todosAtom)
    const [_, setActive] = useAtom(draggedAtom)

    return (
        <div className={'content'} style={{ height: todos.length * 50 }}>
            {todos.map(({ order }, i) => {
                return (
                    <animated.div
                        draggable={true}
                        key={i}
                        onDragStart={e => {
                            setActive(() => i)
                        }}
                        style={{
                            boxShadow: `rgba(0, 0, 0, 0.15) 0px ${1}px ${2 * 1}px 0px`,
                            y: order * 40,
                        }}
                    ><Element item={todos[i]} /></animated.div>
                )
            })}
        </div>
    )
}

export function List() {
    return (
        <div className={'container'}>
            <DraggableList />
        </div>
    )
}
