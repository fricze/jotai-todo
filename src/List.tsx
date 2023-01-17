import { RefObject, SetStateAction, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useSprings, animated } from '@react-spring/web'
import { useDrag } from 'react-use-gesture'
import clamp from 'lodash.clamp'
import swap from 'lodash-move'
import { atom, PrimitiveAtom, useAtom, useSetAtom, useAtomValue } from 'jotai'
import useResizeObserver from '@react-hook/resize-observer'

import { TodoItem, TodoFilter } from './interfaces';
import { activeAtom } from './model'
import { draggedAtom, filteredAtom, splitTodos, todosAtom } from './atoms'
import { groupBy } from 'ramda'

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

const onMouseUpAtom = atom([() => {}])

const Element = ({ atom, setActive }: { atom: PrimitiveAtom<TodoItem>, setActive: () => void }) => {
  const setItems = useSetAtom(todosAtom)
  const [item, setItem] = useAtom(atom)
  const elRef = useRef<HTMLDivElement>(null)
  const setOnMouseUp = useSetAtom(onMouseUpAtom)

  const adjustSize = () => {
    const height = elRef.current?.clientHeight || 0;
    const value = Math.max(Math.round((height + 4) / 40), 1)

    setItem(i => ({
      ...i,
      duration: value * 30,
    }))
  }

  const height = ((item.duration || 0) / 30 * 40) - 4;

  return <animated.div
    draggable={true}
    onDragStart={() => {
      setActive()
    }}
    onDragEnd={() => {
      setItems(items => {
        let newItems = items.sort((a, b) => a.order - b.order)

        let value = newItems;
        let grouped;

        do {
          grouped = groupBy(a => String(a.order), value);
          value = Object.values(grouped).map(a => a.reduce((acc: TodoItem[], el, idx, arr) => [...acc, { ...el, order: el.order + (idx === 0 ? 0 : arr[idx - 1].duration / 30) }], [])).flat()
        } while (Object.values(grouped).some(a => a.length > 1))

        return value;
      })
    }}
    style={{
      boxShadow: `rgba(0, 0, 0, 0.15) 0px ${1}px ${2 * 1}px 0px`,
      y: item.order * 40,
    }}
  >
    <div
      className="event-name"
      style={{ background: getColor(item), height }}
      onMouseDown={() => {
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
  </animated.div>

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

  const [onMouseUp] = useAtomValue(onMouseUpAtom)

  useWindowEvents(['mouseup'], onMouseUp)

  return (
    <div className={'content'} style={{ height: todos.length * 50 }}>
      {todos.map((e, i) => {
        return (
          <Element atom={split[i]} key={e.id} setActive={() => setActive(i)} />
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
