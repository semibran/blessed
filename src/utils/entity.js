import { Cell, World, FOV } from './index'

export default { create }

function create(options) {

  let entity = {
    entityType: null,
    kind: null
  }

  let props = {
    type: 'entity',
    wandering: true,
    health: 1,
    seeing: {},
    known: {},
    world: null,
    cell: null
  }

  Object.assign(entity, options, props)

  let path = null

  function look() {
    let cells = FOV.get(entity.world, entity.cell, 7)
    entity.seeing = {}
    if (!entity.known[entity.world.id])
      entity.known[entity.world.id] = {}
    for (var cell of cells) {
      let kind = entity.world.tileAt(cell).kind
      let other = entity.world.elementsAt(cell)[0]
      if (other)
        kind = other.kind
      entity.known[entity.world.id][cell] = kind
      entity.seeing[cell] = true
    }
  }

  function move(direction) {
    let moved = false
    let [cellX, cellY] = entity.cell
    let [distX, distY] = direction
    let target = [cellX + distX, cellY + distY]
    let tile = entity.world.tileAt(target)
    let elements = entity.world.elementsAt(target)
    let entities = elements.filter(element => element.type === 'entity')
    let items    = elements.filter(element => element.type === 'item')
    if (entities.length) {
      let enemy = entities[0]
      attack(enemy)
    } else if (tile.walkable) {
      if (!entities.length) {
        entity.cell = target
        if (items.length) {
          let item = items[0]
          entity.collect(item)
        } else {
          moved = true
        }
        look()
      }
    } else if (tile.door) {
      entity.world.setAt(target, World.tileIds.DOOR_OPEN)
      look()
    }
    return moved
  }

  function moveTo(target) {
    if ( !path || path[path.length - 1] !== target )
      path = entity.world.findPath(entity.cell, target)
    if (!path)
      return false
    let next
    path.some((cell, index) => {
      if ( !Cell.isEqual(entity.cell, cell) )
        return
      next = path[index + 1]
      return true
    })
    if (!next)
      return false
    let [cellX, cellY] = entity.cell
    let [nextX, nextY] = next
    let dist = [nextX - cellX, nextY - cellY]
    return entity.move(dist)
  }

  function attack(other) {
    other.health--
    if (other.health <= 0){
      entity.world.kill(other)
      look()
    }
  }

  function collect(item) {
    if ( Cell.isEqual(entity.cell, item.cell) ) {
      entity.world.kill(item)
      entity.world.emit('item', entity, item)
    }
  }

  let methods = { look, move, moveTo, attack, collect }
  return Object.assign(entity, methods)
}
