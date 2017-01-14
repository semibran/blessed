import { RNG, Cell, Rect } from './index'

const [FLOOR, WALL, DOOR, DOOR_OPEN, DOOR_SECRET, ENTRANCE, EXIT] = [0, 1, 2, 3, 4, 5, 6]

const tiles = [
  {
    name: 'floor',
    walkable: true
  },
  {
    name: 'wall',
    opaque: true
  },
  {
    name: 'door',
    opaque: true,
    door: true
  },
  {
    name: 'doorOpen',
    walkable: true,
    door: true
  },
  {
    name: 'doorSecret',
    opaque: true,
    door: true
  },
  {
    name: 'entrance',
    walkable: true,
    stairs: true
  },
  {
    name: 'exit',
    walkable: true,
    stairs: true
  }
]

let rng = RNG.create()

let sqrt = function (cache) {

  cache = cache || {}

  return function sqrt(num) {
    let cached = cache[num]
    if (cached)
      return cached
    let result = cache[num] = Math.sqrt(num)
    return result
  }

}()

export default { tiles, createWorld, createDungeon, spawn, fill, clear, getSize, getAt, getTileAt, setAt, elementsAt, entitiesAt, itemsAt, openDoor, closeDoor }

function createWorld(size) {
  let data = new Uint8ClampedArray(size * size)
  let world = { size, data, entities: [], items: [], entrance: null, exit: null }
  return world
}

function createDungeon(size, seed) {

  if (!size % 2)
    throw new RangeError(`Cannot create dungeon of even size ${size}`)

  if (typeof seed === 'object') {
    rng = seed
    seed = rng.seed()
  } else if ( isNaN(seed) ) {
    seed = rng.get()
    rng.seed(seed)
  }

  console.log('Seed:', seed)

  let world = createWorld(size)

  let data = fill(world.data)

  let rooms = findRooms(data)
  let mazes = findMazes(data, rooms)
  let doors = findDoors(data, rooms, mazes)
  fillEnds(data, mazes)

  for (let room of rooms.list)
    for (let cell of room.cells)
      setAt(data, cell, FLOOR)

  for (let maze of mazes.list)
    for (let cell of maze.cells)
      setAt(data, cell, FLOOR)

  for (let cellId in doors) {
    let cell = Cell.fromString(cellId)
    let type = DOOR
    let regions = doors[cellId]
    let room = regions.sort((a, b) => a.neighbors.size - b.neighbors.size)[0]
    let neighbors = Cell.getNeighbors(cell).filter(neighbor => neighbor in mazes.ends)
    if (!neighbors.length && room.neighbors.size === 1 && rng.choose()) {
      type = DOOR_SECRET
      rooms.normal.delete(room)
      rooms.secret.add(room)
    } else if (rng.choose())
      type = FLOOR
    setAt(data, cell, type)
  }

  Object.assign(world, { rooms })

  spawn(world, EXIT, 'center')

  return world
}

let findRooms = function () {

  let findRoom = function () {

    return function findRoom(min, max, worldSize) {
      let w = findRoomSize(min, max)
      let h = findRoomSize(min, max)
      let x = findRoomPosition(w, worldSize)
      let y = findRoomPosition(h, worldSize)
      return [x, y, w, h]
    }

    function findRoomSize(min, max) {
      return rng.get((max - min) / 2 + 1) * 2 + min
    }

    function findRoomPosition(roomSize, worldSize) {
      return rng.get((worldSize - roomSize) / 2) * 2 + 1
    }

  }()

  return function findRooms(data) {
    let area = data.length
    let size = sqrt(area)
    let rooms = { list: [], normal: new Set, secret: new Set, cells: {}, edges: {} }
    let matrices = {}
    let fails = 0
    let valid = true
    while (valid) {
      let shape, matrix, cells, center
      do {
        shape  = 'rect'
        matrix = findRoom(3, 9, size)
        if (matrix in matrices)
          valid = false
        else {
          cells = Rect.getCells(matrix)
          center = Rect.getCenter(matrix)
          valid = matrices[matrix] = !isIntersecting(rooms, cells)
        }
        if (valid)
          break
        fails++
      } while (fails < size * 2)
      if (!valid)
        break
      let edges  = Rect.getEdges(matrix, true)
      let room = { type: 'room', shape, matrix, cells, edges, center }
      rooms.normal.add(room)
      rooms.list.push(room)
      for (let cell of cells)
        rooms.cells[cell] = room
      for (let edge of edges) {
        if (!rooms.edges[edge])
          rooms.edges[edge] = []
        let sharedEdges = rooms.edges[edge]
        sharedEdges.push(room)
      }
    }
    return rooms
  }

  function isIntersecting(rooms, cells) {
    for (let cell of cells)
      if (cell in rooms.cells)
        return true
    return false
  }

}()

let findMazes = function () {

  return function findMazes(data, rooms, step) {
    step = step || 2
    let size  = getSize(data)
    let mazes = { list: [], cells: {}, ends: {} }
    let nodes = new Set(findNodes(size)
      .filter(node => !(node in rooms.cells) && !Cell.getNeighbors(node, true).filter(neighbor => neighbor in rooms.cells).length)
      .map(Cell.toString))
    while (nodes.size) {
      let start = Cell.fromString(rng.choose( [...nodes] ))
      let stack = [start]
      let maze = { type: 'maze', cells: [], ends: [] }
      let backtracking = true
      while (stack.length) {
        let cell, [cellX, cellY] = cell = stack[stack.length - 1]
        addCell(mazes, maze, cell)
        nodes.delete(cell.toString())
        let neighbors = Cell.getNeighbors(cell, false, step).filter(neighbor => nodes.has(neighbor.toString()))
        if (neighbors.length) {
          let next = rng.choose(neighbors)
          let [nextX, nextY] = next
          let [cellX, cellY] = cell
          let mid, [midX, midY] = mid = [cellX + (nextX - cellX) / step, cellY + (nextY - cellY) / step]
          addCell(mazes, maze, mid)
          stack.push(next)
          backtracking = false
          if (cell === start && !backtracking)
            addEnd(mazes, maze, cell)
        } else {
          if (!backtracking)
            addEnd(mazes, maze, cell)
          backtracking = true
          stack.pop()
        }
      }
      mazes.list.push(maze)
    }
    return mazes
  }

  function findNodes(worldSize, offset) {
    offset = offset || 0
    let nodes = []
    let half = (worldSize - 1) / 2 - offset
    let i = half * half
    while (i--) {
      let [nodeX, nodeY] = Cell.fromIndex(i, half)
      let node = [nodeX * 2 + 1 + offset, nodeY * 2 + 1 + offset]
      let neighbors = null
      nodes.push(node)
    }
    return nodes
  }

  function addCell(mazes, maze, cell) {
    maze.cells.push(cell)
    mazes.cells[cell] = maze
  }

  function addEnd(mazes, maze, cell) {
    maze.ends.push(cell)
    mazes.ends[cell] = maze
  }

}()

let findDoors = function () {

  return function findDoors(data, rooms, mazes) {

    let connectorRegions = getConnectors(rooms, mazes)

    let start = rng.choose(rooms.list)
    let stack = [start]
    let doors = {}
    let mainRegion = new Set
    let dead = new Set

    let regions = rooms.list.concat(mazes.list)
    for (let region of regions) {
      region.neighbors = new Map
      region.doors = {}
    }

    while (stack.length) {
      let node = stack[stack.length - 1]
      mainRegion.add(node)

      let connectors
      if (node.type === 'room')
        connectors = node.edges.filter(cell => {
          if (!(cell in connectorRegions))
            return false
          let next = connectorRegions[cell].find(region => region !== node)
          return !dead.has(next) && next.cells.length > 1
        })
      else if (node.type === 'maze')
        connectors = node.cells.reduce((result, cell) => {
          return result.concat(Cell.getNeighbors(cell).filter(neighbor => neighbor in connectorRegions))
        }, [])
      connectors = connectors.filter(cell => {
        let next = connectorRegions[cell].find(region => region !== node)
        let nearby = Cell.getNeighbors(cell, true).filter(neighbor => neighbor in doors)
        return !(cell in doors) && !node.neighbors.has(next) && (!mainRegion.has(next) || rng.choose(10)) && !nearby.length
      })

      let connectorIds = connectors.map(Cell.toString)

      if (connectors.length) {
        let door = rng.choose(connectors)
        let regions = connectorRegions[door]
        let next = regions.find(region => region !== node)
        for (let cell of next.cells) {
          Cell.getNeighbors(cell).forEach(neighbor => {
            if (connectorIds.includes(neighbor.toString())) {
              delete connectorRegions[neighbor]
            }
          })
        }
        stack.push(next)
        doors[door] = regions
        mainRegion.add(node)
        connect(node, next, door)
      } else {
        stack.pop()
        if (node.type === 'maze' && node.neighbors.size === 1) {
          let next = node.neighbors.entries().next().value[0]
          let cell = node.neighbors.get(next)
          delete doors[cell]
          disconnect(node, next)
          mainRegion.delete(node)
          dead.add(node)
        }
      }
    }

    return doors

  }

  function getConnectors(rooms, mazes) {
    let connectorRegions = {}
    Object.keys(rooms.edges)
      .map(Cell.fromString)
      .filter(edge => edge[0] % 2 || edge[1] % 2)
      .forEach(edge => {
        let regions = Cell.getNeighbors(edge)
          .filter(neighbor => neighbor in rooms.cells || neighbor in mazes.cells)
             .map(neighbor =>   rooms.cells[neighbor] || mazes.cells[neighbor]  )
        if (regions.length >= 2)
          connectorRegions[edge] = regions
      })
    return connectorRegions
  }

  function connect(node, next, door) {
    connectOne(node, next, door)
    connectOne(next, node, door)
  }

  function connectOne(node, next, door) {
    node.neighbors.set(next, door)
    node.doors[door] = next
  }

  function disconnect(node, next) {
    disconnectOne(node, next)
    disconnectOne(next, node)
  }

  function disconnectOne(node, next) {
    let connector = node.neighbors.get(next)
    delete node.doors[connector]
  }

}()

let fillEnds = function () {

  return function fillEnds(data, mazes) {
    mazes.ends = {}
    for (let maze of mazes.list) {
      let cells = new Set(maze.cells.map(Cell.toString))
      let ends  = []
      let stack = maze.ends
      while (stack.length) {
        let cell = stack.pop()
        let neighbors = Cell.getNeighbors(cell).filter(neighbor => neighbor in mazes.cells || neighbor in maze.doors)
        if (neighbors.length > 1) {
          ends.push(cell)
          continue
        }
        setAt(data, cell, WALL)
        cells.delete(cell.toString())
        delete mazes.cells[cell]
        let next = neighbors[0]
        if (next)
          stack.unshift(next)
      }
      maze.cells = [...cells].map(Cell.fromString)
      maze.ends  = ends = ends
        .filter(cell => cell in mazes.cells && Cell.getNeighbors(cell).filter(neighbor => neighbor in mazes.cells).length === 1)
      ends.forEach(cell => mazes.ends[cell] = maze)
    }
  }

}()

function spawn(world, element, cell) {
  if (!world.rooms)
    return null
  if (typeof cell !== 'object') {
    let valid
    do {
      let room = rng.choose( [...world.rooms.normal] )
      if (cell !== 'center')
        cell = rng.choose(room.cells)
      else
        cell = room.center
    } while (elementsAt(world, cell).length && getAt(world.data, cell) === FLOOR)
  }
  if ( !isNaN(element) ) {
    setAt(world.data, cell, element)
    if (element === ENTRANCE)
      world.entrance = cell
    if (element === EXIT)
      world.exit = cell
  } else if (typeof element === 'object') {
    element.world = world
    element.cell  = cell
    getList(world, element).push(element)
  }
  return cell
}

function kill(world, element) {
  let list = getList(element)
  if (!list)
    return false
  let index = list.indexOf(element)
  if (index < 0)
    return false
  list.splice(index, 1)
  return true
}

function elementsAt(world, cell) {
  return entitiesAt(world, cell).concat(itemsAt(world, cell))
}

function entitiesAt(world, cell) {
  return world.entities.filter( entity => Cell.isEqual(entity.cell, cell) )
}

function itemsAt(world, cell) {
  return world.items.filter( item => Cell.isEqual(item.cell, cell) )
}

function getList(world, element) {
  switch (element.type) {
    case 'entity':
      return world.entities
    case 'item':
      return world.items
    default:
      return null
  }
}

function fill(data, value, rect) {
  if (typeof value === 'undefined')
    value = WALL
  let size = getSize(data)
  if (rect) {
    let cells = Rect.getCells(rect)
    for (let cell of cells)
      setAt(data, cell, value)
  } else {
    let i = data.length
    while (i--)
      data[i] = value
  }
  return data
}

function clear(data) {
  fill(data, FLOOR)
  return data
}

function getSize(data) {
  return sqrt(data.length)
}

function getAt(data, cell) {
  let size = getSize(data)
  if (!Cell.isInside(cell, size))
    return null
  let index = Cell.toIndex(cell, size)
  return data[index]
}

function getTileAt(data, cell) {
  return tiles[getAt(data, cell)]
}

function setAt(data, cell, value) {
  let size = getSize(data)
  if (!Cell.isInside(cell, size))
    return null
  let index = Cell.toIndex(cell, size)
  data[index] = value
  return value
}

function openDoor(world, cell, entity) {
  if (!entity)
    entity = null
  let data = world.data.slice()
  let tile = getTileAt(data, cell)
  if (tile.door && !tile.walkable) {
    setAt(data, cell, DOOR_OPEN)
    world.data = data
    return true
  }
  return false
}

function closeDoor(world, cell, entity) {
  if (!entity)
    entity = null
  let data = world.data.slice()
  let tile = getTileAt(data, cell)
  if (tile.door && tile.walkable) {
    setAt(data, cell, DOOR)
    world.data = data
    return true
  }
  return false
}

function toggleDoor(world, cell, entity) {
  let tile = getTileAt(world.data, cell)
  if (tile.door)
    if (!tile.walkable)
      return openDoor(world, cell, entity)
    else
      return closeDoor(world, cell, entity)
  return false
}
