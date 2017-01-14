import { Cell, Gen, FOV } from './index'

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
    let cells = FOV.get(entity.world.data, entity.cell, 7)
    entity.seeing = {}
    for (var cell of cells) {
      let kind = Gen.getTileAt(entity.world.data, cell).name
      let other = Gen.elementsAt(entity.world, cell)[0]
      if (other)
        kind = other.kind
      entity.known[cell] = kind
      entity.seeing[cell] = true
    }
  }

  function move(direction) {
    let moved = false
    let world = entity.world
    let [cellX, cellY] = entity.cell
    let [distX, distY] = direction
    let target = [cellX + distX, cellY + distY]
    let id = Gen.getAt(world.data, target)
    let tile = Gen.tiles[id]
    let entities = Gen.entitiesAt(world, target)
    let items    = Gen.itemsAt(world, target)
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
      Gen.openDoor(world, target)
      look()
      moved = true
    }
    return moved
  }

  function moveTo(target) {
    if ( !path || path[path.length - 1] !== target )
      path = entity.world.findPath(entity, target)
    if (!path)
      return false
    let next
    path.some(function(cell, index) {
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
