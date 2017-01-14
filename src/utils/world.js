import { Cell, Rect } from './index'

const tileData = [
  'floor walkable',
  'wall opaque',
  'door opaque door',
  'doorOpen walkable door',
  'doorSecret opaque door secret',
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

const tileCosts = function (tiles) {
  let tileCosts = []
  for (let tile of tiles) {
    let cost = 0
    if (!tile.walkable && !tile.door)
      cost = Infinity
    if (tile.secret)
      cost = 1000
    if (tile.door) {
      cost++
      if (!tile.walkable)
        cost++
    }
    tileCosts.push(cost)
  }
  return tileCosts
}(tiles)

const { FLOOR, WALL, DOOR, DOOR_OPEN, DOOR_SECRET, ENTRANCE, EXIT } = tileIds

export default { create, tiles, tileIds, tileCosts }

function create(size, id) {

  let data  = new Uint8ClampedArray(size * size)
  let world = {

    // Properties
    size, data, elements: new Set, id: id || null, entrance: null, exit: null,

    // Methods
    getAt, tileAt, elementsAt, setAt, fill, clear, spawn, kill, findPath

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

  function findPath(start, goal, costs, diagonals) {

    if (!costs)
      costs = {
        tiles: tileCosts,
        cells: {}
      }

    if (!costs.tiles)
      costs = {
        tiles: costs,
        cells: {}
      }

    let path = []

    let startKey = start.toString()
    let goalKey  = goal.toString()

    let opened = [startKey]
    let closed = {}

    let scores = { f: {}, g: {} }
    let parent = {}

    let cells = data.map((id, index) => Cell.fromIndex(index, size))
    for (let cell of cells) {
      scores.g[cell] = Infinity
      scores.f[cell] = Infinity
    }

    scores.g[start] = 0
    scores.f[start] = Cell.getManhattan(start, goal)

    while (opened.length) {
      if (opened.length > 1)
        opened = opened.sort( (a, b) => scores.f[b] - scores.f[a] )
      let cellKey = opened.pop()
      let cell = Cell.fromString(cellKey)
      if (cellKey === goalKey) {
        let cell = goal
        do {
          path.unshift(cell)
          cell = parent[cell]
        } while (cell)
        return path
      }
      closed[cell] = true
      for ( let neighbor of Cell.getNeighbors(cell, diagonals) ) {
        if (!Cell.isInside(neighbor, size) || neighbor in closed)
          continue
        let key = neighbor.toString()
        let tileCost = costs.tiles[getAt(neighbor)] || 0
        let cellCost = costs.cells[neighbor] || 0
        let cost = tileCost + cellCost
        if (cost === Infinity && key !== goalKey)
          continue
        let g = scores.g[cell] + 1 + cost
        if ( !opened.includes(key) )
          opened.push(key)
        else if ( g >= scores.g[neighbor] )
          continue
        parent[neighbor] = cell
        scores.g[neighbor] = g
        scores.f[neighbor] = g + Cell.getManhattan(neighbor, goal)
      }
    }

    return null

  }

}
