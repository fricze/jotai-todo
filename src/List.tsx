import { RefObject, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useSprings, animated } from '@react-spring/web'
import { useDrag } from 'react-use-gesture'
import clamp from 'lodash.clamp'
import swap from 'lodash-move'
import { atom, PrimitiveAtom, useAtom } from 'jotai'
import useResizeObserver from '@react-hook/resize-observer'

import { TodoItem, TodoFilter } from './interfaces';
import { activeAtom } from './model'
import { draggedAtom, filteredAtom, splitTodos, todosAtom } from './atoms'
import { useAtomValue, useUpdateAtom } from 'jotai/utils'

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

const onMouseUpAtom = atom([ () => {} ])

const Element = ({ atom }: { atom: PrimitiveAtom<TodoItem> }) => {
    const [ item, setItem ] = useAtom(atom)
    const elRef = useRef<HTMLDivElement>(null)
    const setOnMouseUp = useUpdateAtom(onMouseUpAtom)

    const adjustSize = () => {
        const height = elRef.current?.clientHeight || 0;
        const value = Math.round((height + 4) / 40)

        setItem(i => ({
            ...i,
            color: "#" + ((1 << 24) * Math.random() | 0).toString(16).padStart(6, "0"),
            duration: value * 30,
        }))
    }

    const height = ((item.duration || 0) / 30 * 40) - 4;


    return <div
        className="event-name"
        style={{ background: getColor(item), height }}
        onMouseDown={e => {
            setOnMouseUp([() => { adjustSize(); setOnMouseUp([() => {}]) }])
        }}
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

export const useWindowEvents = (events: string[], callback: EventListenerOrEventListenerObject): void => {
    useEffect(() => {
        // Bind the event listener
        events.forEach(event => {
            window.addEventListener(event, callback);
        });

        return () => {
            // Unbind the event listener on clean up
            events.forEach(event => {
                window.removeEventListener(event, callback);
            });
        };
    });
};

function DraggableList() {
    const [todos, _] = useAtom(todosAtom)
    const [split, __] = useAtom(splitTodos)
    const [___, setActive] = useAtom(draggedAtom)

    const [ onMouseUp ] = useAtomValue(onMouseUpAtom)

    useWindowEvents(['mouseup'], onMouseUp)

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
                    ><Element atom={split[i]} /></animated.div>
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
