import { RNG, World, Actor, Cell, Rect } from './index'

const { FLOOR, DOOR, DOOR_SECRET, ENTRANCE, EXIT } = World.tileIds

let rng = RNG.create()

export default { createDungeon }

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

  // console.log('Seed:', seed)

  let world = World.create(size).fill()
  let data = world.data

  let rooms = findRooms(size)
  let mazes = findMazes(size, rooms)
  let doors = findDoors(rooms, mazes)
  fillEnds(mazes)

  for (let room of rooms.list)
    for (let cell of room.cells)
      world.setAt(cell, FLOOR)

  for (let maze of mazes.list)
    for (let cell of maze.cells)
      world.setAt(cell, FLOOR)

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
    world.setAt(cell, type)
  }

  world.rooms = rooms

  function spawn(element, flags) {

    let rooms, cell

    if (!flags)
      flags = []
    else {
      if (typeof flags === 'string')
        flags = flags.split(' ')
      else if (Cell.isCell(flags)) {
        cell = flags
        flags = []
      }
    }
    flags = new Set(flags)

    if (!cell) {

      if (flags.has('secret'))
        rooms = [...world.rooms.secret]
      else
        rooms = [...world.rooms.normal]

      do {
        let room = rng.choose(rooms)
        if (flags.has('center'))
          cell = room.center
        else
          cell = rng.choose(room.cells)
      } while (world.getAt(cell) !== FLOOR || world.elementsAt(cell).length)

    }

    world.spawn(element, cell)

    return cell

  }

  let i = 3
  while (i--)
    spawn(Actor.create({ kind: 'wyrm', faction: 'enemies', speed: 1 / 2 }))

  spawn(ENTRANCE, 'center')
  spawn(EXIT, 'center')

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

  return function findRooms(size) {
    let area = size * size
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

  return function findMazes(size, rooms, step) {
    step = step || 2
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

  return function findDoors(rooms, mazes) {

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

  return function fillEnds(mazes) {
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
