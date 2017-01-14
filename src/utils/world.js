import { Cell, Rect } from './index'

const tileData = [
  'floor walkable',
  'wall opaque',
  'door opaque door',
  'doorOpen walkable door',
  'doorSecret opaque door',
  'entrance walkable stairs',
  'exit walkable stairs'
]

const tiles = function (tileData) {
  let tiles = []
  let i = tileData.length
  while (i--) {
    let tile  = tiles[i] = { type: 'tile', id: i }
    let props = tileData[i].split(' ')
    let kind  = tile.kind = props.splice(0, 1)[0]
    for (let prop of props)
      tile[prop] = true
  }
  return tiles
}(tileData)

const tileIds = function (tiles) {
  let tileIds = {}
  let i = 0
  for (let tile of tiles) {
    let id = tile.kind.split('').reduce((result, char, index) => {
      let CHAR = char.toUpperCase()
      if (char === CHAR || !index)
        result[result.length] = ''
      result[result.length - 1] += CHAR
      return result
    }, []).join('_')
    tileIds[id] = i
    i++
  }
  return tileIds
}(tiles)

const { FLOOR, WALL, DOOR, DOOR_OPEN, DOOR_SECRET, ENTRANCE, EXIT } = tileIds

export default { create, tiles, tileIds }

function create(size, id) {

  let data  = new Uint8ClampedArray(size * size)
  let world = {

    // Properties
    size, data, elements: new Set, id: id || null, entrance: null, exit: null,

    // Methods
    getAt, tileAt, elementsAt, setAt, fill, clear, spawn, kill

  }

  return world

  function getAt(cell) {
    if (!Cell.isInside(cell, size))
      return null
    let index = Cell.toIndex(cell, size)
    return data[index]
  }

  function tileAt(cell) {
    return tiles[getAt(cell)]
  }

  function elementsAt(cell) {
    return [...world.elements].filter(element => Cell.isEqual(cell, element.cell))
  }

  function setAt(cell, value) {
    if (!Cell.isInside(cell, size))
      return null
    let index = Cell.toIndex(cell, size)
    data[index] = value
    return value
  }

  function fill(value, rect) {
    if (typeof value === 'undefined')
      value = WALL
    if (rect) {
      let cells = Rect.getCells(rect)
      for (let cell of cells)
        setAt(data, cell, value)
    } else {
      let i = data.length
      while (i--)
        data[i] = value
    }
    return world
  }

  function clear() {
    fill(FLOOR)
    return world
  }

  function spawn(element, cell) {
    if (!world.rooms || !element || !cell)
      return null
    if (element in tiles) {
      setAt(cell, element)
      if (element === ENTRANCE)
        world.entrance = cell
      if (element === EXIT)
        world.exit = cell
    } else if (typeof element === 'object') {
      element.world = world
      element.cell  = cell
      world.elements.add(element)
    }
    return cell
  }

  function kill(element) {
    elements.remove(element)
  }

}
