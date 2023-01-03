import { useEffect, useRef, useState } from 'react'
import { useSprings, animated } from '@react-spring/web'
import { useDrag } from 'react-use-gesture'
import clamp from 'lodash.clamp'
import swap from 'lodash-move'
import { PrimitiveAtom, useAtom } from 'jotai'

const fn =
  (order: number[], active = false, originalIndex = 0, curIndex = 0, y = 0) => (index: number) =>
    active && index === originalIndex
      ? {
        y: curIndex * 40 + y,
        scale: 1.1,
        zIndex: 1,
        shadow: 15,
        immediate: (key: string) => key === 'y' || key === 'zIndex',
      }
      : {
        y: order.indexOf(index) * 40,
        scale: 1,
        zIndex: 0,
        shadow: 1,
        immediate: false,
      }


const Element = ({ atom }: { atom: PrimitiveAtom<{ title: string }> }) => {
  const [item] = useAtom(atom)

  return <div className="event-name">{item.title}</div>
}

function DraggableList({ items: _items }: { items: PrimitiveAtom<{ title: string }>[] }) {
  // Store indicies as a local ref, this represents the item order
  const [items, setItems] = useState(_items)
  const order = useRef(_items.map((_, index) => index))

  useEffect(() => {
    if (_items.length > order.current.length) {
      order.current.push(order.current.length)
    }

    setItems(_items)
  }, [_items])

  // Create springs, each corresponds to an item, controlling its transform, scale, etc.
  const [springs, api] = useSprings(items.length, fn(order.current))

  const bind = useDrag(({ args: [originalIndex], active, movement: [, y] }) => {
    const curIndex = order.current.indexOf(originalIndex)
    const curRow = clamp(Math.round(y / 40) + curIndex, 0, items.length - 1)
    const newOrder = swap(order.current, curIndex, curRow)

    // Feed springs new style data, they'll animate the view without causing a single render
    api.start(fn(newOrder, active, originalIndex, curIndex, y))

    if (!active) order.current = newOrder
  }, {
  })

  return (
    <div className={'content'} style={{ height: items.length * 50 }}>
      {springs.map(({ zIndex, shadow, y, scale }, i) => {
        return (
          <animated.div
            {...bind(i)}
            key={i}
            style={{
              zIndex,
              boxShadow: shadow.to(s => `rgba(0, 0, 0, 0.15) 0px ${s}px ${2 * s}px 0px`),
              y,
              scale,
            }}
            children={<Element atom={items[i]} />}
          />
        )
      })}
    </div>
  )
}

export function List({ items }: { items: PrimitiveAtom<{ title: string }>[] }) {
  return (
    <div className={'container'}>
      <DraggableList items={items} />
    </div>
  )
}
