import { RNG, Actor, AI, Cell, World, Gen } from './index'

let events = {}

const SUCCESS = true
const FAILURE = false
const { FLOOR, WALL, DOOR, DOOR_OPEN, DOOR_SECRET } = World.tileIds

export default { create }

function create(size) {

  let rng = RNG.create()
  let ai  = AI.create(rng)

  let index = 0

  let floor
  let world = { floors: {} }

  let hero

  let game = {
    rng, world, floor: 0, hero: null,
    start, on, off, input, emit
  }

  return game

  function start() {
    game.floor = 0
    game.hero = hero = Actor.create({ kind: 'human', faction: 'hero' })
    descend()
    return game
  }

  function tick() {
    let actor, actors = [...floor.elements].filter(element => element.type === 'actor')
    if (!actors.length)
      return
    while (hero.health) {
      index = index % actors.length
      actor = actors[index]
      if (actor.health) {
        if (actor.energy < 1)
          actor.energy += actor.speed
        while (actor.energy >= 1) {
          actor.look()
          let action = actor.action
          if (!action) {
            if (actor === hero) {
              emit('tick')
              return
            }
            action = ai.getAction(actor)
          }
          let { kind, data } = action
          let result = actor.perform(action)
          if (result !== SUCCESS) {
            if (!result || result === FAILURE) {
              emit(`${kind}-fail`, actor, ...data)
              return
            }
            if (result.type === 'actor') {
              actor.attack(result)
              kind = 'attack'
              data = [result]
            } else if (Cell.isCell(result)) {
              actor.open(result)
              kind = 'open'
              data = [result]
            }
          } else {
            if (kind === 'descend' || kind === 'ascend') {
              actor.action = null
              if (kind === 'descend')
                result = descend()
              else if (kind === 'ascend')
                result = ascend()
              if (result === FAILURE) {
                emit(`${kind}-fail`, actor, ...data)
                return
              }
            }
          }
          actor.action = null
          actor.energy--
          if (result !== FAILURE)
            emit(kind, actor, ...data)
        }
      }
      index++
    }
    hero.look()
    emit('tick')
  }

  function on(event, callback) {
    let callbacks = events[event]
    if (!callbacks)
      callbacks = events[event] = new Set
    callbacks.add(callback)
    return game
  }

  function off(event, callback) {
    let callbacks = events[event]
    if (!callbacks)
      return false
    callbacks.delete(callback)
    return true
  }

  function input(kind, ...data) {
    if (!hero.health)
      return false
    hero.action = { type: 'action', kind, data }
    tick()
    return true
  }

  function emit(event, ...data) {
    let callbacks = events[event]
    if (!callbacks)
      return
    for (let callback of callbacks)
      callback(...data)
  }

  function descend() {
    game.floor++
    if (world[game.floor])
      floor = world[game.floor]
    else {
      floor = Gen.createDungeon(size, rng)
      world[game.floor] = floor
    }
    hero.cell = floor.entrance
    hero.world = floor
    hero.worldId = game.floor
    floor.elements.add(hero)
    tick()
    return true
  }

  function ascend() {
    if (!world[game.floor - 1])
      return false
    game.floor--
    floor = world[game.floor]
    hero.cell = floor.exit
    hero.world = floor
    hero.worldId = game.floor
    tick()
    return true
  }

}
