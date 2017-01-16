import { Cell } from './index'

export default { create }

function create(rng) {

  return { getAction }

  function getAction(actor) {
    if (!actor.goal || Cell.isEqual(actor.cell, actor.goal)) {
      let room = rng.choose([...actor.world.rooms.normal])
      let cell
      do {
        cell = rng.choose(room.cells)
      } while (Cell.isEqual(actor.cell, cell))
      actor.goal = cell
    }
    return { type: 'action', kind: 'moveTo', data: [actor.goal] }
  }

}
