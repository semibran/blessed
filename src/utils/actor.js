import { Cell, World, FOV } from './index'

const { FLOOR, WALL, DOOR, DOOR_OPEN, DOOR_SECRET, ENTRANCE, EXIT } = World.tileIds

export default { create }

function create(options) {

  let actor = {
    faction: null,
    kind: null,
    goal: null,
    speed: 1
  }

  let props = {
    type: 'actor',
    wandering: true,
    health: 1,
    energy: 0,
    hunger: 0,
    seeing: {},
    known: {},
    world: null,
    cell: null
  }

  Object.assign(actor, options, props, { look, perform, move, moveTo, attack, collect, open, close, descend, ascend })

  let path = null

  return actor

  function look() {
    let cells = FOV.get(actor.world, actor.cell, 7)
    actor.seeing = {}
    if (!actor.known[actor.worldId])
      actor.known[actor.worldId] = {}
    for (var cell of cells) {
      let kind = actor.world.tileAt(cell).kind
      let other = actor.world.elementsAt(cell)[0]
      if (other)
        kind = other.kind
      actor.known[actor.worldId][cell] = kind
      actor.seeing[cell] = true
    }
  }

  function move(direction) {
    let [cellX, cellY] = actor.cell
    let [distX, distY] = direction
    let target = [cellX + distX, cellY + distY]
    let tile = actor.world.tileAt(target)
    let elements = actor.world.elementsAt(target)
    let entities = elements.filter(element => element.type === 'actor')
    let items    = elements.filter(element => element.type === 'item')
    if (entities.length) {
      return entities[0]
    } else if (tile.walkable) {
      actor.cell = target
      return true
    } else if (tile.door) {
      return target
    }
    return false
  }

  function moveTo(target) {
    if ( !path || path[path.length - 1] !== target ) {
      let cells = {}
      // let entities = [...actor.world.elements].filter(element => element.type === 'actor')
      // actor.world.data.forEach((id, index) => {
      //   let cell = Cell.fromIndex(index, actor.world.size)
      //   if (!actor.known[actor.world.id][cell] || entities.filter(other => Cell.isEqual(other.cell, cell) && other !== actor).length)
      //     cells[cell] = Infinity
      // })
      path = actor.world.findPath(actor.cell, target, { cells })
    }
    if (!path)
      return false
    let next
    path.forEach((cell, index) => {
      if ( !Cell.isEqual(actor.cell, cell) )
        return
      next = path[index + 1]
      return true
    })
    if (!next)
      return false
    let [cellX, cellY] = actor.cell
    let [nextX, nextY] = next
    let dist = [nextX - cellX, nextY - cellY]
    return actor.move(dist)
  }

  function attack(other) {
    other.health--
    if (other.health <= 0){
      other.health = 0
      actor.world.kill(other)
      actor.world.elements.add({
        type: 'sprite',
        kind: 'corpse',
        cell: other.cell,
        origin: other.kind
      })
    }
  }

  function collect(item) {
    if (Cell.isEqual(actor.cell, item.cell))
      actor.world.kill(item)
  }

  function open(cell) {
    if (!Cell.isCell(cell) || !Cell.isNeighbor(cell, actor.cell))
      return false
    let tile = actor.world.tileAt(cell)
    if (!tile.door)
      return false
    actor.world.setAt(cell, DOOR_OPEN)
    return true
  }

  function close(cell) {
    if (!cell) {
      let neighbors = Cell.getNeighbors(actor.cell, true).filter(neighbor => actor.world.getAt(neighbor) === DOOR_OPEN)
      if (!neighbors.length)
        return false
      for (let neighbor of neighbors)
        actor.world.setAt(neighbor, DOOR)
      return true
    } else {
      if (!Cell.isCell(cell) || !Cell.isNeighbor(cell, actor.cell))
        return false
      let tile = actor.world.tileAt(cell)
      if (!tile.door)
        return false
      actor.world.setAt(cell, DOOR)
      return true
    }
  }

  function descend() {
    let id = actor.world.getAt(actor.cell)
    if (id === EXIT)
      return true
    return false
  }

  function ascend() {
    let id = actor.world.getAt(actor.cell)
    if (id === ENTRANCE)
      return true
    return false
  }

  function perform(action) {
    let { type, kind, data } = action
    if (type !== 'action')
      throw new TypeError(`Cannot perform action of type '${type}'`)
    switch (kind) {
      case 'move':    return move(...data)
      case 'moveTo':  return moveTo(...data)
      case 'attack':  return attack(...data)
      case 'collect': return collect(...data)
      case 'open':    return open(...data)
      case 'close':   return close(...data)
      case 'descend':    return descend(...data)
      case 'ascend':   return ascend(...data)
      case 'wait':    return true
    }
  }
}
