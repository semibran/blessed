import { RNG, FOV, Entity, World, Gen, Cell, Color } from './utils/index'

const blessed = require('blessed')

const options = { smartCSR: true }

let screen = blessed.screen(options)
screen.title = 'Hello world!'

let { BLACK, MAROON, GREEN, OLIVE, NAVY, PURPLE, TEAL, SILVER, GRAY: YELLOW, RED, LIME, YELLOW: GRAY, BLUE, FUCHSIA, AQUA, WHITE } = Color

const sprites = function () {

  const floor      = [183, TEAL]
  const wall       = ['#', OLIVE]
  const door       = ['+', MAROON]
  const doorOpen   = ['/', MAROON]
  const doorSecret = wall
  const entrance   = ['<', WHITE]
  const exit       = ['>', WHITE]
  const human      = ['@', WHITE]

  return { floor, wall, door, doorOpen, doorSecret, entrance, exit, human }

}()

function render(world, entity, mouse) {
  let view = ''
  let { data, size } = world
  let mouseX, mouseY
  if (mouse)
    [mouseX, mouseY] = mouse
  let y = size
  while (y--) {
    let row = data.slice(y * size, (y + 1) * size)
    let line = ''
    let x = 0
    for (let id of row) {
      let cell = [x, y]
      let char = ' ', color
      let type = World.tiles[id].name
      if (entity)
        type = entity.known[world.id][cell]
      if (type) {
        if ( !(type in sprites) ) {
          throw new TypeError('Unrecognized sprite: ' + type)
        }
        [char, color] = sprites[type]
        if (entity && !entity.seeing[cell])
          color = GRAY
      }
      if (typeof char === 'number')
        char = String.fromCharCode(char)
      if (color)
        if (x === mouseX && y === mouseY)
          char = `{black-fg}{${color}-bg}${char}{/}`
        else
          char = `{${color}-fg}${char}{/}`
      line += '{black-bg}' + char + '{/}'
      x++
    }
    view = line + view + '\n'
  }
  return view
}

let rng = RNG.create()

let floors = {}
let floor = 0
let world
let hero = Entity.create( { kind: 'human', faction: 'hero' } )
let mouse = null
let moving = false

function ascend() {
  let newFloor = floor - 1
  if (!floors[newFloor])
    log.add(`You can't leave the dungeon!`)
  else {
    floor = newFloor
    hero.world = world = floors[floor]
    hero.cell = world.exit
    hero.look()
    log.add(`You go back upstairs to floor ${floor}.`)
  }
  rerender()
}

function descend() {
  floor++
  if (!floors[floor]) {
    world = Gen.createDungeon(25, rng, hero, floor)
    hero.look()
    floors[floor] = world
    if (floor === 1)
      log.add(`Welcome to the Dungeon!`)
    else
      log.add(`You head downstairs to floor ${floor}.`)
  } else {
    hero.world = world = floors[floor]
    hero.cell = world.entrance
    hero.look()
    log.add(`You head back downstairs to floor ${floor}.`)
  }
  rerender()
}

function move(direction) {
  let moved = hero.move(direction)
  if (moved) {
    rerender()
  }
}

function rerender() {
  box.setContent(render(world, hero, mouse))
  screen.render()
}

let box = blessed.box({
  top: 'center',
  left: 'center',
  width: 25,
  height: 25,
  tags: true
})

let log = blessed.log({
  bottom: 0,
  width: '100%',
  height: 7,
  tags: true,
  border: {
    type: 'line'
  }
})

box.on('mousemove', event => {
  mouse = [event.x - box.aleft, event.y - box.atop]
  rerender()
})

box.on('click', event => {
  mouse = [event.x - box.aleft, event.y - box.atop]

  let target = [event.x - box.aleft, event.y - box.atop]

  if (Cell.isEqual(hero.cell, target)) {
    let tile = world.tileAt(hero.cell)
    if (tile.kind === 'entrance')
      ascend()
    else if (tile.kind === 'exit')
      descend()
    return
  }

  function move() {
    let moved = moving = hero.moveTo(target)
    if (moved)
      setTimeout(move, 1000 / 30)
    rerender()
  }
  move()

})

box.on('mouseout', event => {
  mouse = null
  rerender()
})

screen.on('keypress', (ch, key) => {

  if (key.name === 'escape' || key.ctrl && key.name === 'c')
    return process.exit(0)

  if (key.name in Cell.cardinalDirections && !moving)
    move(Cell.directions[key.name])

  let tile = world.tileAt(hero.cell)
  if (key.ch === '<' && tile.kind === 'entrance')
    ascend()
  else if (key.ch === '>' && tile.kind === 'exit')
    descend()

})

screen.append(box)
screen.append(log)

descend()
